import { logger } from '../../config/logger.js';
import { env } from '../../config/env.js';

// ─── Global Error Handler ─────────────────────────────────────────────────────
// Must have 4 parameters so Express recognizes it as an error handler.
// In production: never expose stack traces to the client.
// ─────────────────────────────────────────────────────────────────────────────

export function errorHandler(err, req, res, next) {
  // Log the full error internally
  logger.error(
    {
      err,
      method: req.method,
      url: req.url,
      body: req.body,
    },
    'Unhandled error'
  );

  // Determine HTTP status
  const status = err.status || err.statusCode || 500;

  // Build safe response (never expose raw stack in production)
  const response = {
    success: false,
    data: null,
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: env.isProduction
        ? 'An unexpected error occurred. Please try again later.'
        : err.message || 'Unknown error',
      ...(env.isDevelopment && { stack: err.stack }),
    },
  };

  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      ...response,
      error: {
        code: 'VALIDATION_ERROR',
        message: err.message,
      },
    });
  }

  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    return res.status(400).json({
      ...response,
      error: {
        code: 'INVALID_ID',
        message: 'Invalid ID format',
      },
    });
  }

  if (err.code === 11000) {
    return res.status(409).json({
      ...response,
      error: {
        code: 'DUPLICATE_ERROR',
        message: 'Resource already exists',
      },
    });
  }

  res.status(status).json(response);
}
