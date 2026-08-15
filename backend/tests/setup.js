import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

// ─── Test Environment Setup ───────────────────────────────────────────────────
// Uses an in-memory MongoDB instance for all tests.
// Tests run offline — no real Atlas connection required.
// Each test file gets a clean database state via the lifecycle below.
// ─────────────────────────────────────────────────────────────────────────────

// Set test environment variables BEFORE any module imports env.js
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
// Provide a sync placeholder — overwritten with real URI in beforeAll
process.env.MONGO_URI = 'mongodb://localhost:27017/geopolitical_monitor_test';
process.env.OPENAI_API_KEY = 'sk-test-key';
process.env.GUARDIAN_API_KEY = 'test-guardian-key';
process.env.NEWS_API_KEY = 'test-newsapi-key';
process.env.CORS_ORIGINS = 'http://localhost:5173';

let mongod;

// Start in-memory MongoDB before all tests
beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  process.env.MONGO_URI = uri;

  await mongoose.connect(uri);
}, 30_000);

// Clear all collections between test files (not between individual tests)
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

// Disconnect and stop in-memory MongoDB after all tests
afterAll(async () => {
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
}, 30_000);

