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

// Development-only check in production without auth
router.use((req, res, next) => {
  if (env.isProduction && !req.headers['x-admin-key']) {
    return res.status(403).json({
      success: false,
      data: null,
      error: { code: 'FORBIDDEN', message: 'Admin key required in production' },
    });
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
