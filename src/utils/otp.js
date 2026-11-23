'use strict';

// Common OTP logic for every flow (Login, Forgot PIN, ...).
//   issueOtp(mobile, purpose)       -> creates, saves and sends an OTP (30 s gap, 5 per hour)
//   verifyOtp(mobile, purpose, otp) -> checks the OTP and marks it used (valid 1.5 min, 5 wrong tries)
// `purpose` keeps flows apart: a Login OTP cannot be used for Forgot PIN. Values: config.otp.purposes
// Both throw ApiError with a user-friendly message when something is wrong.

const crypto = require('crypto');
const { Op } = require('sequelize');
const config = require('@config');
const { OtpVerification } = require('@models');
const ApiError = require('@utils/ApiError');
const sendOtp = require('@utils/sendOtp');
const formatDuration = require('@utils/formatDuration');

const otpConfig = config.otp;
const COUNTRY_CODE = config.app.countryCode;

// Keyed hash so a leaked otp_verifications table cannot be brute-forced back to OTPs.
const hashOtp = (otp, mobile) =>
  crypto.createHmac('sha256', config.jwt.accessSecret).update(`${mobile}:${otp}`).digest('hex');

const otpMatches = (otp, mobile, storedHash) => {
  const a = Buffer.from(hashOtp(otp, mobile), 'hex');
  const b = Buffer.from(storedHash, 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};

// Newest OTP for this mobile + purpose (only the newest one is ever valid)
const findLatestOtp = (mobile, purpose) =>
  OtpVerification.findOne({
    where: { country_code: COUNTRY_CODE, mobile, purpose },
    order: [['createdAt', 'DESC'], ['id', 'DESC']],
  });

/**
 * Creates, saves and sends a new OTP. Sending a new OTP makes the previous one useless.
 * isResend = true for the "Resend Code" link (needs an earlier OTP).
 * Returns { otp, otp_length, expires_in_seconds, resend_after_seconds }.
 */
const issueOtp = async (mobile, purpose, { isResend = false } = {}) => {
  const lastOtp = await findLatestOtp(mobile, purpose);

  if (isResend && !lastOtp) {
    throw new ApiError('No OTP has been sent to this number yet. Please request an OTP first.', 400, {
      otp: 'Please request an OTP first.',
    });
  }

  // "Resend OTP in 00:30": one OTP per 30 seconds
  if (lastOtp) {
    const waitSeconds = otpConfig.resendAfterSeconds - Math.floor((Date.now() - lastOtp.createdAt.getTime()) / 1000);
    if (waitSeconds > 0) {
      throw new ApiError(
        `Please wait ${waitSeconds} seconds before requesting a new OTP.`,
        429,
        { otp: `You can resend the OTP in ${waitSeconds} seconds.` },
        { 'Retry-After': String(waitSeconds) }
      );
    }
  }

  // At most 5 OTPs per hour for one mobile number and purpose
  const sentRecently = await OtpVerification.count({
    where: {
      country_code: COUNTRY_CODE,
      mobile,
      purpose,
      createdAt: { [Op.gte]: new Date(Date.now() - otpConfig.sendsWindowMs) },
    },
  });
  if (sentRecently >= otpConfig.maxSendsPerHour) {
    throw new ApiError(
      `You have requested too many OTPs. Please try again after ${formatDuration(otpConfig.sendsWindowMs / 1000)}.`,
      429
    );
  }

  const otp = await sendOtp(mobile);
  await OtpVerification.create({
    country_code: COUNTRY_CODE,
    mobile,
    purpose,
    otp_hash: hashOtp(otp, mobile),
    expires_at: new Date(Date.now() + otpConfig.expiresInSeconds * 1000),
  });

  return {
    otp,
    otp_length: otpConfig.length,
    expires_in_seconds: otpConfig.expiresInSeconds,
    resend_after_seconds: otpConfig.resendAfterSeconds,
  };
};

/**
 * Checks the OTP for this mobile + purpose and marks it used.
 * Valid only if it is the newest OTP, not used, not older than 1.5 minutes and under 5 wrong tries.
 * Returns the used otp_verifications row; throws ApiError otherwise.
 */
const verifyOtp = async (mobile, purpose, otp) => {
  const record = await findLatestOtp(mobile, purpose);

  if (!record) {
    throw new ApiError('No OTP has been sent to this number yet. Please request an OTP first.', 400, {
      otp: 'Please request an OTP first.',
    });
  }
  if (record.consumed_at) {
    throw new ApiError('This OTP has already been used. Please tap "Resend Code" to get a new OTP.', 400, {
      otp: 'OTP already used.',
    });
  }
  if (new Date(record.expires_at) < new Date()) {
    throw new ApiError('This OTP has expired. Please tap "Resend Code" to get a new one.', 400, { otp: 'OTP has expired.' });
  }
  if (record.attempts >= otpConfig.maxVerifyAttempts) {
    throw new ApiError('You have entered a wrong OTP too many times. Please tap "Resend Code" to get a new OTP.', 429, {
      otp: 'Too many wrong attempts.',
    });
  }

  if (!otpMatches(otp, mobile, record.otp_hash)) {
    await record.increment('attempts');
    const attemptsLeft = otpConfig.maxVerifyAttempts - (record.attempts + 1);
    throw new ApiError(
      attemptsLeft > 0
        ? `The OTP you entered is incorrect. You have ${attemptsLeft} ${attemptsLeft === 1 ? 'attempt' : 'attempts'} left.`
        : 'You have entered a wrong OTP too many times. Please tap "Resend Code" to get a new OTP.',
      400,
      { otp: 'Incorrect OTP.' }
    );
  }

  // Mark used only if still unused, so the same OTP can never be accepted twice (even at the same moment).
  const [updated] = await OtpVerification.update(
    { consumed_at: new Date() },
    { where: { id: record.id, consumed_at: null } }
  );
  if (!updated) {
    throw new ApiError('This OTP has already been used. Please tap "Resend Code" to get a new OTP.', 400, {
      otp: 'OTP already used.',
    });
  }

  return record;
};

module.exports = { issueOtp, verifyOtp };
