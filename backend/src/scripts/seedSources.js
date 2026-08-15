// ─── Source Seed Script ───────────────────────────────────────────────────────
// Run once during initial setup to populate trusted news sources.
// Safe to re-run — uses upsert so it won't duplicate entries.
//
// Usage:
//   node src/scripts/seedSources.js
// ─────────────────────────────────────────────────────────────────────────────
import 'dotenv/config';
import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { Source } from '../models/index.js';

// ─── Source Definitions ───────────────────────────────────────────────────────
// reliabilityScore is a curated estimate, not a guarantee.
// Scores represent our confidence in the source's typical factual accuracy
// for geopolitical reporting based on journalistic track record.
//
// Score guide:
//   0.90–1.00: Official government/international org announcements
//   0.80–0.89: Major international outlets with strong editorial standards
//   0.60–0.79: Reputable regional or specialist publications
//   0.40–0.59: Mixed reliability — cross-reference recommended
//   0.00–0.39: Low reliability — treat as UNVERIFIED
// ─────────────────────────────────────────────────────────────────────────────

const INITIAL_SOURCES = [
  {
    name: 'The Guardian',
    domain: 'theguardian.com',
    type: 'MAJOR_INTERNATIONAL_NEWS',
    reliabilityScore: 0.85,
    active: true,
    metadata: {
      apiKeyEnvVar: 'GUARDIAN_API_KEY',
      baseUrl: 'https://content.guardianapis.com',
      rateLimit: 500,
    },
  },
  {
    name: 'NewsAPI.org Aggregator',
    domain: 'newsapi.org',
    type: 'MAJOR_INTERNATIONAL_NEWS',
    reliabilityScore: 0.75, // Lower: aggregates multiple sources of varying quality
    active: true,
    metadata: {
      apiKeyEnvVar: 'NEWS_API_KEY',
      baseUrl: 'https://newsapi.org/v2',
      rateLimit: 100,
    },
  },
  {
    name: 'Reuters',
    domain: 'reuters.com',
    type: 'MAJOR_INTERNATIONAL_NEWS',
    reliabilityScore: 0.90,
    active: false, // Enabled when Reuters provider is implemented
    metadata: {
      baseUrl: 'https://www.reuters.com',
      rateLimit: 0,
    },
  },
  {
    name: 'Associated Press',
    domain: 'apnews.com',
    type: 'MAJOR_INTERNATIONAL_NEWS',
    reliabilityScore: 0.90,
    active: false,
    metadata: {
      baseUrl: 'https://apnews.com',
      rateLimit: 0,
    },
  },
  {
    name: 'BBC News',
    domain: 'bbc.com',
    type: 'MAJOR_INTERNATIONAL_NEWS',
    reliabilityScore: 0.87,
    active: false,
    metadata: {
      baseUrl: 'https://www.bbc.com/news',
      rateLimit: 0,
    },
  },
  {
    name: 'Al Jazeera',
    domain: 'aljazeera.com',
    type: 'MAJOR_INTERNATIONAL_NEWS',
    reliabilityScore: 0.80,
    active: false,
    metadata: {
      baseUrl: 'https://www.aljazeera.com',
      rateLimit: 0,
    },
  },
  {
    name: 'United Nations News',
    domain: 'news.un.org',
    type: 'INTERNATIONAL_ORG',
    reliabilityScore: 0.92,
    active: false,
    metadata: {
      baseUrl: 'https://news.un.org',
      rateLimit: 0,
    },
  },
];

// ─── Seed Function ────────────────────────────────────────────────────────────

async function seedSources() {
  try {
    await mongoose.connect(env.mongoUri);
    logger.info('Connected to MongoDB for seeding');

    let created = 0;
    let updated = 0;

    for (const sourceData of INITIAL_SOURCES) {
      const result = await Source.findOneAndUpdate(
        { domain: sourceData.domain },
        { $set: sourceData },
        { upsert: true, returnDocument: 'after', runValidators: true }
      );

      if (result.createdAt.getTime() === result.updatedAt?.getTime()) {
        created++;
        logger.info({ name: sourceData.name }, 'Source created');
      } else {
        updated++;
        logger.info({ name: sourceData.name }, 'Source updated');
      }
    }

    logger.info({ created, updated, total: INITIAL_SOURCES.length }, '✅ Sources seeded');
  } catch (err) {
    logger.error({ err }, '❌ Seeding failed');
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

seedSources();
