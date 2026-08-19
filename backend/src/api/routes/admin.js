import { Router } from 'express';
import {
  triggerIngestion,
  triggerExtraction,
  triggerImpactAssessment,
  triggerFullPipeline,
  getPipelineAndSchedulerStatus,
} from '../controllers/adminController.js';
import { env } from '../../config/env.js';

// ─── Admin Router ─────────────────────────────────────────────────────────────
// In production, secure this entire router with an API key / admin auth middleware.
// ─────────────────────────────────────────────────────────────────────────────

const router = Router();

// Admin authentication middleware
router.use((req, res, next) => {
  if (env.isProduction) {
    const providedKey =
      req.headers['x-admin-key'] ||
      (req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.slice(7)
        : null);

    if (!providedKey) {
      return res.status(403).json({
        success: false,
        data: null,
        error: { code: 'FORBIDDEN', message: 'Admin key required in production' },
      });
    }

    if (env.adminApiKey && providedKey !== env.adminApiKey) {
      return res.status(401).json({
        success: false,
        data: null,
        error: { code: 'UNAUTHORIZED', message: 'Invalid admin API key' },
      });
    }
  }
  next();
});

// Trigger full ingestion manually
router.post('/ingest', triggerIngestion);

// Trigger LLM extraction for STORED articles
router.post('/extract', triggerExtraction);

// Trigger impact assessment for ANALYZED events
router.post('/impact', triggerImpactAssessment);

// Trigger full end-to-end intelligence cycle (Ingest -> Extract -> Impact)
router.post('/pipeline/run', triggerFullPipeline);

// Get current pipeline execution and scheduler status
router.get('/pipeline/status', getPipelineAndSchedulerStatus);

export default router;
