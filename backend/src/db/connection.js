import mongoose from 'mongoose';
import { logger } from '../config/logger.js';
import { env } from '../config/env.js';

// ─── MongoDB Connection ────────────────────────────────────────────────────────
// Single connection managed here.
// Called once from server.js during startup.
// ─────────────────────────────────────────────────────────────────────────────

let isConnected = false;

export async function connectDB() {
  if (isConnected) {
    logger.debug('MongoDB: already connected');
    return;
  }

  try {
    await mongoose.connect(env.mongoUri, {
      // These options are defaults in Mongoose 8 but stated explicitly for clarity
      serverSelectionTimeoutMS: 10_000,
      socketTimeoutMS: 45_000,
    });

    isConnected = true;
    logger.info({ db: mongoose.connection.name }, 'MongoDB connected');

    // Handle connection events
    mongoose.connection.on('disconnected', () => {
      isConnected = false;
      logger.warn('MongoDB disconnected');
    });

    mongoose.connection.on('error', (err) => {
      logger.error({ err }, 'MongoDB connection error');
    });
  } catch (err) {
    logger.error({ err }, 'MongoDB connection failed');
    throw err; // Let server.js handle graceful shutdown
  }
}

export async function disconnectDB() {
  if (!isConnected) return;
  await mongoose.disconnect();
  isConnected = false;
  logger.info('MongoDB disconnected cleanly');
}

export function getConnectionState() {
  return {
    isConnected,
    readyState: mongoose.connection.readyState,
    // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  };
}
