'use strict';

const express = require('express');
const validate = require('@middlewares/validate');
const handle = require('@utils/handle'); // runs a controller with ({ body, params, query }) and sends its result
const { loginRateLimiter, registerRateLimiter, otpRateLimiter } = require('@middlewares/rateLimiter');
const {
  register,
  login,
  sendForgotMpinOtp,
  resendForgotMpinOtp,
  verifyForgotMpinOtp,
  resetForgotMpin,
} = require('@modules/auth/auth.controller');
const {
  registerSchema,
  loginSchema,
  forgotMpinSendOtpSchema,
  forgotMpinResendOtpSchema,
  forgotMpinVerifyOtpSchema,
  forgotMpinResetSchema,
} = require('@modules/auth/auth.validation');

const router = express.Router();

router.post('/register', registerRateLimiter, validate(registerSchema), handle(register));
router.post('/login', otpRateLimiter, loginRateLimiter, validate(loginSchema), handle(login)); // sends an OTP, so the OTP limit applies too

// Forgot PIN flow: send OTP -> (resend OTP) -> verify OTP
router.post('/forgot-mpin/send-otp', otpRateLimiter, validate(forgotMpinSendOtpSchema), handle(sendForgotMpinOtp));
router.post('/forgot-mpin/resend-otp', otpRateLimiter, validate(forgotMpinResendOtpSchema), handle(resendForgotMpinOtp));
router.post('/forgot-mpin/verify-otp', validate(forgotMpinVerifyOtpSchema), handle(verifyForgotMpinOtp));
router.post('/forgot-mpin/reset-mpin', validate(forgotMpinResetSchema), handle(resetForgotMpin)); // Create New PIN screen

module.exports = router;
