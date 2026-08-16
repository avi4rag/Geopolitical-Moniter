import 'dotenv/config';
import mongoose from 'mongoose';
import { runExtraction } from '../services/llm/extractionService.js';
import { runImpactAssessment } from '../services/impact/impactService.js';
import { env } from '../config/env.js';
import { Event, Article } from '../models/index.js';

async function testLiveExtraction() {
  try {
    await mongoose.connect(env.mongoUri);
    console.log('Connected to MongoDB Atlas...');

    const storedCount = await Article.countDocuments({ processingStatus: 'STORED' });
    console.log(`Found ${storedCount} STORED articles ready for LLM extraction.`);

    if (storedCount === 0) {
      console.log('No STORED articles found.');
      await mongoose.disconnect();
      return;
    }

    console.log('Running 1 LLM extraction call with gemini-3.6-flash...');
    const extractStats = await runExtraction({ batchSize: 1 });
    console.log('Extraction stats:', extractStats);

    console.log('Running impact assessment rules...');
    const impactStats = await runImpactAssessment({ batchSize: 5 });
    console.log('Impact stats:', impactStats);

    const eventsCount = await Event.countDocuments();
    console.log(`Total Events in database now: ${eventsCount}`);

    const latestEvent = await Event.findOne().sort({ createdAt: -1 });
    if (latestEvent) {
      console.log('\n--- LATEST EXTRACTED EVENT ---');
      console.log('EventType:', latestEvent.eventType);
      console.log('Severity:', latestEvent.severity);
      console.log('Summary:', latestEvent.summary);
      console.log('Countries:', latestEvent.countries);
      console.log('Sectors:', latestEvent.sectors);
      console.log('Credibility:', latestEvent.credibilityLabel, `(${latestEvent.credibilityScore})`);
      console.log('Facts:', latestEvent.facts);
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error('Error in live extraction test:', err);
  }
}

testLiveExtraction();
