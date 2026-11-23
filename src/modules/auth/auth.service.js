'use strict';

const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const config = require('@config');
const { UserSession } = require('@models');

// Helpers shared by the auth controller.

const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex');

// The app only serves India, so the country code is fixed (the screen shows +91 and does not ask).
const COUNTRY_CODE = config.app.countryCode;

// Fields that are safe to send to the client
const toPublicUser = (user) => ({
  id: user.id,
  full_name: user.full_name,
  country_code: user.country_code,
  mobile: user.mobile,
  mobile_verified: !!user.mobile_verified_at,
  email: user.email ?? null,
  email_verified: !!user.email_verified_at,
  is_terms_accepted: !!user.is_terms_accepted,
  customer_type: user.customer_type,
  status: user.status,
});

// Saves a user_sessions row (refresh token stored only as a hash) and returns the token pair.
const createTokens = async (user, ip, transaction) => {
  const refreshToken = jwt.sign({ sub: String(user.id), type: 'refresh' }, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshTtl,
    jwtid: crypto.randomUUID(),
  });
  const refreshExpiresAt = new Date(jwt.decode(refreshToken).exp * 1000);

  const session = await UserSession.create(
    {
      user_id: user.id,
      refresh_token_hash: sha256(refreshToken),
      ip_address: ip ? String(ip).slice(0, 45) : null,
      expires_at: refreshExpiresAt,
    },
    { transaction }
  );

  const accessToken = jwt.sign(
    { sub: String(user.id), sid: String(session.id), type: 'access' },
    config.jwt.accessSecret,
    { expiresIn: config.jwt.accessTtl }
  );

  return {
    token_type: 'Bearer',
    access_token: accessToken,
    access_token_expires_at: new Date(jwt.decode(accessToken).exp * 1000).toISOString(),
    refresh_token: refreshToken,
    refresh_token_expires_at: refreshExpiresAt.toISOString(),
  };
};

// (OTP create / verify lives in src/utils/otp.js)

// 9876543210 -> "+91 ******3210" (shown on the Verify OTP screen)
const maskMobile = (mobile) => `${COUNTRY_CODE} ${'*'.repeat(mobile.length - 4)}${mobile.slice(-4)}`;

// Fingerprint of the current MPIN hash. Once the MPIN changes, the fingerprint changes,
// so a reset token can be used only once (no extra database column needed).
const mpinFingerprint = (mpinHash) => sha256(`mpin:${mpinHash || ''}`).slice(0, 16);

// Short-lived token returned after a correct OTP; the "Create New PIN" step must send it back.
// `user` must be loaded with User.scope('withMpin') so the fingerprint can be made.
const createMpinResetToken = (user, otpId) =>
  jwt.sign(
    { sub: String(user.id), otp_id: String(otpId), fp: mpinFingerprint(user.mpin_hash), type: 'mpin_reset' },
    config.jwt.accessSecret,
    { expiresIn: config.otp.resetTokenTtlSeconds }
  );

// Checks a reset token. Returns { userId, fingerprint } or { error: 'expired' | 'invalid' }.
const readMpinResetToken = (token) => {
  try {
    const payload = jwt.verify(token, config.jwt.accessSecret);
    if (payload.type !== 'mpin_reset') return { error: 'invalid' };
    return { userId: payload.sub, fingerprint: payload.fp };
  } catch (err) {
    return { error: err.name === 'TokenExpiredError' ? 'expired' : 'invalid' };
  }
};

module.exports = {
  COUNTRY_CODE,
  toPublicUser,
  createTokens,
  maskMobile,
  mpinFingerprint,
  createMpinResetToken,
  readMpinResetToken,
};
