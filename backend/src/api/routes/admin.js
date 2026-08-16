import { Router } from 'express';
import { triggerIngestion, triggerExtraction } from '../controllers/adminController.js';
import { env } from '../../config/env.js';

// ─── Admin Router ─────────────────────────────────────────────────────────────
// Development/operations routes. Only available in non-production environments
// unless a valid ADMIN_SECRET header is provided.
//
// Production protection is handled here with a lightweight secret check.
// Full auth (JWT roles) will be added in Phase 10 (Auth).
// ─────────────────────────────────────────────────────────────────────────────

const router = Router();

/**
 * Lightweight admin guard middleware.
 * In development: always passes.
 * In production: requires X-Admin-Secret header matching ADMIN_SECRET env var.
 */
function adminGuard(req, res, next) {
  if (!env.isProduction) return next();

  const secret = process.env.ADMIN_SECRET;
  const provided = req.headers['x-admin-secret'];

  if (!secret || !provided || provided !== secret) {
    return res.status(403).json({
      success: false,
      data: null,
      error: {
        code: 'FORBIDDEN',
        message: 'Admin access denied',
      },
    });
  }

  next();
}

// Apply guard to all admin routes
router.use(adminGuard);

// ─── Routes ───────────────────────────────────────────────────────────────────

// Trigger full ingestion manually
router.post('/ingest', triggerIngestion);

// Trigger LLM extraction for STORED articles
router.post('/extract', triggerExtraction);

export default router;
