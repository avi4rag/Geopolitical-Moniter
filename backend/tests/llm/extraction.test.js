import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ─── Mock declarations (must be before subject imports) ───────────────────────
vi.mock('../../src/services/llm/llmFactory.js', () => ({
  getLLMClient: vi.fn(),
}));

// ─── Subject imports (after mocks are declared) ───────────────────────────────
import { getLLMClient } from '../../src/services/llm/llmFactory.js';
import { runExtraction } from '../../src/services/llm/extractionService.js';
import { validateLLMOutput } from '../../src/services/llm/extractionSchema.js';
import { buildExtractionPrompt } from '../../src/services/llm/prompts.js';
import { Source, Article, Event } from '../../src/models/index.js';

// ─── LLM Extraction Tests ─────────────────────────────────────────────────────
// Tests schema validation, prompt building, and extraction service logic.
// All LLM API calls are mocked — no real Gemini calls in tests.
// ─────────────────────────────────────────────────────────────────────────────

// ──────────────────────────────────────────────────────────────────────────────
// EXTRACTION SCHEMA VALIDATION TESTS
// ──────────────────────────────────────────────────────────────────────────────

describe('validateLLMOutput', () => {
  it('validates a complete geopolitical event response', () => {
    const result = validateLLMOutput({
      isGeopoliticalEvent: true,
      eventType: 'SANCTION',
      summary: 'The US imposed sweeping new sanctions on Russian energy companies.',
      countries: ['United States', 'Russia'],
      regions: ['Eastern Europe'],
      sectors: ['Energy', 'Finance'],
      severity: 'HIGH',
      facts: ['Sanctions target 5 state-owned energy companies'],
      uncertainties: ['Full economic impact is unclear'],
      entities: ['US Treasury Department', 'Gazprom'],
    });

    expect(result.success).toBe(true);
    expect(result.data.eventType).toBe('SANCTION');
    expect(result.data.severity).toBe('HIGH');
  });

  it('validates a non-geopolitical event (isGeopoliticalEvent: false)', () => {
    const result = validateLLMOutput({ isGeopoliticalEvent: false });
    expect(result.success).toBe(true);
    expect(result.data.isGeopoliticalEvent).toBe(false);
  });

  it('rejects invalid eventType', () => {
    const result = validateLLMOutput({
      isGeopoliticalEvent: true,
      eventType: 'FAKE_EVENT_TYPE',
      summary: 'Some summary',
      severity: 'HIGH',
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain('eventType');
  });

  it('rejects invalid severity', () => {
    const result = validateLLMOutput({
      isGeopoliticalEvent: true,
      eventType: 'SANCTION',
      summary: 'Summary here.',
      severity: 'EXTREME',
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing required fields when isGeopoliticalEvent is true', () => {
    const result = validateLLMOutput({
      isGeopoliticalEvent: true,
      summary: 'Some summary',
      severity: 'HIGH',
      // eventType missing
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain('eventType');
  });

  it('defaults arrays to empty when not provided', () => {
    const result = validateLLMOutput({
      isGeopoliticalEvent: true,
      eventType: 'SANCTION',
      summary: 'A summary.',
      severity: 'MEDIUM',
    });
    expect(result.success).toBe(true);
    expect(result.data.countries).toEqual([]);
    expect(result.data.facts).toEqual([]);
    expect(result.data.entities).toEqual([]);
  });

  it('rejects completely empty object', () => {
    const result = validateLLMOutput({});
    expect(result.success).toBe(false);
  });

  it('accepts all valid severity levels', () => {
    const levels = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'MINIMAL'];
    for (const severity of levels) {
      const result = validateLLMOutput({
        isGeopoliticalEvent: true,
        eventType: 'SANCTION',
        summary: 'A factual summary.',
        severity,
      });
      expect(result.success).toBe(true);
    }
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// PROMPT BUILDER TESTS
// ──────────────────────────────────────────────────────────────────────────────

describe('buildExtractionPrompt', () => {
  const article = {
    title: 'US Imposes New Sanctions on Russian Energy Companies',
    url: 'https://theguardian.com/world/2024/01/15/sanctions',
    content: 'The United States Treasury Department announced sweeping new sanctions targeting five Russian state-owned energy companies on Monday.',
    excerpt: 'US Treasury announces sweeping sanctions on Russian energy sector.',
  };

  it('includes article title in prompt', () => {
    const prompt = buildExtractionPrompt(article);
    expect(prompt).toContain(article.title);
  });

  it('includes article url in prompt', () => {
    const prompt = buildExtractionPrompt(article);
    expect(prompt).toContain(article.url);
  });

  it('includes article content in prompt', () => {
    const prompt = buildExtractionPrompt(article);
    expect(prompt).toContain('Treasury Department');
  });

  it('truncates very long content to ~8000 chars', () => {
    const longContent = 'word '.repeat(5000); // ~25000 chars
    const prompt = buildExtractionPrompt({ ...article, content: longContent });
    expect(prompt).toContain('[Article truncated for analysis]');
    expect(prompt.length).toBeLessThan(15000);
  });

  it('falls back to excerpt when content is empty', () => {
    const prompt = buildExtractionPrompt({ ...article, content: '' });
    expect(prompt).toContain(article.excerpt);
  });

  it('includes SANCTION in valid eventType list', () => {
    const prompt = buildExtractionPrompt(article);
    expect(prompt).toContain('SANCTION');
  });

  it('includes severity guide', () => {
    const prompt = buildExtractionPrompt(article);
    expect(prompt).toContain('CRITICAL');
    expect(prompt).toContain('HIGH');
    expect(prompt).toContain('MEDIUM');
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// EXTRACTION SERVICE INTEGRATION TESTS (with mocked LLM)
// ──────────────────────────────────────────────────────────────────────────────

describe('runExtraction (with mocked LLM)', () => {
  let source;
  let mockLLMClient;

  beforeEach(async () => {
    source = await Source.create({
      name: 'Test Guardian',
      domain: 'test-guardian.com',
      type: 'MAJOR_INTERNATIONAL_NEWS',
      reliabilityScore: 0.85,
    });

    mockLLMClient = { generateJSON: vi.fn() };
    getLLMClient.mockReturnValue(mockLLMClient);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  async function createStoredArticle(overrides = {}) {
    return Article.create({
      title: 'US Imposes Sanctions on Russian Energy Sector',
      url: `https://test-guardian.com/article-${Date.now()}-${Math.random()}`,
      sourceId: source._id,
      content: 'The United States Treasury imposed new sanctions targeting Russian oil companies.',
      excerpt: 'US sanctions Russia energy sector.',
      publishedAt: new Date('2024-01-15'),
      processingStatus: 'STORED',
      relevanceScore: 0.85,
      contentHash: `hash-${Date.now()}-${Math.random()}`,
      ...overrides,
    });
  }

  it('returns empty stats when no STORED articles exist', async () => {
    const result = await runExtraction();
    expect(result.total).toBe(0);
    expect(result.analyzed).toBe(0);
    expect(mockLLMClient.generateJSON).not.toHaveBeenCalled();
  });

  it('marks article ANALYZED and creates Event on successful extraction', async () => {
    const article = await createStoredArticle();

    mockLLMClient.generateJSON.mockResolvedValueOnce({
      rawText: JSON.stringify({
        isGeopoliticalEvent: true,
        eventType: 'SANCTION',
        summary: 'US imposed sanctions on Russian energy companies.',
        countries: ['United States', 'Russia'],
        regions: ['Eastern Europe'],
        sectors: ['Energy'],
        severity: 'HIGH',
        facts: ['Sanctions target 5 companies'],
        uncertainties: [],
        entities: ['US Treasury'],
      }),
      inputTokens: 500,
      outputTokens: 150,
    });

    const result = await runExtraction({ batchSize: 1 });

    expect(result.analyzed).toBe(1);
    expect(result.irrelevant).toBe(0);
    expect(result.failed).toBe(0);

    const updatedArticle = await Article.findById(article._id);
    expect(updatedArticle.processingStatus).toBe('ANALYZED');

    const event = await Event.findOne({ primaryArticleId: article._id });
    expect(event).not.toBeNull();
    expect(event.eventType).toBe('SANCTION');
    expect(event.severity).toBe('HIGH');
    expect(event.extractionMetadata.inputTokens).toBe(500);
  });

  it('marks article IRRELEVANT when LLM says not a geopolitical event', async () => {
    const article = await createStoredArticle();

    mockLLMClient.generateJSON.mockResolvedValueOnce({
      rawText: JSON.stringify({ isGeopoliticalEvent: false }),
      inputTokens: 400,
      outputTokens: 10,
    });

    const result = await runExtraction({ batchSize: 1 });

    expect(result.irrelevant).toBe(1);
    expect(result.analyzed).toBe(0);

    const updatedArticle = await Article.findById(article._id);
    expect(updatedArticle.processingStatus).toBe('IRRELEVANT');

    const event = await Event.findOne({ primaryArticleId: article._id });
    expect(event).toBeNull();
  });

  it('increments processingAttempts and reverts to STORED on LLM failure', async () => {
    const article = await createStoredArticle();

    mockLLMClient.generateJSON.mockRejectedValueOnce(
      new Error('Gemini rate limit exceeded')
    );

    const result = await runExtraction({ batchSize: 1 });

    expect(result.failed).toBe(1);

    const updatedArticle = await Article.findById(article._id);
    expect(updatedArticle.processingStatus).toBe('STORED');
    expect(updatedArticle.processingAttempts).toBe(1);
    expect(updatedArticle.processingError).toContain('rate limit');
  });

  it('marks article FAILED after maxProcessingAttempts is reached', async () => {
    // processingAttempts: 2, maxProcessingAttempts: 3 (from env mock in setup)
    const article = await createStoredArticle({ processingAttempts: 2 });

    mockLLMClient.generateJSON.mockRejectedValueOnce(new Error('API error'));

    await runExtraction({ batchSize: 1 });

    const updatedArticle = await Article.findById(article._id);
    expect(updatedArticle.processingStatus).toBe('FAILED');
    expect(updatedArticle.processingAttempts).toBe(3);
  });

  it('skips articles below relevance threshold', async () => {
    await createStoredArticle({ relevanceScore: 0.1 }); // Below 0.3 threshold

    const result = await runExtraction({ batchSize: 5 });

    expect(result.total).toBe(0);
    expect(mockLLMClient.generateJSON).not.toHaveBeenCalled();
  });

  it('handles invalid JSON from LLM gracefully', async () => {
    const article = await createStoredArticle();

    mockLLMClient.generateJSON.mockResolvedValueOnce({
      rawText: 'this is not valid json {{{',
      inputTokens: 400,
      outputTokens: 5,
    });

    const result = await runExtraction({ batchSize: 1 });

    expect(result.failed).toBe(1);
    const updatedArticle = await Article.findById(article._id);
    expect(updatedArticle.processingError).toContain('JSON parse failed');
  });
});
