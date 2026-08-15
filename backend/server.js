// ─── Load env vars FIRST before any other import ─────────────────────────────
import 'dotenv/config';

import app from './src/app.js';
import { connectDB } from './src/db/connection.js';
import { env } from './src/config/env.js';
import { logger } from './src/config/logger.js';

// ─── Server Entry Point ───────────────────────────────────────────────────────
// Connects to MongoDB, then starts the HTTP server.
// Handles graceful shutdown on SIGTERM / SIGINT.
// ─────────────────────────────────────────────────────────────────────────────

async function startServer() {
  try {
    // 1. Connect to MongoDB
    await connectDB();

    // 2. Start HTTP server
    const server = app.listen(env.port, () => {
      logger.info(
        {
          port: env.port,
          env: env.nodeEnv,
          url: `http://localhost:${env.port}`,
        },
        '🚀 Server started'
      );
      logger.info(`Health check: http://localhost:${env.port}/api/v1/health`);
    });

    // 3. Graceful shutdown
    const shutdown = async (signal) => {
      logger.info({ signal }, 'Shutdown signal received');
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
