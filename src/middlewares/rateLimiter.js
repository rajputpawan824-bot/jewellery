'use strict';

const { rateLimit, ipKeyGenerator } = require('express-rate-limit');
const config = require('@config');
const { buildResponse } = require('@middlewares/responseHandler');

// NOTE: counters are kept in server memory. They reset when the server restarts, and with
// more than one server instance each instance counts separately (use a Redis store then).

// Every limit reply uses the standard response: { statusCode: 429, status: false, message, data: null }
const sendLimitReached = (req, res, next, options) =>
  res.error ? res.error(options.message, options.statusCode) : res.status(options.statusCode).json(buildResponse(options.statusCode, options.message));


/**
 * GLOBAL LIMIT (every API)
 * - Limit : 100 requests per 15 minutes
 * - Per   : IP address (one network / device)
 * - Counts: every request, success or failure
 * - Config: config.rateLimit in src/config/index.js (RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS in .env)
 * - Reply : 429 "Too many requests from this network. Please wait a few minutes and try again."
 */
const globalRateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  handler: sendLimitReached,
  message: 'Too many requests from this network. Please wait a few minutes and try again.',
});

/**
 * LOGIN LIMIT  (POST /api/auth/login, together with the OTP LIMIT below)
 * - Limit : 5 wrong attempts per 15 minutes
 * - Per   : IP address + mobile number (other numbers from the same network are not blocked)
 * - Counts: only failed requests (unregistered number, wrong input); a successful one is not counted
 * - Why   : stops repeated failed tries for the same number (many different numbers are stopped by the OTP LIMIT)
 * - Config: config.auth.loginMaxAttempts / loginWindowMs (LOGIN_MAX_ATTEMPTS, LOGIN_WINDOW_MS in .env)
 * - Reply : 429 "Too many login attempts. Please try again after 15 minutes."
 */
const loginRateLimiter = rateLimit({
  windowMs: config.auth.loginWindowMs,
  limit: config.auth.loginMaxAttempts,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  keyGenerator: (req) => {
    const mobile = String(req.body?.mobile ?? '').replace(/\D/g, '');
    return `${ipKeyGenerator(req.ip)}:${mobile}`;
  },
  handler: sendLimitReached,
  message: `Too many login attempts. Please try again after ${Math.round(config.auth.loginWindowMs / 60000)} minutes.`,
});

/**
 * REGISTER LIMIT  (POST /api/auth/register)
 * - Limit : 10 new accounts per 1 hour
 * - Per   : IP address
 * - Counts: only successful sign-ups; form mistakes (422) and duplicates (409) are not counted
 * - Why   : stops one network from creating fake accounts in bulk
 * - Config: config.auth.registerMaxAccounts / registerWindowMs (REGISTER_MAX_ACCOUNTS, REGISTER_WINDOW_MS in .env)
 * - Reply : 429 "Too many accounts created from this network. Please try again after 60 minutes."
 */
const registerRateLimiter = rateLimit({
  windowMs: config.auth.registerWindowMs,
  limit: config.auth.registerMaxAccounts,
  skipFailedRequests: true, // only successful sign-ups count; form mistakes do not use up the limit
  standardHeaders: true,
  legacyHeaders: false,
  handler: sendLimitReached,
  message: `Too many accounts created from this network. Please try again after ${Math.round(config.auth.registerWindowMs / 60000)} minutes.`,
});

/**
 * OTP LIMIT  (POST /api/auth/login, /forgot-mpin/send-otp and /forgot-mpin/resend-otp)
 * - Limit : 10 OTP requests per 15 minutes
 * - Per   : IP address (all mobile numbers together)
 * - Counts: every request, success or failure
 * - Why   : every OTP is a paid SMS, so one network cannot trigger OTPs for many numbers
 * - Config: config.otp.ipMaxRequests / ipWindowMs (OTP_IP_MAX_REQUESTS, OTP_IP_WINDOW_MS in .env)
 * - Reply : 429 "Too many OTP requests from this network. Please try again after 15 minutes."
 *
 * The controller also applies these OTP rules per mobile number (values in config.otp / .env):
 * - 30 seconds gap between two OTPs        (OTP_RESEND_AFTER_SECONDS)
 * - max 5 OTPs per mobile in 1 hour        (OTP_MAX_SENDS_PER_HOUR)
 * - OTP valid for 1 minute 30 seconds      (OTP_EXPIRES_IN_SECONDS)
 * - max 5 wrong tries per OTP              (OTP_MAX_VERIFY_ATTEMPTS)
 */
const otpRateLimiter = rateLimit({
  windowMs: config.otp.ipWindowMs,
  limit: config.otp.ipMaxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  handler: sendLimitReached,
  message: `Too many OTP requests from this network. Please try again after ${Math.round(config.otp.ipWindowMs / 60000)} minutes.`,
});

module.exports = {
  globalRateLimiter,
  loginRateLimiter,
  registerRateLimiter,
  otpRateLimiter,
};
