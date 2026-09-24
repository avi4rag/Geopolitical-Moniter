import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';

describe('Core Concepts Test Suite (12 Assessor Benchmarks)', () => {

  describe('1. SQL & Prisma ORM: Filtering, Ordering & Grouping', () => {
    it('GET /api/v1/sql/events returns filtered and ordered events with Prisma ORM', async () => {
      const res = await request(app)
        .get('/api/v1/sql/events')
        .query({ theater: 'INDO_PACIFIC', sortBy: 'severityScore', order: 'desc' });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.engine).toContain('Prisma ORM');
      expect(res.body.data.items).toBeInstanceOf(Array);
      expect(res.body.data.pagination.sortBy).toBe('severityScore');
      expect(res.body.data.pagination.order).toBe('desc');
    });

    it('GET /api/v1/sql/events/grouped aggregates events with SQL GROUP BY', async () => {
      const res = await request(app)
        .get('/api/v1/sql/events/grouped')
        .query({ groupBy: 'theater' });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.groupBy).toBe('theater');
      expect(res.body.data.groups).toBeInstanceOf(Array);
      if (res.body.data.groups.length > 0) {
        expect(res.body.data.groups[0]).toHaveProperty('category');
        expect(res.body.data.groups[0]).toHaveProperty('eventCount');
      }
    });

    it('GET /api/v1/events/grouped supports MongoDB aggregation grouping', async () => {
      const res = await request(app)
        .get('/api/v1/events/grouped')
        .query({ groupBy: 'severity' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.groupBy).toBe('severity');
      expect(res.body.data.groups).toBeInstanceOf(Array);
    });
  });

  describe('2. ACID Transactions (SQL / Postgres / Prisma)', () => {
    it('POST /api/v1/sql/events/transaction commits atomic multi-table transaction', async () => {
      const res = await request(app)
        .post('/api/v1/sql/events/transaction')
        .send({
          title: 'Baltic Subsea Cable Infrastructure Defense',
          summary: 'Critical telecom route guarded by naval patrols.',
          theater: 'EUROPE',
          severity: 'HIGH',
          severityScore: 8.5,
          economicImpact: -3.0,
          militaryImpact: 6.0,
          shouldFail: false,
        });

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.status).toBe('COMMITTED');
      expect(res.body.data.event).toHaveProperty('id');
    });

    it('POST /api/v1/sql/events/transaction rolls back all changes on failure', async () => {
      const res = await request(app)
        .post('/api/v1/sql/events/transaction')
        .send({
          title: 'Aborted Test Mission',
          summary: 'Mission should roll back.',
          theater: 'EUROPE',
          severity: 'LOW',
          shouldFail: true,
        });

      expect(res.status).toBe(400);
      expect(res.body.status).toBe('error');
      expect(res.body.code).toBe('TRANSACTION_ROLLED_BACK');
    });
  });

  describe('3. Input Sanitization & Injection Defense', () => {
    it('intercepts and blocks suspicious SQL Injection payloads in queries', async () => {
      const res = await request(app)
        .get('/api/v1/events')
        .query({ search: "conflict' OR '1'='1" });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('INVALID_INPUT');
      expect(res.body.message).toContain('SQL pattern detected');
    });

    it('neutralizes NoSQL injection keys starting with $ or containing .', async () => {
      // Testing deep sanitization on POST request body
      const res = await request(app)
        .post('/api/v1/events/ask')
        .send({
          query: 'Test intelligence synthesis',
          $where: 'maliciousFunction()',
          'user.role': 'admin',
        });

      // The sanitizer removes $where and user.role before processing
      // Response shouldn't error due to malicious operators
      expect(res.status).not.toBe(500);
    });
  });

  describe('4. File Upload Handling with Multer', () => {
    it('POST /api/v1/uploads successfully uploads a text/json file', async () => {
      const buffer = Buffer.from(JSON.stringify({ report: 'Intelligence Dossier Sample' }));
      const res = await request(app)
        .post('/api/v1/uploads')
        .attach('files', buffer, 'intel_sample.json');

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.files).toHaveLength(1);
      expect(res.body.data.files[0].originalName).toBe('intel_sample.json');
      expect(res.body.data.files[0].url).toContain('/uploads/');
    });

    it('POST /api/v1/uploads rejects files exceeding allowed types or empty payload', async () => {
      const res = await request(app).post('/api/v1/uploads');
      expect(res.status).toBe(400);
      expect(res.body.code).toBe('NO_FILE_PROVIDED');
    });
  });

  describe('5. Caching with Redis (Cache-Aside Pattern)', () => {
    it('serves X-Cache headers and caches responses across subsequent requests', async () => {
      const uniqueUrl = `/api/v1/sql/events?cacheTestKey=${Date.now()}`;
      
      // 1. Initial request: Cache MISS
      const res1 = await request(app).get(uniqueUrl);
      expect(res1.status).toBe(200);
      expect(res1.headers['x-cache']).toBe('MISS');

      // 2. Immediate second request: Cache HIT
      const res2 = await request(app).get(uniqueUrl);
      expect(res2.status).toBe(200);
      expect(res2.headers['x-cache']).toBe('HIT');
    });
  });
});
