import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';
import { Source, Article, Event, ImpactAssessment } from '../../src/models/index.js';

// ─── REST API Integration Tests ───────────────────────────────────────────────
// Comprehensive testing of Events, Impacts, Stats, and Sources endpoints.
// ─────────────────────────────────────────────────────────────────────────────

describe('REST API (Phase 6 Endpoints)', () => {
  let source;
  let article;
  let event1;
  let event2;
  let impact1;
  let impact2;

  beforeEach(async () => {
    // Seed test source
    source = await Source.create({
      name: 'Reuters Test',
      domain: 'reuters-test.com',
      type: 'MAJOR_INTERNATIONAL_NEWS',
      reliabilityScore: 0.9,
      active: true,
    });

    // Seed test article
    article = await Article.create({
      title: 'Global Energy Sanctions Imposed on Major Oil Exporter',
      url: `https://reuters-test.com/energy-${Date.now()}`,
      sourceId: source._id,
      content: 'Major international energy sanctions were imposed today impacting crude oil supply chains.',
      excerpt: 'Sanctions hit oil market.',
      publishedAt: new Date(),
      processingStatus: 'ANALYZED',
      contentHash: `hash-${Date.now()}-${Math.random()}`,
    });

    // Seed test Event 1
    event1 = await Event.create({
      primaryArticleId: article._id,
      articleIds: [article._id],
      eventType: 'SANCTION',
      summary: 'Sanctions placed on Russian oil and energy infrastructure.',
      countries: ['Russia', 'United States'],
      regions: ['Eastern Europe'],
      sectors: ['Energy', 'Finance'],
      severity: 'HIGH',
      credibilityLabel: 'CONFIRMED',
      credibilityScore: 0.85,
      processingStatus: 'IMPACT_PROCESSED',
    });

    // Seed test Event 2
    event2 = await Event.create({
      primaryArticleId: article._id,
      articleIds: [article._id],
      eventType: 'DIPLOMATIC_AGREEMENT',
      summary: 'Bilateral trade treaty signed between Japan and South Korea.',
      countries: ['Japan', 'South Korea'],
      regions: ['East Asia'],
      sectors: ['Technology', 'Trade'],
      severity: 'MEDIUM',
      credibilityLabel: 'LIKELY',
      credibilityScore: 0.65,
      processingStatus: 'IMPACT_PROCESSED',
    });

    // Seed Impact Assessment 1 (Energy domain)
    impact1 = await ImpactAssessment.create({
      eventId: event1._id,
      domain: 'ENERGY',
      direction: 'NEGATIVE',
      severity: 'HIGH',
      confidence: 'HIGH',
      confidenceScore: 0.88,
      explanation: 'Sanctions directly restrict export routes and crude oil refinery capacity.',
      ruleId: 'sanction-energy-negative',
      version: 1,
      supersededAt: null,
    });

    // Seed Impact Assessment 2 (Trade domain)
    impact2 = await ImpactAssessment.create({
      eventId: event2._id,
      domain: 'TRADE',
      direction: 'POSITIVE',
      severity: 'MEDIUM',
      confidence: 'MEDIUM',
      confidenceScore: 0.75,
      explanation: 'Treaty lowers cross-border semiconductor tariff barriers.',
      ruleId: 'diplomatic-agreement-trade-positive',
      version: 1,
      supersededAt: null,
    });
  });

  // ─── EVENTS ENDPOINTS ────────────────────────────────────────────────────────

  describe('GET /api/v1/events', () => {
    it('returns a paginated list of events with metadata', async () => {
      const res = await request(app).get('/api/v1/events');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(2);
      expect(res.body.pagination).toBeDefined();
      expect(res.body.pagination.total).toBe(2);
      expect(res.body.pagination.page).toBe(1);
    });

    it('filters events by eventType', async () => {
      const res = await request(app).get('/api/v1/events?eventType=SANCTION');

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].eventType).toBe('SANCTION');
    });

    it('filters events by severity', async () => {
      const res = await request(app).get('/api/v1/events?severity=HIGH');

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].severity).toBe('HIGH');
    });

    it('filters events by country', async () => {
      const res = await request(app).get('/api/v1/events?country=Japan');

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].countries).toContain('Japan');
    });

    it('searches events by text keyword in summary', async () => {
      const res = await request(app).get('/api/v1/events?search=treaty');

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].summary).toContain('treaty');
    });

    it('supports pagination parameters (limit and page)', async () => {
      const res = await request(app).get('/api/v1/events?limit=1&page=1');

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.pagination.totalPages).toBe(2);
      expect(res.body.pagination.hasNextPage).toBe(true);
    });
  });

  describe('GET /api/v1/events/:id', () => {
    it('returns a single event with populated article and its impact assessments', async () => {
      const res = await request(app).get(`/api/v1/events/${event1._id}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toBe(event1._id.toString());
      expect(res.body.data.summary).toBe(event1.summary);
      expect(res.body.data.primaryArticleId).toBeDefined();
      expect(res.body.data.primaryArticleId.title).toBe(article.title);
      expect(Array.isArray(res.body.data.impacts)).toBe(true);
      expect(res.body.data.impacts.length).toBe(1);
      expect(res.body.data.impacts[0].domain).toBe('ENERGY');
    });

    it('returns 400 for invalid ObjectId format', async () => {
      const res = await request(app).get('/api/v1/events/invalid-id-format');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_ID');
    });

    it('returns 400 when event is not found', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const res = await request(app).get(`/api/v1/events/${fakeId}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('EVENT_NOT_FOUND');
    });
  });

  describe('GET /api/v1/events/:id/impacts', () => {
    it('returns all active impacts for a specific event', async () => {
      const res = await request(app).get(`/api/v1/events/${event1._id}/impacts`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].domain).toBe('ENERGY');
      expect(res.body.count).toBe(1);
    });

    it('returns 404 when querying impacts of non-existent event', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const res = await request(app).get(`/api/v1/events/${fakeId}/impacts`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/events/ask', () => {
    it('synthesizes answers with cited events for natural language queries', async () => {
      const res = await request(app)
        .post('/api/v1/events/ask')
        .send({ query: 'What are the trade sanctions?' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.answer).toBeDefined();
      expect(Array.isArray(res.body.data.citedEvents)).toBe(true);
    });

    it('rejects empty query with 400', async () => {
      const res = await request(app)
        .post('/api/v1/events/ask')
        .send({ query: '' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('EMPTY_QUERY');
    });
  });

  // ─── IMPACTS ENDPOINTS ───────────────────────────────────────────────────────

  describe('GET /api/v1/impacts', () => {
    it('returns cross-event list of latest impact assessments', async () => {
      const res = await request(app).get('/api/v1/impacts');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(2);
      expect(res.body.pagination.total).toBe(2);
      expect(res.body.data[0].eventId).toBeDefined();
    });

    it('filters impacts by domain', async () => {
      const res = await request(app).get('/api/v1/impacts?domain=ENERGY');

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].domain).toBe('ENERGY');
    });

    it('filters impacts by direction', async () => {
      const res = await request(app).get('/api/v1/impacts?direction=POSITIVE');

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].direction).toBe('POSITIVE');
    });
  });

  describe('GET /api/v1/impacts/domain/:domain', () => {
    it('returns impacts for a valid domain', async () => {
      const res = await request(app).get('/api/v1/impacts/domain/ENERGY');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.domain).toBe('ENERGY');
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].domain).toBe('ENERGY');
    });

    it('returns 400 for an invalid domain name', async () => {
      const res = await request(app).get('/api/v1/impacts/domain/INVALID_DOMAIN');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_DOMAIN');
    });
  });

  // ─── STATS ENDPOINTS ─────────────────────────────────────────────────────────

  describe('GET /api/v1/stats', () => {
    it('returns system-wide counts and distribution aggregations', async () => {
      const res = await request(app).get('/api/v1/stats');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totals.events).toBe(2);
      expect(res.body.data.totals.articles).toBe(1);
      expect(res.body.data.totals.activeImpacts).toBe(2);
      expect(res.body.data.totals.sources).toBe(1);
      expect(res.body.data.breakdowns.bySeverity.HIGH).toBe(1);
      expect(res.body.data.breakdowns.bySeverity.MEDIUM).toBe(1);
      expect(Array.isArray(res.body.data.recentEvents)).toBe(true);
    });
  });

  describe('GET /api/v1/stats/domains', () => {
    it('returns domain-specific impact breakdown', async () => {
      const res = await request(app).get('/api/v1/stats/domains');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(2);

      const energyStat = res.body.data.find((d) => d.domain === 'ENERGY');
      expect(energyStat).toBeDefined();
      expect(energyStat.totalCount).toBe(1);
      expect(energyStat.avgConfidence).toBe(0.88);
      expect(energyStat.directionBreakdown.negative).toBe(1);
    });
  });

  describe('GET /api/v1/stats/countries', () => {
    it('returns country-level event and severity activity breakdown', async () => {
      const res = await request(app).get('/api/v1/stats/countries');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);

      const usStat = res.body.data.find((c) => c.country === 'United States');
      expect(usStat).toBeDefined();
      expect(usStat.eventCount).toBeGreaterThan(0);
      expect(usStat.severityBreakdown).toBeDefined();
    });
  });

  // ─── SOURCES ENDPOINTS ───────────────────────────────────────────────────────

  describe('GET /api/v1/sources', () => {
    it('returns all active news sources', async () => {
      const res = await request(app).get('/api/v1/sources');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].domain).toBe('reuters-test.com');
    });
  });

  describe('GET /api/v1/sources/:id', () => {
    it('returns single source with article statistics', async () => {
      const res = await request(app).get(`/api/v1/sources/${source._id}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Reuters Test');
      expect(res.body.data.stats.articleCount).toBe(1);
    });

    it('returns 404 for non-existent source', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const res = await request(app).get(`/api/v1/sources/${fakeId}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('SOURCE_NOT_FOUND');
    });
  });
});
