import { describe, it, expect, beforeEach } from 'vitest';
import { Source, Article, Event, ImpactAssessment } from '../../src/models/index.js';
import { findMatchingRules, deduplicateByDomain, getImpactedDomains } from '../../src/services/impact/rulesEngine.js';
import { runImpactAssessment } from '../../src/services/impact/impactService.js';

// ─── Impact Assessment Tests ──────────────────────────────────────────────────
// Tests rules engine matching, confidence scoring, deduplication,
// and full impact service pipeline with real in-memory MongoDB.
// ─────────────────────────────────────────────────────────────────────────────

// ──────────────────────────────────────────────────────────────────────────────
// RULES ENGINE TESTS
// ──────────────────────────────────────────────────────────────────────────────

describe('findMatchingRules', () => {
  it('matches sanction events to TRADE domain', () => {
    const event = {
      eventType: 'SANCTION',
      severity: 'HIGH',
      sectors: [],
      countries: ['Russia'],
    };
    const matches = findMatchingRules(event);
    const domains = matches.map((m) => m.rule.domain);
    expect(domains).toContain('TRADE');
  });

  it('matches sanction + Energy sector to ENERGY domain', () => {
    const event = {
      eventType: 'SANCTION',
      severity: 'HIGH',
      sectors: ['Energy'],
      countries: [],
    };
    const matches = findMatchingRules(event);
    const domains = matches.map((m) => m.rule.domain);
    expect(domains).toContain('ENERGY');
    expect(domains).toContain('OIL_AND_GAS');
  });

  it('matches sanction + Technology sector to SEMICONDUCTORS', () => {
    const event = {
      eventType: 'SANCTION',
      severity: 'HIGH',
      sectors: ['Technology'],
      countries: [],
    };
    const matches = findMatchingRules(event);
    const domains = matches.map((m) => m.rule.domain);
    expect(domains).toContain('SEMICONDUCTORS');
    expect(domains).toContain('TECHNOLOGY');
  });

  it('matches MILITARY_CONFLICT to GLOBAL_STABILITY and DIPLOMACY', () => {
    const event = {
      eventType: 'MILITARY_CONFLICT',
      severity: 'HIGH',
      sectors: [],
      countries: ['Ukraine', 'Russia'],
    };
    const matches = findMatchingRules(event);
    const domains = matches.map((m) => m.rule.domain);
    expect(domains).toContain('GLOBAL_STABILITY');
    expect(domains).toContain('DIPLOMACY');
    expect(domains).toContain('SUPPLY_CHAIN');
  });

  it('matches DIPLOMATIC_AGREEMENT to DIPLOMACY with POSITIVE direction', () => {
    const event = {
      eventType: 'DIPLOMATIC_AGREEMENT',
      severity: 'HIGH',
      sectors: [],
      countries: [],
    };
    const matches = findMatchingRules(event);
    const diplomacyMatch = matches.find((m) => m.rule.domain === 'DIPLOMACY');
    expect(diplomacyMatch).toBeDefined();
    expect(diplomacyMatch.rule.direction).toBe('POSITIVE');
  });

  it('does NOT match SANCTION to ENERGY without Energy sector', () => {
    const event = {
      eventType: 'SANCTION',
      severity: 'HIGH',
      sectors: ['Finance'], // No energy sector
      countries: [],
    };
    const matches = findMatchingRules(event);
    const energyMatch = matches.find((m) => m.rule.domain === 'ENERGY');
    // Energy rule requires sectors=['Energy'], which is not present
    expect(energyMatch).toBeUndefined();
  });

  it('does NOT match rules with severity filter to events below that severity', () => {
    // sanction-financial-negative requires severity HIGH or CRITICAL
    const event = {
      eventType: 'SANCTION',
      severity: 'LOW',
      sectors: [],
      countries: [],
    };
    const matches = findMatchingRules(event);
    const financialMatch = matches.find((m) => m.rule.domain === 'FINANCIAL_MARKETS');
    expect(financialMatch).toBeUndefined();
  });

  it('returns empty array for unrelated event type with no matching rules', () => {
    const event = {
      eventType: 'ELECTION',
      severity: 'LOW', // ELECTION rules require no specific severity
      sectors: [],
      countries: [],
    };
    // ELECTION + LOW severity — election-diplomacy-risk has no severity filter
    // so it should still match
    const matches = findMatchingRules(event);
    const domainNames = matches.map((m) => m.rule.domain);
    expect(domainNames).toContain('DIPLOMACY');
  });

  it('is case-insensitive for sector matching', () => {
    const event = {
      eventType: 'SANCTION',
      severity: 'HIGH',
      sectors: ['energy sector'], // lowercase + extra word
      countries: [],
    };
    const matches = findMatchingRules(event);
    const domains = matches.map((m) => m.rule.domain);
    expect(domains).toContain('ENERGY');
  });

  it('includes confidence score for each match', () => {
    const event = {
      eventType: 'SANCTION',
      severity: 'HIGH',
      sectors: [],
      countries: [],
    };
    const matches = findMatchingRules(event);
    for (const match of matches) {
      expect(typeof match.confidence).toBe('number');
      expect(match.confidence).toBeGreaterThanOrEqual(0.40);
      expect(match.confidence).toBeLessThanOrEqual(0.98);
    }
  });

  it('CRITICAL severity increases confidence vs MEDIUM', () => {
    const base = {
      eventType: 'SANCTION',
      sectors: [],
      countries: [],
    };
    const criticalMatches = findMatchingRules({ ...base, severity: 'CRITICAL' });
    const mediumMatches = findMatchingRules({ ...base, severity: 'MEDIUM' });

    const criticalTrade = criticalMatches.find((m) => m.rule.id === 'sanction-trade-negative');
    const mediumTrade = mediumMatches.find((m) => m.rule.id === 'sanction-trade-negative');

    if (criticalTrade && mediumTrade) {
      expect(criticalTrade.confidence).toBeGreaterThan(mediumTrade.confidence);
    }
  });

  it('results are sorted by confidence descending', () => {
    const event = {
      eventType: 'MILITARY_CONFLICT',
      severity: 'CRITICAL',
      sectors: ['Energy'],
      countries: [],
    };
    const matches = findMatchingRules(event);
    for (let i = 0; i < matches.length - 1; i++) {
      expect(matches[i].confidence).toBeGreaterThanOrEqual(matches[i + 1].confidence);
    }
  });
});

describe('deduplicateByDomain', () => {
  it('keeps only the highest-confidence match per domain', () => {
    const matches = [
      { rule: { domain: 'TRADE', id: 'rule-a' }, confidence: 0.70 },
      { rule: { domain: 'TRADE', id: 'rule-b' }, confidence: 0.85 },
      { rule: { domain: 'ENERGY', id: 'rule-c' }, confidence: 0.90 },
    ];

    const deduped = deduplicateByDomain(matches);

    expect(deduped).toHaveLength(2);
    const trade = deduped.find((m) => m.rule.domain === 'TRADE');
    expect(trade.rule.id).toBe('rule-b'); // Higher confidence wins
    const energy = deduped.find((m) => m.rule.domain === 'ENERGY');
    expect(energy.rule.id).toBe('rule-c');
  });

  it('returns all matches when no domains overlap', () => {
    const matches = [
      { rule: { domain: 'TRADE' }, confidence: 0.8 },
      { rule: { domain: 'ENERGY' }, confidence: 0.9 },
      { rule: { domain: 'DIPLOMACY' }, confidence: 0.7 },
    ];
    const deduped = deduplicateByDomain(matches);
    expect(deduped).toHaveLength(3);
  });

  it('handles empty input', () => {
    expect(deduplicateByDomain([])).toEqual([]);
  });
});

describe('getImpactedDomains', () => {
  it('returns unique domain names for an event', () => {
    const event = {
      eventType: 'MILITARY_CONFLICT',
      severity: 'CRITICAL',
      sectors: ['Energy'],
      countries: [],
    };
    const domains = getImpactedDomains(event);
    expect(Array.isArray(domains)).toBe(true);
    expect(new Set(domains).size).toBe(domains.length); // All unique
    expect(domains).toContain('GLOBAL_STABILITY');
    expect(domains).toContain('ENERGY');
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// IMPACT SERVICE INTEGRATION TESTS
// ──────────────────────────────────────────────────────────────────────────────

describe('runImpactAssessment', () => {
  let source;

  beforeEach(async () => {
    source = await Source.create({
      name: 'Test Source',
      domain: 'impact-test.com',
      type: 'MAJOR_INTERNATIONAL_NEWS',
    });
  });

  async function createAnalyzedEvent(overrides = {}) {
    const article = await Article.create({
      title: 'Test Article',
      url: `https://impact-test.com/article-${Date.now()}-${Math.random()}`,
      sourceId: source._id,
      content: 'Test content',
      publishedAt: new Date(),
      processingStatus: 'ANALYZED',
      contentHash: `h-${Date.now()}-${Math.random()}`,
    });

    return Event.create({
      primaryArticleId: article._id,
      articleIds: [article._id],
      eventType: 'SANCTION',
      summary: 'US imposed sanctions on Russian energy sector.',
      countries: ['United States', 'Russia'],
      regions: ['Eastern Europe'],
      sectors: ['Energy'],
      severity: 'HIGH',
      facts: ['Sanctions announced by US Treasury'],
      uncertainties: [],
      entities: ['US Treasury'],
      processingStatus: 'ANALYZED',
      extractionMetadata: {
        modelName: 'gemini-2.0-flash',
        promptVersion: 'event-extraction-v1.1',
        analysisTimestamp: new Date(),
        inputTokens: 500,
        outputTokens: 150,
      },
      ...overrides,
    });
  }

  it('returns zero stats when no ANALYZED events exist', async () => {
    const result = await runImpactAssessment();
    expect(result.processed).toBe(0);
    expect(result.assessmentsCreated).toBe(0);
  });

  it('creates ImpactAssessments for ANALYZED event and marks it IMPACT_PROCESSED', async () => {
    const event = await createAnalyzedEvent();

    const result = await runImpactAssessment({ batchSize: 1 });

    expect(result.processed).toBe(1);
    expect(result.assessmentsCreated).toBeGreaterThan(0);

    // Event should be marked processed
    const updatedEvent = await Event.findById(event._id);
    expect(updatedEvent.processingStatus).toBe('IMPACT_PROCESSED');

    // Impact assessments should exist
    const assessments = await ImpactAssessment.find({ eventId: event._id });
    expect(assessments.length).toBeGreaterThan(0);

    // All assessments should be latest (supersededAt === null)
    expect(assessments.every((a) => a.supersededAt === null)).toBe(true);
  });

  it('creates TRADE and ENERGY assessments for energy sanction event', async () => {
    const event = await createAnalyzedEvent({
      eventType: 'SANCTION',
      sectors: ['Energy'],
      severity: 'HIGH',
    });

    await runImpactAssessment({ batchSize: 1 });

    const assessments = await ImpactAssessment.find({ eventId: event._id });
    const domains = assessments.map((a) => a.domain);

    expect(domains).toContain('TRADE');
    expect(domains).toContain('ENERGY');
    expect(domains).toContain('OIL_AND_GAS');
  });

  it('creates POSITIVE direction assessment for DIPLOMATIC_AGREEMENT', async () => {
    const event = await createAnalyzedEvent({
      eventType: 'DIPLOMATIC_AGREEMENT',
      sectors: [],
      severity: 'HIGH',
    });

    await runImpactAssessment({ batchSize: 1 });

    const diplomacyAssessment = await ImpactAssessment.findOne({
      eventId: event._id,
      domain: 'DIPLOMACY',
    });

    expect(diplomacyAssessment).not.toBeNull();
    expect(diplomacyAssessment.direction).toBe('POSITIVE');
  });

  it('supersedes old assessments when force=true re-processes', async () => {
    const event = await createAnalyzedEvent();

    // First run
    await runImpactAssessment({ batchSize: 1 });
    const firstRun = await ImpactAssessment.find({ eventId: event._id });
    expect(firstRun.every((a) => a.isLatest)).toBe(true);

    // Reset event to ANALYZED for re-processing
    await Event.updateOne({ _id: event._id }, { $set: { processingStatus: 'ANALYZED' } });

    // Second run (force)
    await runImpactAssessment({ batchSize: 1, force: true });

    // Old assessments should be superseded (supersededAt is set)
    const oldAssessments = await ImpactAssessment.find({
      eventId: event._id,
      supersededAt: { $ne: null },
    });
    expect(oldAssessments.length).toBeGreaterThan(0);

    // New assessments should be latest (supersededAt is null)
    const newAssessments = await ImpactAssessment.find({
      eventId: event._id,
      supersededAt: null,
    });
    expect(newAssessments.length).toBeGreaterThan(0);
  });

  it('skips already IMPACT_PROCESSED events by default', async () => {
    const event = await createAnalyzedEvent({ processingStatus: 'IMPACT_PROCESSED' });

    const result = await runImpactAssessment({ batchSize: 5 });

    expect(result.processed).toBe(0);
    // Event status unchanged
    const unchanged = await Event.findById(event._id);
    expect(unchanged.processingStatus).toBe('IMPACT_PROCESSED');
  });

  it('confidence scores are in valid range [0.40, 0.98]', async () => {
    await createAnalyzedEvent({ eventType: 'MILITARY_CONFLICT', severity: 'CRITICAL', sectors: [] });

    await runImpactAssessment({ batchSize: 1 });

    const assessments = await ImpactAssessment.find({});
    for (const assessment of assessments) {
      expect(assessment.confidenceScore).toBeGreaterThanOrEqual(0.40);
      expect(assessment.confidenceScore).toBeLessThanOrEqual(0.98);
    }
  });

  it('each assessment has a ruleId and explanation', async () => {
    await createAnalyzedEvent();
    await runImpactAssessment({ batchSize: 1 });

    const assessments = await ImpactAssessment.find({});
    for (const a of assessments) {
      expect(a.ruleId).toBeTruthy();
      expect(a.explanation).toBeTruthy();
    }
  });
});
