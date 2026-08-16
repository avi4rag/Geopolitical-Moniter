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

  // LLM Provider
  LLM_PROVIDER: z.enum(['gemini', 'openai']).default('gemini'),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default('gemini-2.0-flash'),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default('gpt-4o-mini'),
  // Delay between LLM calls (ms). Gemini free tier = 15 RPM → 4000ms safe
  LLM_DELAY_MS: z.string().default('4000'),
  // Max articles to extract per run
  LLM_BATCH_SIZE: z.string().default('10'),

  // News APIs
  GUARDIAN_API_KEY: z.string().min(1, 'GUARDIAN_API_KEY is required'),
  NEWS_API_KEY: z.string().optional(),

  // Ingestion & Automation Settings
  RELEVANCE_THRESHOLD: z.string().default('0.3'),
  MAX_PROCESSING_ATTEMPTS: z.string().default('3'),
  INGESTION_CRON: z.string().default('0 */2 * * *'),
  ENABLE_CRON: z.string().default('false'),

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

  // LLM provider settings
  llmProvider: raw.LLM_PROVIDER,
  // Gemini key: try GEMINI_API_KEY first, fall back to OPENAI_API_KEY slot
  // (backward-compat for users who put their Gemini key in OPENAI_API_KEY)
  geminiApiKey: raw.GEMINI_API_KEY || raw.OPENAI_API_KEY || '',
  geminiModel: raw.GEMINI_MODEL,
  openaiApiKey: raw.OPENAI_API_KEY || '',
  openaiModel: raw.OPENAI_MODEL,
  llmDelayMs: parseInt(raw.LLM_DELAY_MS, 10),
  llmBatchSize: parseInt(raw.LLM_BATCH_SIZE, 10),

  guardianApiKey: raw.GUARDIAN_API_KEY,
  newsApiKey: raw.NEWS_API_KEY,

  relevanceThreshold: parseFloat(raw.RELEVANCE_THRESHOLD),
  maxProcessingAttempts: parseInt(raw.MAX_PROCESSING_ATTEMPTS, 10),
  ingestionCron: raw.INGESTION_CRON,
  enableCron: raw.ENABLE_CRON === 'true',

  corsOrigins: raw.CORS_ORIGINS.split(',').map((o) => o.trim()),
};
