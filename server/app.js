const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('./middleware/mongoSanitize');
const hpp = require('hpp');
const path = require('path');

const sanitize = require('./middleware/sanitize');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// ---------------------------------------------------------------------------
// Security headers — Helmet with tightened CSP
// ---------------------------------------------------------------------------
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'blob:'],
        connectSrc: ["'self'", process.env.CLIENT_URL || 'http://localhost:5173'],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: false,
  }),
);

// ---------------------------------------------------------------------------
// CORS — locked to CLIENT_URL
// ---------------------------------------------------------------------------
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

// ---------------------------------------------------------------------------
// Global rate limiter — 100 requests per 15 min per IP
// (Auth routes have a stricter limiter defined in routes/auth.js)
// ---------------------------------------------------------------------------
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
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
app.use('/api', globalLimiter);

// ---------------------------------------------------------------------------
// Request logging — development only
// ---------------------------------------------------------------------------
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// ---------------------------------------------------------------------------
// Body parsing
// ---------------------------------------------------------------------------
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));

// ---------------------------------------------------------------------------
// Cookie parsing
// ---------------------------------------------------------------------------
app.use(cookieParser());

// ---------------------------------------------------------------------------
// Data sanitization — prevent NoSQL injection & XSS
// ---------------------------------------------------------------------------
app.use(mongoSanitize);
app.use(sanitize);

// ---------------------------------------------------------------------------
// Prevent HTTP parameter pollution
// ---------------------------------------------------------------------------
app.use(hpp());

// ---------------------------------------------------------------------------
// Health check
// ---------------------------------------------------------------------------
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// ---------------------------------------------------------------------------
// Static files (uploads)
// ---------------------------------------------------------------------------
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ---------------------------------------------------------------------------
// API Routes
// ---------------------------------------------------------------------------
const authRoutes = require('./routes/auth');
const boardRoutes = require('./routes/boards');
const listRoutes = require('./routes/lists');
const cardRoutes = require('./routes/cards');
const activityRoutes = require('./routes/activity');
const searchRoutes = require('./routes/search');

app.use('/api/auth', authRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/boards/:boardId/lists', listRoutes);
app.use('/api/boards/:boardId/cards', cardRoutes);
app.use('/api/boards/:boardId/activity', activityRoutes);
app.use('/api/search', searchRoutes);

// ---------------------------------------------------------------------------
// Production: serve client build
// ---------------------------------------------------------------------------
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '..', 'client', 'dist')));

  // All non-API routes → client index.html (SPA fallback)
  app.get('/{*splat}', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'dist', 'index.html'));
  });
}

// ---------------------------------------------------------------------------
// Global error handler (must be after routes)
// ---------------------------------------------------------------------------
app.use(errorHandler);

module.exports = app;
