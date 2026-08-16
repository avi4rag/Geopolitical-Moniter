import { describe, it, expect, vi, beforeEach } from 'vitest';
import { hashContent, hashTitleExcerpt } from '../../src/utils/hash.js';
import { scoreRelevance, isRelevant } from '../../src/utils/relevance.js';
import { validateNormalizedArticle } from '../../src/services/ingestion/validator.js';

// ─── Ingestion Unit Tests ─────────────────────────────────────────────────────
// Tests utilities and services used in the ingestion pipeline.
// Uses in-memory MongoDB from tests/setup.js.
// HTTP calls to Guardian/NewsAPI are NOT made — those are tested in integration.
// ─────────────────────────────────────────────────────────────────────────────

// ──────────────────────────────────────────────────────────────────────────────
// HASH UTILITY TESTS
// ──────────────────────────────────────────────────────────────────────────────

describe('hashContent', () => {
  it('returns a 64-char hex string', () => {
    const hash = hashContent('The president announced sanctions today.');
    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it('produces consistent hashes for the same input', () => {
    const text = 'Identical article content.';
    expect(hashContent(text)).toBe(hashContent(text));
  });

  it('produces the same hash for minor case differences', () => {
    const a = hashContent('The US imposed Sanctions on Russia.');
    const b = hashContent('the us imposed sanctions on russia.');
    expect(a).toBe(b);
  });

  it('produces the same hash for punctuation differences', () => {
    const a = hashContent('US imposed sanctions, embargo and tariffs.');
    const b = hashContent('US imposed sanctions  embargo and tariffs');
    expect(a).toBe(b);
  });

  it('produces different hashes for different content', () => {
    const a = hashContent('US imposed sanctions on Russia.');
    const b = hashContent('China announced a new trade agreement.');
    expect(a).not.toBe(b);
  });

  it('handles empty string gracefully', () => {
    const hash = hashContent('');
    expect(hash).toHaveLength(64);
  });

  it('handles null/undefined gracefully', () => {
    const hash = hashContent(null);
    expect(hash).toHaveLength(64);
  });
});

describe('hashTitleExcerpt', () => {
  it('combines title and excerpt for hashing', () => {
    const h1 = hashTitleExcerpt('Sanctions imposed', 'The US imposed sanctions');
    const h2 = hashTitleExcerpt('Sanctions imposed', 'The US imposed sanctions');
    expect(h1).toBe(h2);
  });

  it('differs from just title hash', () => {
    const h1 = hashTitleExcerpt('Title', 'Excerpt content here');
    const h2 = hashContent('Title');
    expect(h1).not.toBe(h2);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// RELEVANCE SCORER TESTS
// ──────────────────────────────────────────────────────────────────────────────

describe('scoreRelevance', () => {
  it('gives high score to clear geopolitical content', () => {
    const { score } = scoreRelevance({
      title: 'US imposes new sanctions on Russian energy companies',
      excerpt: 'The Biden administration announced sweeping sanctions targeting Russian oil exports',
    });
    expect(score).toBeGreaterThan(0.5);
  });

  it('gives low score to non-geopolitical content', () => {
    const { score } = scoreRelevance({
      title: 'Best recipes for chocolate cake at home',
      excerpt: 'Discover how to bake the perfect chocolate cake with our step by step guide',
    });
    expect(score).toBeLessThan(0.3);
  });

  it('gives zero score to empty content', () => {
    const { score } = scoreRelevance({ title: '', excerpt: '' });
    expect(score).toBe(0);
  });

  it('returns matched keywords', () => {
    const { matchedKeywords } = scoreRelevance({
      title: 'New sanction regime imposed',
      excerpt: 'Diplomatic tensions rise over trade embargo',
    });
    expect(matchedKeywords).toContain('sanction');
    expect(matchedKeywords).toContain('diplomatic');
    expect(matchedKeywords).toContain('embargo');
  });

  it('score is always between 0 and 1', () => {
    const texts = [
      { title: 'war conflict invasion coup ceasefire nuclear missile sanctions embargo', excerpt: 'military geopolitical treaty diplomatic foreign policy nato un security council' },
      { title: 'recipe cake baking', excerpt: 'food dessert chocolate' },
      { title: '', excerpt: '' },
    ];
    for (const text of texts) {
      const { score } = scoreRelevance(text);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(1);
    }
  });

  it('detects high-weight keywords that push score above threshold', () => {
    const { score } = scoreRelevance({
      title: 'Country invades neighbor in military conflict',
      excerpt: 'The invasion began at dawn',
    });
    expect(score).toBeGreaterThanOrEqual(0.3); // Above default threshold
  });
});

describe('isRelevant', () => {
  it('returns true for geopolitical articles', () => {
    expect(isRelevant({
      title: 'US sanctions Russian oil companies',
      excerpt: 'New diplomatic measures announced',
    })).toBe(true);
  });

  it('returns false for irrelevant articles', () => {
    expect(isRelevant({
      title: 'How to make the perfect sourdough bread',
      excerpt: 'A guide to home baking techniques',
    })).toBe(false);
  });

  it('respects custom threshold', () => {
    const article = { title: 'Government announces policy change', excerpt: 'Parliament debated the new law' };
    expect(isRelevant(article, 0.1)).toBe(true);
    expect(isRelevant(article, 0.99)).toBe(false);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// ARTICLE VALIDATOR TESTS
// ──────────────────────────────────────────────────────────────────────────────

describe('validateNormalizedArticle', () => {
  const baseArticle = {
    title: 'US Imposes New Sanctions on Russia',
    url: 'https://theguardian.com/world/2024/01/15/sanctions',
    sourceId: 'fake-source-id',
    content: 'The United States announced sweeping new sanctions...',
    excerpt: 'US sanctions Russia in latest diplomatic escalation.',
    author: 'Jane Doe',
    publishedAt: new Date('2024-01-15T12:00:00Z'),
  };

  it('validates a correct article', () => {
    const result = validateNormalizedArticle(baseArticle);
    expect(result.success).toBe(true);
    expect(result.data.title).toBe(baseArticle.title);
  });

  it('rejects article with no title', () => {
    const result = validateNormalizedArticle({ ...baseArticle, title: '' });
    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it('rejects article with title shorter than 5 chars', () => {
    const result = validateNormalizedArticle({ ...baseArticle, title: 'Hi' });
    expect(result.success).toBe(false);
  });

  it('rejects article with invalid URL', () => {
    const result = validateNormalizedArticle({ ...baseArticle, url: 'not-a-url' });
    expect(result.success).toBe(false);
    expect(result.error).toContain('url');
  });

  it('rejects article with future publishedAt', () => {
    const future = new Date();
    future.setFullYear(future.getFullYear() + 1);
    const result = validateNormalizedArticle({ ...baseArticle, publishedAt: future });
    expect(result.success).toBe(false);
    expect(result.error).toContain('future');
  });

  it('rejects article with publishedAt before 2000', () => {
    const result = validateNormalizedArticle({
      ...baseArticle,
      publishedAt: new Date('1995-01-01'),
    });
    expect(result.success).toBe(false);
  });

  it('allows missing optional fields', () => {
    const { author, excerpt, content, ...minimal } = baseArticle;
    const result = validateNormalizedArticle(minimal);
    expect(result.success).toBe(true);
  });
});
