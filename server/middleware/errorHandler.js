const ApiError = require('../utils/ApiError');

const errorHandler = (err, req, res, next) => {
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      error: {
        message: messages.join('. '),
        code: 'VALIDATION_ERROR',
        status: 400,
      },
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(409).json({
      error: {
        message: `A record with that ${field} already exists`,
        code: 'DUPLICATE_KEY',
        status: 409,
      },
    });
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    return res.status(400).json({
      error: {
        message: 'Invalid ID format',
        code: 'INVALID_ID',
        status: 400,
      },
    });
  }

  // Known operational error (ApiError)
  if (err instanceof ApiError) {
    return res.status(err.status).json({
      error: {
        message: err.message,
        code: err.code,
        status: err.status,
      },
    });
  }

  // Unknown / unexpected error
  console.error('Unexpected error:', err);

  const status = err.status || 500;
  const message =
    process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message || 'Internal server error';

  res.status(status).json({
    error: {
      message,
      code: 'INTERNAL_ERROR',
      status,
    },
  });
};

module.exports = errorHandler;
