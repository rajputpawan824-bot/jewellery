'use strict';

const crypto = require('crypto');
const config = require('@config');

/**
 * Creates an OTP and sends it by SMS to the given mobile number.
 * Returns the OTP so the caller can save its hash or (for now) show it in the response.
 *
 * Usage: const otp = await sendOtp('9876543210');
 *
 * Right now there is no SMS provider, so nothing is actually sent.
 * TODO: call the SMS provider (MSG91 / Twilio / Gupshup ...) where marked below.
 */
const sendOtp = async (mobile) => {
  // Random digits from a secure source; padStart keeps leading zeros, e.g. "048213"
  const otp = String(crypto.randomInt(0, 10 ** config.otp.length)).padStart(config.otp.length, '0');

  // TODO: send the SMS here, e.g. await smsProvider.send(`${config.app.countryCode}${mobile}`, `Your OTP is ${otp}`);
  if (!config.isProduction) console.log(`[DEV] OTP for ${config.app.countryCode} ${mobile}: ${otp}`);

  return otp;
};

module.exports = sendOtp;
