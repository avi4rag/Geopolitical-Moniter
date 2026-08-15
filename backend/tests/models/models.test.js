import { describe, it, expect, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import { Source, Article, Event, ImpactAssessment } from '../../src/models/index.js';

// ─── Model Tests ──────────────────────────────────────────────────────────────
// Tests model validation, constraints, defaults, and indexes.
// Uses in-memory MongoDB from tests/setup.js — no real DB needed.
// ─────────────────────────────────────────────────────────────────────────────

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeSource(overrides = {}) {
  return {
    name: 'Test Source',
    domain: 'test-source.com',
    type: 'MAJOR_INTERNATIONAL_NEWS',
    reliabilityScore: 0.85,
    ...overrides,
  };
}

async function createSource(overrides = {}) {
  return Source.create(makeSource(overrides));
}

function makeArticle(sourceId, overrides = {}) {
  return {
    title: 'Test Article About Sanctions',
    url: 'https://test-source.com/article-1',
    sourceId,
    content: 'The government announced new sanctions today.',
    publishedAt: new Date(),
    contentHash: 'abc123def456abc123def456abc123def456abc123def456abc123def456abc1',
    ...overrides,
  };
}

async function createArticle(sourceId, overrides = {}) {
  return Article.create(makeArticle(sourceId, overrides));
}

// ──────────────────────────────────────────────────────────────────────────────
// SOURCE MODEL TESTS
// ──────────────────────────────────────────────────────────────────────────────

describe('Source Model', () => {
  describe('Validation', () => {
    it('creates a valid source', async () => {
      const source = await createSource();
      expect(source._id).toBeDefined();
      expect(source.name).toBe('Test Source');
      expect(source.domain).toBe('test-source.com');
      expect(source.active).toBe(true); // default
      expect(source.createdAt).toBeDefined();
    });

    it('requires name', async () => {
      await expect(Source.create(makeSource({ name: undefined }))).rejects.toThrow(
        'Source name is required'
      );
    });

    it('requires domain', async () => {
      await expect(Source.create(makeSource({ domain: undefined }))).rejects.toThrow(
        'Domain is required'
      );
    });

    it('requires type', async () => {
      await expect(Source.create(makeSource({ type: undefined }))).rejects.toThrow(
        'Source type is required'
      );
    });

    it('rejects invalid type', async () => {
      await expect(Source.create(makeSource({ type: 'FAKE_TYPE' }))).rejects.toThrow();
    });

    it('rejects reliabilityScore > 1', async () => {
      await expect(Source.create(makeSource({ reliabilityScore: 1.5 }))).rejects.toThrow();
    });

    it('rejects reliabilityScore < 0', async () => {
      await expect(Source.create(makeSource({ reliabilityScore: -0.1 }))).rejects.toThrow();
    });

    it('defaults reliabilityScore to 0.5', async () => {
      const source = await Source.create(makeSource({ reliabilityScore: undefined }));
      expect(source.reliabilityScore).toBe(0.5);
    });

    it('lowercases domain automatically', async () => {
      const source = await createSource({ domain: 'TheguardiaN.COM' });
      expect(source.domain).toBe('theguardian.com');
    });

    it('enforces unique domain constraint', async () => {
      await createSource({ domain: 'unique-domain.com' });
      await expect(createSource({ domain: 'unique-domain.com' })).rejects.toThrow();
    });

    it('accepts all valid source types', async () => {
      const validTypes = [
        'OFFICIAL_GOVERNMENT',
        'INTERNATIONAL_ORG',
        'MAJOR_INTERNATIONAL_NEWS',
        'REGIONAL_PUBLICATION',
        'UNKNOWN',
      ];
      for (const [i, type] of validTypes.entries()) {
        const source = await createSource({ domain: `type-test-${i}.com`, type });
        expect(source.type).toBe(type);
      }
    });
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// ARTICLE MODEL TESTS
// ──────────────────────────────────────────────────────────────────────────────

describe('Article Model', () => {
  let source;

  beforeEach(async () => {
    source = await createSource({ domain: 'article-test.com' });
  });

  describe('Validation', () => {
    it('creates a valid article', async () => {
      const article = await createArticle(source._id);
      expect(article._id).toBeDefined();
      expect(article.processingStatus).toBe('FETCHED'); // default
      expect(article.processingAttempts).toBe(0); // default
      expect(article.relevanceScore).toBe(0); // default
    });

    it('requires title', async () => {
      await expect(createArticle(source._id, { title: undefined })).rejects.toThrow(
        'Title is required'
      );
    });

    it('requires url', async () => {
      await expect(createArticle(source._id, { url: undefined })).rejects.toThrow(
        'URL is required'
      );
    });

    it('requires sourceId', async () => {
      await expect(Article.create(makeArticle(undefined, { sourceId: undefined }))).rejects.toThrow(
        'Source reference is required'
      );
    });

    it('requires publishedAt', async () => {
      await expect(
        createArticle(source._id, { publishedAt: undefined })
      ).rejects.toThrow('Published date is required');
    });

    it('enforces unique url constraint', async () => {
      await createArticle(source._id, { url: 'https://unique-url.com/1' });
      await expect(
        createArticle(source._id, { url: 'https://unique-url.com/1' })
      ).rejects.toThrow();
    });

    it('rejects invalid processingStatus', async () => {
      await expect(
        createArticle(source._id, { processingStatus: 'INVALID_STATUS' })
      ).rejects.toThrow();
    });

    it('accepts all valid processing statuses', async () => {
      const statuses = [
        'FETCHED', 'VALIDATED', 'STORED', 'ANALYZING',
        'ANALYZED', 'IMPACT_PROCESSED', 'PUBLISHED', 'FAILED', 'IRRELEVANT',
      ];
      for (const [i, status] of statuses.entries()) {
        const article = await createArticle(source._id, {
          url: `https://test.com/status-${i}`,
          processingStatus: status,
        });
        expect(article.processingStatus).toBe(status);
      }
    });

    it('rejects relevanceScore > 1', async () => {
      await expect(
        createArticle(source._id, { relevanceScore: 1.5 })
      ).rejects.toThrow();
    });
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// EVENT MODEL TESTS
// ──────────────────────────────────────────────────────────────────────────────

describe('Event Model', () => {
  let source, article;

  beforeEach(async () => {
    source = await createSource({ domain: 'event-test.com' });
    article = await createArticle(source._id, { url: 'https://event-test.com/1' });
  });

  function makeEvent(overrides = {}) {
    return {
      primaryArticleId: article._id,
      articleIds: [article._id],
      eventType: 'SANCTION',
      summary: 'The US imposed new sanctions on Russian energy companies.',
      countries: ['United States', 'Russia'],
      sectors: ['Energy', 'Trade'],
      severity: 'HIGH',
      facts: ['Sanctions target 3 state-owned energy companies'],
      ...overrides,
    };
  }

  describe('Validation', () => {
    it('creates a valid event', async () => {
      const event = await Event.create(makeEvent());
      expect(event._id).toBeDefined();
      expect(event.credibilityLabel).toBe('UNVERIFIED'); // default
      expect(event.credibilityScore).toBe(0); // default
    });

    it('requires primaryArticleId', async () => {
      await expect(Event.create(makeEvent({ primaryArticleId: undefined }))).rejects.toThrow(
        'Primary article reference is required'
      );
    });

    it('requires eventType', async () => {
      await expect(Event.create(makeEvent({ eventType: undefined }))).rejects.toThrow(
        'Event type is required'
      );
    });

    it('requires summary', async () => {
      await expect(Event.create(makeEvent({ summary: undefined }))).rejects.toThrow(
        'Summary is required'
      );
    });

    it('requires severity', async () => {
      await expect(Event.create(makeEvent({ severity: undefined }))).rejects.toThrow(
        'Severity is required'
      );
    });

    it('rejects invalid eventType', async () => {
      await expect(Event.create(makeEvent({ eventType: 'FAKE_EVENT' }))).rejects.toThrow();
    });

    it('rejects invalid severity', async () => {
      await expect(Event.create(makeEvent({ severity: 'EXTREME' }))).rejects.toThrow();
    });

    it('accepts all valid event types', async () => {
      const types = [
        'SANCTION', 'ELECTION', 'MILITARY_CONFLICT', 'TREATY',
        'DIPLOMATIC_AGREEMENT', 'EXPORT_RESTRICTION', 'IMPORT_RESTRICTION',
        'TRADE_RESTRICTION', 'POLICY_CHANGE', 'POLITICAL_CRISIS',
        'RESOURCE_DISRUPTION', 'INTERNATIONAL_DISPUTE',
        'GEOPOLITICAL_ANNOUNCEMENT', 'OTHER',
      ];
      for (const eventType of types) {
        const event = await Event.create(makeEvent({ eventType }));
        expect(event.eventType).toBe(eventType);
        await event.deleteOne();
      }
    });

    it('defaults countries, regions, sectors, facts, uncertainties to empty arrays', async () => {
      const event = await Event.create(
        makeEvent({ countries: undefined, regions: undefined, sectors: undefined, facts: undefined })
      );
      expect(event.countries).toEqual([]);
      expect(event.regions).toEqual([]);
      expect(event.sectors).toEqual([]);
      expect(event.facts).toEqual([]);
    });
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// IMPACT ASSESSMENT MODEL TESTS
// ──────────────────────────────────────────────────────────────────────────────

describe('ImpactAssessment Model', () => {
  let source, article, event;

  beforeEach(async () => {
    source = await createSource({ domain: 'impact-test.com' });
    article = await createArticle(source._id, { url: 'https://impact-test.com/1' });
    event = await Event.create({
      primaryArticleId: article._id,
      articleIds: [article._id],
      eventType: 'SANCTION',
      summary: 'Test event for impact assessment',
      severity: 'HIGH',
    });
  });

  function makeAssessment(overrides = {}) {
    return {
      eventId: event._id,
      domain: 'TRADE',
      direction: 'RISK_INCREASE',
      severity: 'HIGH',
      confidence: 'MEDIUM',
      confidenceScore: 0.65,
      explanation: 'Potential disruption to established trade flows due to sanctions.',
      ruleId: 'SANCTION_EXPORTER_TRADE_RISK',
      version: 1,
      ...overrides,
    };
  }

  describe('Validation', () => {
    it('creates a valid impact assessment', async () => {
      const assessment = await ImpactAssessment.create(makeAssessment());
      expect(assessment._id).toBeDefined();
      expect(assessment.supersededAt).toBeNull(); // default
      expect(assessment.isLatest).toBe(true); // virtual
    });

    it('requires eventId', async () => {
      await expect(
        ImpactAssessment.create(makeAssessment({ eventId: undefined }))
      ).rejects.toThrow('Event reference is required');
    });

    it('requires domain', async () => {
      await expect(
        ImpactAssessment.create(makeAssessment({ domain: undefined }))
      ).rejects.toThrow('Domain is required');
    });

    it('requires explanation', async () => {
      await expect(
        ImpactAssessment.create(makeAssessment({ explanation: undefined }))
      ).rejects.toThrow('Explanation is required');
    });

    it('requires ruleId', async () => {
      await expect(
        ImpactAssessment.create(makeAssessment({ ruleId: undefined }))
      ).rejects.toThrow('Rule ID is required');
    });

    it('rejects invalid domain', async () => {
      await expect(
        ImpactAssessment.create(makeAssessment({ domain: 'FAKE_DOMAIN' }))
      ).rejects.toThrow();
    });

    it('rejects invalid direction', async () => {
      await expect(
        ImpactAssessment.create(makeAssessment({ direction: 'SIDEWAYS' }))
      ).rejects.toThrow();
    });

    it('rejects confidenceScore > 1', async () => {
      await expect(
        ImpactAssessment.create(makeAssessment({ confidenceScore: 1.1 }))
      ).rejects.toThrow();
    });

    it('rejects confidenceScore < 0', async () => {
      await expect(
        ImpactAssessment.create(makeAssessment({ confidenceScore: -0.1 }))
      ).rejects.toThrow();
    });

    it('marks isLatest as false when supersededAt is set', async () => {
      const assessment = await ImpactAssessment.create(
        makeAssessment({ supersededAt: new Date() })
      );
      expect(assessment.isLatest).toBe(false);
    });
  });

  describe('Versioning (immutability)', () => {
    it('supports multiple versions for the same event+domain', async () => {
      const v1 = await ImpactAssessment.create(makeAssessment({ version: 1 }));
      const v2 = await ImpactAssessment.create(
        makeAssessment({ version: 2, confidenceScore: 0.8, confidence: 'HIGH' })
      );

      // Supersede v1
      v1.supersededAt = new Date();
      await v1.save();

      const latest = await ImpactAssessment.findOne({
        eventId: event._id,
        domain: 'TRADE',
        supersededAt: null,
      });

      expect(latest.version).toBe(2);
      expect(latest.confidence).toBe('HIGH');
      expect(latest.isLatest).toBe(true);
    });
  });
});
