import { Router } from 'express';
import healthRouter from './health.js';
import adminRouter from './admin.js';
import eventsRouter from './events.js';
import impactsRouter from './impacts.js';
import statsRouter from './stats.js';
import sourcesRouter from './sources.js';
import authRouter from './auth.js';
import usersRouter from './users.js';
import sqlRouter from './sqlEvents.js';
import uploadsRouter from './uploads.js';

// ─── Root API Router ─────────────────────────────────────────────────────────
// All v1 API endpoints are mounted here.
// ─────────────────────────────────────────────────────────────────────────────

const router = Router();

router.use('/health', healthRouter);
router.use('/admin', adminRouter);
router.use('/events', eventsRouter);
router.use('/impacts', impactsRouter);
router.use('/stats', statsRouter);
router.use('/sources', sourcesRouter);
router.use('/auth', authRouter);
router.use('/users', usersRouter);
router.use('/sql', sqlRouter);
router.use('/uploads', uploadsRouter);

export default router;
