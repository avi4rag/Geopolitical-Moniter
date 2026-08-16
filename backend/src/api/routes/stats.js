import { Router } from 'express';
import { getDashboardStats, getDomainStats } from '../controllers/statsController.js';

// ─── Stats Router ─────────────────────────────────────────────────────────────
const router = Router();

// GET /api/v1/stats
// High-level dashboard totals and distributions
router.get('/', getDashboardStats);

// GET /api/v1/stats/domains
// Domain-specific impact breakdown
router.get('/domains', getDomainStats);

export default router;
