'use strict';

const express = require('express');
const { globalRateLimiter } = require('@middlewares/rateLimiter');
const {
  responseHandler,
  notFoundHandler,
  globalErrorHandler,
} = require('@middlewares/responseHandler');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(responseHandler);
app.use(globalRateLimiter);

app.get('/health', (req, res) => {
  return res.success({ server: 'running', uptime_seconds: Math.round(process.uptime()) }, 'Server is healthy');
});

app.use('/api/auth', require('@modules/auth/auth.routes'));

app.use(notFoundHandler);
app.use(globalErrorHandler);

module.exports = app;
