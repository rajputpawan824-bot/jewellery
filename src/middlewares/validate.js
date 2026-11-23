'use strict';

/**
 * Validates req[property] against a Joi schema.
 * On failure responds 422 with { field: message }; on success replaces
 * req[property] with the cleaned value (trimmed, defaults applied, unknown keys removed).
 *
 * Usage: router.post('/login', validate(loginSchema), handle(login));
 */
const validate = (schema, property = 'body') => (req, res, next) => {
  const { value, error } = schema.validate(req[property] ?? {}, {
    abortEarly: false,
    stripUnknown: true,
    errors: { wrap: { label: false } },
  });

  if (error) {
    const errors = {};
    for (const detail of error.details) {
      const field = detail.path.join('.') || property;
      if (!errors[field]) errors[field] = detail.message;
    }
    // Main message = first problem, so the app can show it directly in a toast / alert
    return res.error(Object.values(errors)[0], 422, errors);
  }

  // Express 5 makes req.query a getter, so only body can be reassigned directly
  if (property === 'body') req.body = value;
  else req.validated = { ...(req.validated || {}), [property]: value };

  return next();
};

module.exports = validate;
