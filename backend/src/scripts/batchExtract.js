import 'dotenv/config';
import mongoose from 'mongoose';
import { runExtraction } from '../services/llm/extractionService.js';
import { runImpactAssessment } from '../services/impact/impactService.js';
import { env } from '../config/env.js';
import { Event, Article, ImpactAssessment } from '../models/index.js';

async function batchExtract() {
  try {
    await mongoose.connect(env.mongoUri);
    console.log('Connected to MongoDB Atlas...');

    const storedCount = await Article.countDocuments({ processingStatus: 'STORED' });
    console.log(`Articles ready for extraction: ${storedCount}`);

    console.log('Extracting up to 5 articles with gemini-3.6-flash...');
    const extractStats = await runExtraction({ batchSize: 5 });
    console.log('Extraction stats:', extractStats);

    console.log('Running impact assessments...');
    const impactStats = await runImpactAssessment({ batchSize: 10 });
    console.log('Impact stats:', impactStats);

    const totalEvents = await Event.countDocuments();
    const totalImpacts = await ImpactAssessment.countDocuments();
    console.log(`Total Events in database: ${totalEvents}`);
    console.log(`Total Impact Assessments in database: ${totalImpacts}`);

    await mongoose.disconnect();
  } catch (err) {
    console.error('Error during batch extraction:', err);
  }
}

batchExtract();
