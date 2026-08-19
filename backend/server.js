// ─── Load env vars FIRST before any other import ─────────────────────────────
import 'dotenv/config';

import app from './src/app.js';
import { connectDB } from './src/db/connection.js';
import { startScheduler, stopScheduler } from './src/scheduler/cronScheduler.js';
import { env } from './src/config/env.js';
import { logger } from './src/config/logger.js';

// ─── Server Entry Point ───────────────────────────────────────────────────────
// Connects to MongoDB, starts the cron scheduler (if enabled), and starts HTTP server.
// Handles graceful shutdown on SIGTERM / SIGINT.
// ─────────────────────────────────────────────────────────────────────────────

async function startServer() {
  try {
    // 1. Connect to MongoDB
    await connectDB();

    // 2. Start automated cron scheduler (if enabled)
    if (env.enableCron) {
      startScheduler(env.ingestionCron, { runOnStart: env.runPipelineOnStart });
    } else {
      logger.info('Scheduler: Background cron is disabled (ENABLE_CRON=false)');
    }

    // 3. Start HTTP server
    const server = app.listen(env.port, () => {
      logger.info(
        {
          port: env.port,
          env: env.nodeEnv,
          url: `http://localhost:${env.port}`,
          cronEnabled: env.enableCron,
          runOnStart: env.runPipelineOnStart,
        },
        '🚀 Server started'
      );
      logger.info(`Health check: http://localhost:${env.port}/api/v1/health`);
    });

    // 4. Graceful shutdown
    const shutdown = async (signal) => {
      logger.info({ signal }, 'Shutdown signal received');
      stopScheduler();
      server.close(async () => {
        logger.info('HTTP server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (err) {
    logger.error({ err }, 'Failed to start server');
    process.exit(1);
  }
}

startServer();
