import { z } from 'zod';

// ─── Environment Schema ──────────────────────────────────────────────────────
// Validates all required environment variables at startup.
// The app will crash with a descriptive error if anything is missing.
// ─────────────────────────────────────────────────────────────────────────────

const envSchema = z.object({
  // Server
  PORT: z.string().default('3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // MongoDB
  MONGO_URI: z.string().min(1, 'MONGO_URI is required'),

  // OpenAI
  OPENAI_API_KEY: z.string().min(1, 'OPENAI_API_KEY is required'),

  // News APIs
  GUARDIAN_API_KEY: z.string().min(1, 'GUARDIAN_API_KEY is required'),
  NEWS_API_KEY: z.string().optional(),

  // Ingestion Settings
  RELEVANCE_THRESHOLD: z.string().default('0.3'),
  MAX_PROCESSING_ATTEMPTS: z.string().default('3'),
  INGESTION_CRON: z.string().default('0 */2 * * *'),

  // CORS
  CORS_ORIGINS: z.string().default('http://localhost:5173'),
});

// ─── Parse & Export ──────────────────────────────────────────────────────────

const parseResult = envSchema.safeParse(process.env);

if (!parseResult.success) {
  const issues = parseResult.error.issues
    .map((issue) => `  • ${issue.path.join('.')}: ${issue.message}`)
    .join('\n');
  console.error('❌ Invalid environment configuration:\n' + issues);
  console.error('\nCopy backend/.env.example to backend/.env and fill in the values.');
  process.exit(1);
}

const raw = parseResult.data;

export const env = {
  port: parseInt(raw.PORT, 10),
  nodeEnv: raw.NODE_ENV,
  isProduction: raw.NODE_ENV === 'production',
  isDevelopment: raw.NODE_ENV === 'development',
  isTest: raw.NODE_ENV === 'test',

  mongoUri: raw.MONGO_URI,

  openaiApiKey: raw.OPENAI_API_KEY,

  guardianApiKey: raw.GUARDIAN_API_KEY,
  newsApiKey: raw.NEWS_API_KEY,

  relevanceThreshold: parseFloat(raw.RELEVANCE_THRESHOLD),
  maxProcessingAttempts: parseInt(raw.MAX_PROCESSING_ATTEMPTS, 10),
  ingestionCron: raw.INGESTION_CRON,

  corsOrigins: raw.CORS_ORIGINS.split(',').map((o) => o.trim()),
};
