const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'Access token is required', 'AUTH_REQUIRED');
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id };
    next();
  } catch (error) {
    if (error instanceof ApiError) {
      return next(error);
    }
    if (error.name === 'TokenExpiredError') {
      return next(new ApiError(401, 'Access token has expired', 'TOKEN_EXPIRED'));
    }
    if (error.name === 'JsonWebTokenError') {
      return next(new ApiError(401, 'Invalid access token', 'TOKEN_INVALID'));
    }
    next(error);
  }
};

module.exports = auth;
