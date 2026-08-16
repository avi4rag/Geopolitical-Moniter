import 'dotenv/config';
import mongoose from 'mongoose';
import { Article } from '../models/index.js';
import { env } from '../config/env.js';

async function resetFailed() {
  try {
    await mongoose.connect(env.mongoUri);
    const res = await Article.updateMany(
      { processingStatus: { $in: ['FAILED', 'ANALYZING'] } },
      { $set: { processingStatus: 'STORED', processingAttempts: 0, processingError: null } }
    );
    console.log(`✅ Reset ${res.modifiedCount} failed/analyzing articles back to STORED for re-extraction`);
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error resetting articles:', err.message);
  }
}

resetFailed();
