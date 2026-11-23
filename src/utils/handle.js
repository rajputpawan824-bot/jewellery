'use strict';

const ApiError = require('@utils/ApiError');

/**
 * Connects a controller to Express, so controllers never touch req / res.
 *
 * Controller shape:
 *   const login = async ({ body, params, query, ip }) => {
 *     if (problem) throw new ApiError('Message for the user', 404);
 *     return { message: 'Message for the user', data: { ... }, statusCode: 200 };
 *   };
 *
 * Route: router.post('/login', validate(loginSchema), handle(login));
 *
 * - returned { message, data, statusCode = 200 } -> success response
 * - thrown ApiError                               -> error response with its status code
 * - any other error                               -> globalErrorHandler (500)
 */
const handle = (controller) => async (req, res, next) => {
  try {
    const result = (await controller({
      body: req.body,
      params: req.params,
      query: req.query,
      ip: req.ip,
      headers: req.headers,
    })) || {};

    return res.success(result.data ?? null, result.message || 'Success', result.statusCode || 200);
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.headers) res.set(err.headers);
      return res.error(err.message, err.statusCode, err.errors);
    }
    return next(err);
  }
};

module.exports = handle;
