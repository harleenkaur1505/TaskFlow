const express = require('express');
const rateLimit = require('express-rate-limit');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const validate = require('../middleware/validate');
const { registerValidation, loginValidation } = require('../utils/validators');
const {
  register,
  login,
  refreshToken,
  logout,
  getMe,
  updateProfile,
} = require('../controllers/authController');

const router = express.Router();

// Rate limit: 5 requests per minute per IP for auth routes
const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: {
    error: {
      message: 'Too many requests, please try again later',
      code: 'RATE_LIMIT_EXCEEDED',
      status: 429,
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public routes
router.post('/register', authLimiter, registerValidation, validate, register);
router.post('/login', authLimiter, loginValidation, validate, login);
router.post('/refresh', refreshToken);

// Protected routes
router.post('/logout', auth, logout);
router.get('/me', auth, getMe);
router.put('/profile', auth, upload.single('avatar'), updateProfile);

module.exports = router;
