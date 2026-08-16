import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import apiRouter from './api/routes/index.js';
import { notFoundHandler } from './api/middleware/notFound.js';
import { errorHandler } from './api/middleware/errorHandler.js';

// ─── Express Application ──────────────────────────────────────────────────────
const app = express();

// ─── Security & CORS Middleware ───────────────────────────────────────────────

app.use(helmet());

// CORS: allow configured origins, Vercel deployments, Render, and localhost
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      try {
        const normalizedOrigin = origin.replace(/\/$/, '');
        const isAllowedConfig = env.corsOrigins.some(
          (allowed) => allowed.replace(/\/$/, '') === normalizedOrigin
        );

        const url = new URL(origin);
        const isVercel = url.hostname.endsWith('.vercel.app') || url.hostname === 'vercel.app';
        const isRender = url.hostname.endsWith('.onrender.com') || url.hostname === 'onrender.com';
        const isLocal = url.hostname === 'localhost' || url.hostname === '127.0.0.1';

        if (isAllowedConfig || isVercel || isRender || isLocal) {
          return callback(null, true);
        }
      } catch (err) {
        // invalid URL format, proceed to reject
      }

      callback(new Error(`CORS: Origin '${origin}' not allowed`));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // Required for HTTP-only cookies
  })
);

// Rate limiting: 200 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    data: null,
    error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests. Please try again later.' },
  },
});
app.use(limiter);

// ─── Body & Cookie Parsing ───────────────────────────────────────────────────

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─── Request Logging ──────────────────────────────────────────────────────────

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - start;
    logger.info(
      {
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
        ms,
      },
      'Request'
    );
  });
  next();
});

// ─── Routes ───────────────────────────────────────────────────────────────────

// Root API welcome endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      name: 'GeoMonitor Intelligence API',
      version: '1.0.0',
      status: 'operational',
      health: '/api/v1/health',
      events: '/api/v1/events',
    },
    error: null,
  });
});

app.use('/api/v1', apiRouter);

// ─── 404 + Error Handlers ─────────────────────────────────────────────────────

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
