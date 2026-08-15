// ─── Test Setup File ──────────────────────────────────────────────────────────
// Runs before all test files.
// Sets up test environment variables so env.js doesn't crash during tests.
// ─────────────────────────────────────────────────────────────────────────────

process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.MONGO_URI = 'mongodb://localhost:27017/geopolitical_monitor_test';
process.env.OPENAI_API_KEY = 'sk-test-key';
process.env.GUARDIAN_API_KEY = 'test-guardian-key';
process.env.NEWS_API_KEY = 'test-newsapi-key';
process.env.CORS_ORIGINS = 'http://localhost:5173';
