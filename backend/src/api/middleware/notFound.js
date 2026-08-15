import { logger } from '../../config/logger.js';

// ─── Not Found Handler ────────────────────────────────────────────────────────
// Catches any request that didn't match a defined route.
// ─────────────────────────────────────────────────────────────────────────────

export function notFoundHandler(req, res) {
  logger.warn({ method: req.method, url: req.url }, '404 Not Found');

  res.status(404).json({
    success: false,
    data: null,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.url} not found`,
    },
  });
}

