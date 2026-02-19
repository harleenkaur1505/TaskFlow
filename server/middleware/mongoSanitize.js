/**
 * MongoDB query injection prevention for Express 5.
 *
 * Express 5 makes req.query read-only (getter), so the npm
 * `express-mongo-sanitize` package does not work. This middleware
 * strips keys starting with `$` or containing `.` from req.body
 * and req.params (the mutable request properties that reach
 * Mongoose queries). req.query values are already strings from
 * the query-string parser and never passed raw into Mongoose
 * queries in this codebase — they go through parseInt / regex
 * construction, so they are safe.
 */

const hasDollarOrDot = (key) => key.startsWith('$') || key.includes('.');

const sanitize = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(sanitize);
  }

  const clean = {};
  for (const [key, value] of Object.entries(obj)) {
    if (hasDollarOrDot(key)) continue; // strip dangerous keys
    clean[key] = sanitize(value);
  }
  return clean;
};

const mongoSanitize = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitize(req.body);
  }
  if (req.params && typeof req.params === 'object') {
    // req.params is writable in Express 5 via route-level assignment
    for (const [key, value] of Object.entries(req.params)) {
      if (typeof value === 'string' && (value.startsWith('$') || value.includes('.'))) {
        req.params[key] = '';
      }
    }
  }
  next();
};

module.exports = mongoSanitize;
