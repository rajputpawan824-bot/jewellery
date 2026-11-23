'use strict';

const config = require('@config');
const { logSuccess, logError } = require('@utils/logger');

// Never write credentials or tokens to the log files.
const SENSITIVE_KEYS = new Set([
  'pin', 'mpin', 'confirm_mpin', 'old_mpin', 'new_mpin', 'password', 'otp',
  'access_token', 'refresh_token', 'reset_token', 'token', 'authorization',
]);

const redact = (value, depth = 0) => {
  if (value === null || typeof value !== 'object' || depth > 6) return value;
  if (Array.isArray(value)) return value.map((v) => redact(v, depth + 1));
  const out = {};
  for (const [key, v] of Object.entries(value)) {
    out[key] = SENSITIVE_KEYS.has(key.toLowerCase()) ? '[REDACTED]' : redact(v, depth + 1);
  }
  return out;
};

const getRequestSnapshot = (req) => ({
  body: redact(req.body ?? null),
  query: redact(req.query ?? null),
  params: req.params ?? null,
});

/**
 * The one response shape used by EVERY API (success and error):
 *   {
 *     "statusCode": 200,          // same as the HTTP status code
 *     "status": true,             // true = success, false = error
 *     "message": "...",           // ready to show to the user
 *     "data": { ... } | null,     // API result; null on error
 *     "errors": { field: "..." }  // only on errors that point to an input field
 *   }
 */
const buildResponse = (statusCode, message, data = null, errors = null) => ({
  statusCode,
  status: statusCode < 400,
  message,
  data: statusCode < 400 ? data : null,
  ...(errors ? { errors } : {}),
});

const writeLog = (req, statusCode, response, extra = {}) =>
  (statusCode < 400 ? logSuccess : logError)({
    method: req.method,
    url: req.originalUrl,
    statusCode,
    request: getRequestSnapshot(req),
    response: redact(response),
    ...extra,
  });

/**
 * Adds res.success / res.error. Every response goes through buildResponse and is logged
 * to logs/<date>/success|error (credentials and tokens redacted).
 */
const responseHandler = (req, res, next) => {
  res.success = (data = null, message = 'Success', statusCode = 200) => {
    const response = buildResponse(statusCode, message, data);
    writeLog(req, statusCode, response);
    return res.status(statusCode).json(response);
  };

  res.error = (message = 'Something went wrong. Please try again later.', statusCode = 500, errors = null) => {
    const response = buildResponse(statusCode, message, null, errors);
    writeLog(req, statusCode, response);
    return res.status(statusCode).json(response);
  };

  next();
};

/**
 * Catch-all 404 for URLs that do not match any API.
 */
const notFoundHandler = (req, res) =>
  res.error(`This API does not exist: ${req.method} ${req.originalUrl}. Please check the URL.`, 404);

/**
 * Global error middleware: keep as the last app.use().
 * Turns unexpected errors into the standard response; never leaks internals on the live server.
 */
// eslint-disable-next-line no-unused-vars
const globalErrorHandler = (err, req, res, next) => {
  let statusCode = Number(err.statusCode || err.status) || 500;
  let message;

  if (err.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'The request data is not valid JSON. Please check it and try again.';
  } else if (err.type === 'entity.too.large') {
    statusCode = 413;
    message = 'The request is too large. Please send less data.';
  } else if (statusCode >= 500) {
    statusCode = 500;
    message = config.isProduction ? 'Something went wrong on our side. Please try again later.' : err.message || 'Internal Server Error';
  } else {
    message = err.message || 'Something went wrong. Please try again.';
  }

  const response = buildResponse(statusCode, message);
  writeLog(req, statusCode, response, { stack: config.isProduction ? undefined : err.stack });
  if (!config.isProduction && statusCode >= 500) console.error(err);

  return res.status(statusCode).json(response);
};

module.exports = {
  buildResponse,
  responseHandler,
  notFoundHandler,
  globalErrorHandler,
};
