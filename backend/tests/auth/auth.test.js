import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';
import { User, Event, Article, Source } from '../../src/models/index.js';

// ─── Authentication & User Bookmarks Integration Tests ───────────────────────
// Tests registration, login, logout, profile checks, and bookmark management.
// ─────────────────────────────────────────────────────────────────────────────

describe('Authentication & User API', () => {
  let event;
  let article;
  let source;

  beforeEach(async () => {
    source = await Source.create({
      name: 'Auth Test Source',
      domain: 'auth-test-source.com',
      type: 'MAJOR_INTERNATIONAL_NEWS',
      reliabilityScore: 0.9,
    });

    article = await Article.create({
      title: 'Global Economic Agreement Signed',
      url: `https://auth-test-source.com/article-${Date.now()}`,
      sourceId: source._id,
      content: 'A major trade agreement was reached today between leading economies.',
      publishedAt: new Date(),
      processingStatus: 'ANALYZED',
      contentHash: `hash-${Date.now()}-${Math.random()}`,
    });

    event = await Event.create({
      primaryArticleId: article._id,
      articleIds: [article._id],
      eventType: 'TRADE_RESTRICTION',
      summary: 'New bilateral trade restrictions implemented.',
      countries: ['United States', 'China'],
      sectors: ['Trade', 'Technology'],
      severity: 'HIGH',
      processingStatus: 'IMPACT_PROCESSED',
    });
  });

  describe('POST /api/v1/auth/register', () => {
    it('registers a new user successfully and sets HTTP-only auth cookie', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toBeDefined();
      expect(res.body.data.user.email).toBe('jane@example.com');
      expect(res.body.data.user.passwordHash).toBeUndefined();

      // Check HTTP-only auth cookie set
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toContain('token=');
    });

    it('rejects registration with duplicate email', async () => {
      await User.create({
        name: 'Existing User',
        email: 'jane@example.com',
        passwordHash: 'somehash',
      });

      const res = await request(app).post('/api/v1/auth/register').send({
        name: 'Jane Duplicate',
        email: 'jane@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('EMAIL_IN_USE');
    });

    it('rejects registration when passwords do not match', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        name: 'Mismatch User',
        email: 'mismatch@example.com',
        password: 'Password123!',
        confirmPassword: 'DifferentPassword!',
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toContain('do not match');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      const passwordHash = await User.hashPassword('Secret123!');
      await User.create({
        name: 'John Smith',
        email: 'john@example.com',
        passwordHash,
      });
    });

    it('logs in successfully with correct credentials', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'john@example.com',
        password: 'Secret123!',
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('john@example.com');
      expect(res.headers['set-cookie']).toBeDefined();
    });

    it('rejects login with invalid password using generic message', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'john@example.com',
        password: 'WrongPassword!',
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toBe('Invalid email or password');
    });

    it('rejects login with non-existent email', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'nobody@example.com',
        password: 'Secret123!',
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toBe('Invalid email or password');
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('returns null user for unauthenticated requests', async () => {
      const res = await request(app).get('/api/v1/auth/me');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toBeNull();
    });

    it('returns user profile when auth cookie is present', async () => {
      const regRes = await request(app).post('/api/v1/auth/register').send({
        name: 'Auth User',
        email: 'authuser@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      });

      const cookie = regRes.headers['set-cookie'];

      const meRes = await request(app).get('/api/v1/auth/me').set('Cookie', cookie);

      expect(meRes.status).toBe(200);
      expect(meRes.body.success).toBe(true);
      expect(meRes.body.data.user.email).toBe('authuser@example.com');
    });
  });

  describe('User Bookmarks (/api/v1/users/bookmarks)', () => {
    let authCookie;

    beforeEach(async () => {
      const regRes = await request(app).post('/api/v1/auth/register').send({
        name: 'Bookmark User',
        email: 'bookmark@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      });
      authCookie = regRes.headers['set-cookie'];
    });

    it('requires authentication to toggle bookmarks', async () => {
      const res = await request(app).post(`/api/v1/users/bookmarks/${event._id}`);
      expect(res.status).toBe(401);
    });

    it('toggles event bookmark on and off for authenticated user', async () => {
      // Toggle ON
      const res1 = await request(app)
        .post(`/api/v1/users/bookmarks/${event._id}`)
        .set('Cookie', authCookie);

      expect(res1.status).toBe(200);
      expect(res1.body.data.isBookmarked).toBe(true);

      // Toggle OFF
      const res2 = await request(app)
        .post(`/api/v1/users/bookmarks/${event._id}`)
        .set('Cookie', authCookie);

      expect(res2.status).toBe(200);
      expect(res2.body.data.isBookmarked).toBe(false);
    });

    it('fetches populated bookmarks list for authenticated user', async () => {
      // Add bookmark
      await request(app)
        .post(`/api/v1/users/bookmarks/${event._id}`)
        .set('Cookie', authCookie);

      const res = await request(app)
        .get('/api/v1/users/bookmarks')
        .set('Cookie', authCookie);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0]._id).toBe(event._id.toString());
    });
  });
});
