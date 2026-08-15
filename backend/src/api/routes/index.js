import { Router } from 'express';
import healthRouter from './health.js';

// ─── Root API Router ─────────────────────────────────────────────────────────
// All v1 routes are mounted here.
// Feature routers (events, sources, stats) will be added in later phases.
// ─────────────────────────────────────────────────────────────────────────────

const router = Router();

router.use('/health', healthRouter);

// Future routes (added in Phase 12):
// router.use('/events', eventsRouter);
// router.use('/sources', sourcesRouter);
// router.use('/stats', statsRouter);

export default router;
