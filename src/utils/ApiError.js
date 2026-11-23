'use strict';

/**
 * Error a controller throws to send a user-friendly error response.
 *
 * Usage: throw new ApiError('This mobile number is not registered.', 404, { mobile: 'Not registered.' });
 *
 * - message   : shown to the user (toast / alert)
 * - statusCode: HTTP status, e.g. 400, 401, 404, 409, 422, 429
 * - errors    : optional { field: message } for the input boxes
 * - headers   : optional extra response headers, e.g. { 'Retry-After': '30' }
 */
class ApiError extends Error {
  constructor(message, statusCode = 400, errors = null, headers = null) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errors = errors;
    this.headers = headers;
  }
}

module.exports = ApiError;
