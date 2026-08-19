import { Router } from 'express';
import { getConnectionState } from '../../db/connection.js';
import { getSchedulerStatus } from '../../scheduler/cronScheduler.js';

// ─── Health Route ─────────────────────────────────────────────────────────────
// GET /api/v1/health
// Returns server status, uptime, database connection state, and scheduler status.
// ─────────────────────────────────────────────────────────────────────────────

const router = Router();

router.get('/', (req, res) => {
  const db = getConnectionState();
  const scheduler = getSchedulerStatus();

  const status = {
    service: 'geopolitical-monitor-api',
    version: '1.0.0',
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    database: {
      connected: db.isConnected,
      readyState: db.readyState,
    },
    scheduler: {
      active: scheduler.isActive,
      cronPattern: scheduler.cronPattern,
      lastRunAt: scheduler.lastScheduledRunAt,
      lastRunStatus: scheduler.lastScheduledRunStatus,
      totalRuns: scheduler.totalScheduledRuns,
    },
    environment: process.env.NODE_ENV || 'development',
  };

  // If DB is not connected, return 503 but still respond
  const httpStatus = db.isConnected ? 200 : 503;

  res.status(httpStatus).json({
    success: db.isConnected,
    data: status,
    error: db.isConnected ? null : { code: 'DB_UNAVAILABLE', message: 'Database not connected' },
  });
});

export default router;
