import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';

// ─── Health Endpoint Tests ────────────────────────────────────────────────────
// Tests the GET /api/v1/health endpoint.
// Note: DB will not be connected in unit test environment, so we expect 503.
// ─────────────────────────────────────────────────────────────────────────────

describe('GET /api/v1/health', () => {
  it('returns a response with service metadata', async () => {
    const res = await request(app).get('/api/v1/health');

    // Health always returns JSON regardless of DB state
    expect(res.headers['content-type']).toMatch(/json/);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('service', 'geopolitical-monitor-api');
    expect(res.body.data).toHaveProperty('uptime');
    expect(res.body.data).toHaveProperty('timestamp');
    expect(res.body.data).toHaveProperty('database');
  });

  it('returns 503 when database is not connected', async () => {
    const res = await request(app).get('/api/v1/health');
    // In test environment, DB is not connected
    expect(res.status).toBe(503);
    expect(res.body.data.database.connected).toBe(false);
  });

  it('returns 404 for unknown routes', async () => {
    const res = await request(app).get('/api/v1/nonexistent-route');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});
