'use strict';

// =====================================================================================
//  ONE PLACE FOR ALL PROJECT SETTINGS
//  Change a value here (or set the matching key in .env) and the whole app uses it.
//  A value in .env always wins over the default written here.
// =====================================================================================

require('dotenv').config(); // reads the .env file so its values are available below

// Reads a number from .env; if it is missing or not a number, the default is used.
const num = (value, fallback) => (value === undefined || value === '' || Number.isNaN(Number(value)) ? fallback : Number(value));

const SECOND = 1000; // 1 second in milliseconds
const MINUTE = 60 * SECOND; // 1 minute in milliseconds
const HOUR = 60 * MINUTE; // 1 hour in milliseconds

const env = process.env.NODE_ENV || 'development'; // which mode the server runs in: development / test / production

const config = {
  // ---------------------------------------------------------------- APP
  env, // current mode (development / test / production)
  isProduction: env === 'production', // true only on the live server
  isDevelopment: env === 'development', // true on a developer's machine
  port: num(process.env.PORT, 3000), // port the API server listens on, e.g. http://localhost:3000

  app: {
    name: process.env.APP_NAME || "L'ATELIER", // brand name used in messages shown to customers
    countryCode: process.env.APP_COUNTRY_CODE || '+91', // country code added to every mobile number (the app does not ask for it)
  },

  // ---------------------------------------------------------------- DATABASE
  db: {
    host: process.env.DB_HOST || '127.0.0.1', // address of the MySQL / MariaDB server
    port: num(process.env.DB_PORT, 3306), // port of the database server
    name: process.env.DB_NAME || 'jewellery', // database name
    user: process.env.DB_USER || 'root', // database login user
    password: process.env.DB_PASSWORD || null, // database password (keep it only in .env)
    dialect: process.env.DB_DIALECT || 'mysql', // database type (mysql works for MariaDB too)
    pool: {
      max: num(process.env.DB_POOL_MAX, 50), // most database connections open at the same time
      min: num(process.env.DB_POOL_MIN, 0), // connections kept open even when idle
      acquire: num(process.env.DB_POOL_ACQUIRE_MS, 30 * SECOND), // give up if no connection is free within 30 seconds
      idle: num(process.env.DB_POOL_IDLE_MS, 10 * SECOND), // close a connection unused for 10 seconds
    },
  },

  // ---------------------------------------------------------------- LOGIN TOKENS
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET, // secret key that signs login tokens (keep it only in .env)
    refreshSecret: process.env.JWT_REFRESH_SECRET, // secret key that signs "stay logged in" tokens (keep it only in .env)
    accessTtl: process.env.JWT_ACCESS_TTL || '15m', // login token works for 15 minutes
    refreshTtl: process.env.JWT_REFRESH_TTL || '7d', // user stays logged in for 7 days
  },

  // ---------------------------------------------------------------- CREATE ACCOUNT / LOGIN
  auth: {
    bcryptRounds: num(process.env.BCRYPT_ROUNDS, 10), // strength of MPIN encryption (higher = safer but slower)
    loginMaxAttempts: num(process.env.LOGIN_MAX_ATTEMPTS, 5), // wrong logins allowed for one mobile number ...
    loginWindowMs: num(process.env.LOGIN_WINDOW_MS, 15 * MINUTE), // ... within 15 minutes, then the user must wait
    registerMaxAccounts: num(process.env.REGISTER_MAX_ACCOUNTS, 10), // new accounts allowed from one network ...
    registerWindowMs: num(process.env.REGISTER_WINDOW_MS, 1 * HOUR), // ... within 1 hour
  },

  // ---------------------------------------------------------------- FORM RULES (Create Account / Login screens)
  validation: {
    fullNameMinLength: 2, // full name must have at least 2 letters
    fullNameMaxLength: 150, // full name can have at most 150 characters
    mobileLength: 10, // mobile number must be exactly 10 digits
    emailMaxLength: 190, // email address can have at most 190 characters
    mpinLength: 4, // MPIN must be exactly 4 digits ("Four Digit Pin" on the screen)
  },

  // ---------------------------------------------------------------- OTP (Forgot PIN)
  otp: {
    length: 6, // OTP has 6 digits (6 boxes on the Verify OTP screen)
    expiresInSeconds: num(process.env.OTP_EXPIRES_IN_SECONDS, 90), // OTP works for 1 minute 30 seconds
    resendAfterSeconds: num(process.env.OTP_RESEND_AFTER_SECONDS, 30), // wait 30 seconds before "Resend Code" ("Resend OTP in 00:30")
    maxSendsPerHour: num(process.env.OTP_MAX_SENDS_PER_HOUR, 5), // at most 5 OTPs for one mobile number ...
    sendsWindowMs: 1 * HOUR, // ... within 1 hour
    maxVerifyAttempts: num(process.env.OTP_MAX_VERIFY_ATTEMPTS, 5), // wrong tries allowed for one OTP, then a new OTP is needed
    resetTokenTtlSeconds: num(process.env.MPIN_RESET_TOKEN_TTL_SECONDS, 10 * 60), // after a correct OTP, the new MPIN must be set within 10 minutes
    ipMaxRequests: num(process.env.OTP_IP_MAX_REQUESTS, 10), // OTP requests allowed from one network (all numbers together) ...
    ipWindowMs: num(process.env.OTP_IP_WINDOW_MS, 15 * MINUTE), // ... within 15 minutes
    purposes: {
      login: 'LOGIN', // saved in otp_verifications.purpose for the Login flow
      resetMpin: 'RESET_PIN', // saved in otp_verifications.purpose for the Forgot PIN flow
    },
  },

  // ---------------------------------------------------------------- GENERAL REQUEST LIMIT (all APIs)
  rateLimit: {
    windowMs: num(process.env.RATE_LIMIT_WINDOW_MS, 15 * MINUTE), // time window for the overall limit (15 minutes)
    max: num(process.env.RATE_LIMIT_MAX, 100), // requests allowed from one network in that window
  },

  // ---------------------------------------------------------------- ORDERS
  order: {
    panRequiredFromInr: num(process.env.PAN_REQUIRED_FROM_INR, 200000), // PAN card is required for orders of Rs 2,00,000 or more
  },
};

module.exports = config;
