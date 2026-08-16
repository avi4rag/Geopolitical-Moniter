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

// CORS: allow configured origins + HTTP-only cookies (credentials: true)
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (env.corsOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: Origin '${origin}' not allowed`));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
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

app.use('/api/v1', apiRouter);

// ─── 404 + Error Handlers ─────────────────────────────────────────────────────

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
