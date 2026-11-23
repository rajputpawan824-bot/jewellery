'use strict';

// Controllers get ({ body, params, query, ip }) and never touch req / res.
// They return { message, data, statusCode } or throw ApiError; src/utils/handle.js sends the response.

const bcrypt = require('bcryptjs');
const { Op, UniqueConstraintError } = require('sequelize');
const config = require('@config');
const { User, UserSession, sequelize } = require('@models');
const ApiError = require('@utils/ApiError');
const formatDuration = require('@utils/formatDuration');
const { issueOtp, verifyOtp } = require('@utils/otp');
const {
  COUNTRY_CODE,
  toPublicUser,
  createTokens,
  maskMobile,
  mpinFingerprint,
  createMpinResetToken,
  readMpinResetToken,
} = require('@modules/auth/auth.service');

const { login: LOGIN_OTP, resetMpin: RESET_MPIN_OTP } = config.otp.purposes;

// Registered, not deleted and not blocked user for this mobile number (otherwise a friendly error).
// withMpin: true also loads mpin_hash (hidden by default).
const findActiveUser = async (mobile, { withMpin = false } = {}) => {
  const model = withMpin ? User.scope('withMpin') : User;
  const user = await model.findOne({ where: { country_code: COUNTRY_CODE, mobile } });
  if (!user || user.status === 'DELETED') {
    throw new ApiError('This mobile number is not registered with us. Please check the number or create a new account.', 404, {
      mobile: 'This mobile number is not registered.',
    });
  }
  if (user.status === 'BLOCKED') {
    throw new ApiError('Your account has been blocked. Please contact customer support for help.', 403);
  }
  return user;
};

// Success data + message for any "OTP sent" response
const otpSentResponse = (mobile, sent, { isResend = false, showOtp = !config.isProduction } = {}) => {
  const maskedMobile = maskMobile(mobile);
  const validFor = formatDuration(sent.expires_in_seconds);
  return {
    message: isResend
      ? `A new OTP has been sent to ${maskedMobile}. It is valid for ${validFor}. Your previous OTP will no longer work.`
      : `We've sent a ${sent.otp_length}-digit OTP to ${maskedMobile}. It is valid for ${validFor}.`,
    data: {
      mobile: maskedMobile,
      otp_length: sent.otp_length,
      expires_in_seconds: sent.expires_in_seconds,
      resend_after_seconds: sent.resend_after_seconds,
      // No SMS provider yet, so the OTP is returned for testing.
      ...(showOtp ? { otp: sent.otp } : {}),
    },
  };
};

// POST /api/auth/register
// Body: { full_name, mobile, email, mpin, is_terms_accepted }
const register = async ({ body, ip }) => {
  const { full_name, mobile, email, mpin, is_terms_accepted } = body;

  // Joi already blocks this; checked again so no account is ever saved without consent.
  if (is_terms_accepted !== true) {
    throw new ApiError('Please accept the Terms & Conditions and Privacy Policy to create your account.', 422, {
      is_terms_accepted: 'Please accept the Terms & Conditions and Privacy Policy to create your account.',
    });
  }

  // paranoid: false so a deleted account still blocks re-use of its mobile / email
  const existing = await User.findOne({
    where: { [Op.or]: [{ country_code: COUNTRY_CODE, mobile }, { email }] },
    attributes: ['mobile', 'email'],
    paranoid: false,
  });
  if (existing) {
    if (existing.mobile === mobile) {
      throw new ApiError('This mobile number is already registered. Please login instead.', 409, {
        mobile: 'This mobile number is already registered.',
      });
    }
    throw new ApiError('This email address is already registered. Please use a different email or login.', 409, {
      email: 'This email address is already registered.',
    });
  }

  const mpin_hash = await bcrypt.hash(mpin, config.auth.bcryptRounds);

  try {
    const data = await sequelize.transaction(async (transaction) => {
      const user = await User.create(
        {
          full_name,
          country_code: COUNTRY_CODE,
          mobile,
          email,
          mpin_hash,
          is_terms_accepted: true,
          terms_accepted_at: new Date(),
          last_login_at: new Date(),
        },
        { transaction }
      );
      return { user: toPublicUser(user), tokens: await createTokens(user, ip, transaction) };
    });

    return { statusCode: 201, message: `Your account has been created successfully. Welcome to ${config.app.name}!`, data };
  } catch (err) {
    // Two sign-ups with the same mobile / email at the same moment
    if (err instanceof UniqueConstraintError) {
      throw new ApiError('An account with this mobile number or email already exists. Please login instead.', 409);
    }
    throw err;
  }
};

// POST /api/auth/login
// Body: { mobile }
// Sends a login OTP to the registered mobile number. For now the OTP is also returned in the response.
const login = async ({ body }) => {
  const { mobile } = body;
  await findActiveUser(mobile);

  const sent = await issueOtp(mobile, LOGIN_OTP);
  return otpSentResponse(mobile, sent, { showOtp: true }); // otp shown always until SMS is connected
};

// POST /api/auth/forgot-mpin/send-otp   (Forgot PIN screen "SEND OTP")
// Body: { mobile }
const sendForgotMpinOtp = async ({ body }) => {
  await findActiveUser(body.mobile);
  const sent = await issueOtp(body.mobile, RESET_MPIN_OTP);
  return otpSentResponse(body.mobile, sent);
};

// POST /api/auth/forgot-mpin/resend-otp   (Verify OTP screen "Resend Code")
// Body: { mobile }
const resendForgotMpinOtp = async ({ body }) => {
  await findActiveUser(body.mobile);
  const sent = await issueOtp(body.mobile, RESET_MPIN_OTP, { isResend: true });
  return otpSentResponse(body.mobile, sent, { isResend: true });
};

// POST /api/auth/forgot-mpin/verify-otp   (Verify OTP screen "VERIFY")
// Body: { mobile, otp }
const verifyForgotMpinOtp = async ({ body }) => {
  const { mobile, otp } = body;

  // withMpin: the reset token stores a fingerprint of the current MPIN (makes the token single-use)
  const user = await findActiveUser(mobile, { withMpin: true });

  const record = await verifyOtp(mobile, RESET_MPIN_OTP, otp); // common check: valid 1.5 min, 5 wrong tries, single use

  // The OTP reached this phone, so the number is confirmed as the user's.
  if (!user.mobile_verified_at) await user.update({ mobile_verified_at: new Date() });

  return {
    message: 'OTP verified successfully. You can now set your new MPIN.',
    data: {
      mobile: maskMobile(mobile),
      reset_token: createMpinResetToken(user, record.id),
      reset_token_expires_in_seconds: config.otp.resetTokenTtlSeconds,
    },
  };
};

// POST /api/auth/forgot-mpin/reset-mpin   (Create New PIN screen "UPDATE PIN")
// Body: { reset_token, new_mpin, confirm_mpin }   (reset_token comes from verify-otp)
const resetForgotMpin = async ({ body }) => {
  const { reset_token, new_mpin } = body;

  const token = readMpinResetToken(reset_token);
  if (token.error === 'expired') {
    throw new ApiError('Your time to set a new MPIN has run out. Please verify the OTP again.', 401, {
      reset_token: 'Session expired.',
    });
  }
  if (token.error) {
    throw new ApiError('This request is not valid. Please start Forgot PIN again.', 401, { reset_token: 'Invalid session.' });
  }

  const user = await User.scope('withMpin').findByPk(token.userId);
  if (!user || user.status === 'DELETED') {
    throw new ApiError('This account could not be found. Please create a new account.', 404);
  }
  if (user.status === 'BLOCKED') {
    throw new ApiError('Your account has been blocked. Please contact customer support for help.', 403);
  }
  // The MPIN changed after this token was issued, so the token was already used
  if (token.fingerprint !== mpinFingerprint(user.mpin_hash)) {
    throw new ApiError('Your MPIN has already been changed with this request. Please start Forgot PIN again if needed.', 400, {
      reset_token: 'Already used.',
    });
  }
  // "Please ensure your new pin is secure and unique": must differ from the current MPIN
  if (user.mpin_hash && (await bcrypt.compare(new_mpin, user.mpin_hash))) {
    throw new ApiError('Your new MPIN cannot be the same as your old MPIN. Please choose a different MPIN.', 422, {
      new_mpin: 'Same as your old MPIN.',
    });
  }

  const mpin_hash = await bcrypt.hash(new_mpin, config.auth.bcryptRounds);
  await sequelize.transaction(async (transaction) => {
    await user.update({ mpin_hash }, { transaction });
    // Log out every device: anyone who knew the old MPIN loses access
    await UserSession.update({ revoked_at: new Date() }, { where: { user_id: user.id, revoked_at: null }, transaction });
  });

  return {
    message: 'Your MPIN has been updated successfully. Please sign in again.',
    data: { mobile: maskMobile(user.mobile) },
  };
};

module.exports = {
  register,
  login,
  sendForgotMpinOtp,
  resendForgotMpinOtp,
  verifyForgotMpinOtp,
  resetForgotMpin,
};
