'use strict';

const Joi = require('joi');
const config = require('@config');

// Joi schemas for the auth screens, applied with the validate() middleware.
// All lengths come from config.validation / config.otp, so the messages always match the rules.
// Country code is not asked on the screen (it is fixed in config.app.countryCode), so it is not accepted here.

const { fullNameMinLength, fullNameMaxLength, mobileLength, emailMaxLength, mpinLength } = config.validation;
const otpLength = config.otp.length;
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Mobile Number: exact length, starting with 6-9 (Indian numbers).
// Spaces / dashes and a leading country code (+91) or 0 are removed.
const mobile = Joi.string()
  .trim()
  .replace(/[\s-]/g, '')
  .replace(new RegExp(`^(${escapeRegex(config.app.countryCode)}|0)(?=\\d{${mobileLength}}$)`), '')
  .pattern(/^\d+$/)
  .length(mobileLength)
  .custom((value, helpers) => (/^[6-9]/.test(value) ? value : helpers.error('mobile.start')))
  .required()
  .messages({
    'any.required': 'Please enter your mobile number.',
    'string.empty': 'Please enter your mobile number.',
    'string.base': 'Please enter your mobile number.',
    'string.pattern.base': 'Mobile number can only contain digits.',
    'string.length': `Mobile number must be exactly ${mobileLength} digits.`,
    'mobile.start': 'Please enter a valid mobile number. It should start with 6, 7, 8 or 9.',
  });

// Four Digit Pin (MPIN). Kept as a string so a leading zero ("0482") is not lost.
const mpin = Joi.string()
  .trim()
  .required()
  .pattern(new RegExp(`^\\d{${mpinLength}}$`))
  .messages({
    'any.required': `Please set your ${mpinLength} digit MPIN.`,
    'string.empty': `Please set your ${mpinLength} digit MPIN.`,
    'string.base': 'MPIN must be sent as text, for example "4826".',
    'string.pattern.base': `MPIN must be exactly ${mpinLength} digits.`,
  });

// New MPIN (Create Account / Create New PIN): same rules + no single repeated digit like 1111
const strongMpin = mpin.pattern(new RegExp(`^(\\d)\\1{${mpinLength - 1}}$`), { invert: true, name: 'repeated' }).messages({
  'string.pattern.invert.name': `MPIN cannot be the same digit ${mpinLength} times (like ${'1'.repeat(mpinLength)}). Please choose a stronger MPIN.`,
});

const registerSchema = Joi.object({
  full_name: Joi.string()
    .trim()
    .replace(/\s+/g, ' ')
    .min(fullNameMinLength)
    .max(fullNameMaxLength)
    .pattern(/^[\p{L}][\p{L} .'-]*$/u)
    .required()
    .messages({
      'any.required': 'Please enter your full name.',
      'string.empty': 'Please enter your full name.',
      'string.base': 'Please enter your full name.',
      'string.min': `Full name must have at least ${fullNameMinLength} letters.`,
      'string.max': `Full name can be at most ${fullNameMaxLength} characters.`,
      'string.pattern.base': 'Full name can only contain letters, spaces, dots and hyphens.',
    }),

  mobile,

  email: Joi.string()
    .trim()
    .lowercase()
    .max(emailMaxLength)
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'any.required': 'Please enter your email address.',
      'string.empty': 'Please enter your email address.',
      'string.base': 'Please enter your email address.',
      'string.email': 'Please enter a valid email address, for example name@example.com.',
      'string.max': 'Email address is too long.',
    }),

  mpin: strongMpin,

  // Checkbox: must be the boolean true. false (or "true" as text) is not accepted.
  is_terms_accepted: Joi.boolean().strict().required().valid(true).messages({
    'any.required': 'Please accept the Terms & Conditions and Privacy Policy to create your account.',
    'boolean.base': 'is_terms_accepted must be true or false.',
    'any.only': 'Please accept the Terms & Conditions and Privacy Policy to create your account.',
  }),
});

// Login: only the mobile number; an OTP is sent to it
const loginSchema = Joi.object({
  mobile,
});

// Forgot PIN screen: only the registered mobile number
const forgotMpinSendOtpSchema = Joi.object({
  mobile,
});

// Verify OTP screen: the OTP boxes are sent together as one string of digits
const forgotMpinVerifyOtpSchema = Joi.object({
  mobile,
  otp: Joi.string()
    .trim()
    .pattern(/^\d+$/)
    .length(otpLength)
    .required()
    .messages({
      'any.required': `Please enter the ${otpLength} digit OTP sent to your mobile number.`,
      'string.empty': `Please enter the ${otpLength} digit OTP sent to your mobile number.`,
      'string.base': 'OTP must be sent as text, for example "048213".',
      'string.pattern.base': 'OTP can only contain digits.',
      'string.length': `Please enter all ${otpLength} digits of the OTP.`,
    }),
});

// Verify OTP screen "Resend Code": same input as SEND OTP
const forgotMpinResendOtpSchema = forgotMpinSendOtpSchema;

// Create New PIN screen: reset_token comes from verify-otp; New PIN + Confirm PIN boxes
const forgotMpinResetSchema = Joi.object({
  reset_token: Joi.string().trim().required().messages({
    'any.required': 'Your session has expired. Please verify the OTP again to set a new MPIN.',
    'string.empty': 'Your session has expired. Please verify the OTP again to set a new MPIN.',
    'string.base': 'Your session has expired. Please verify the OTP again to set a new MPIN.',
  }),
  new_mpin: strongMpin.messages({
    'any.required': `Please enter your new ${mpinLength} digit MPIN.`,
    'string.empty': `Please enter your new ${mpinLength} digit MPIN.`,
  }),
  confirm_mpin: Joi.string().trim().required().valid(Joi.ref('new_mpin')).messages({
    'any.required': 'Please confirm your new MPIN.',
    'string.empty': 'Please confirm your new MPIN.',
    'string.base': 'MPIN must be sent as text, for example "4826".',
    'any.only': 'New PIN and Confirm PIN do not match. Please enter the same MPIN in both.',
  }),
});

module.exports = {
  registerSchema,
  loginSchema,
  forgotMpinSendOtpSchema,
  forgotMpinResendOtpSchema,
  forgotMpinVerifyOtpSchema,
  forgotMpinResetSchema,
};
