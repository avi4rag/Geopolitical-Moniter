import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Provider imageUrl Normalization Tests ───────────────────────────────────
// Ensures both news providers correctly capture image URLs from API responses.
// Closes issue #11: Fix: News Article Picture
// ─────────────────────────────────────────────────────────────────────────────

// We test normalizeArticle() in isolation — no HTTP calls needed.
// The providers are thin classes; we instantiate them with a fake sourceId.

// ──────────────────────────────────────────────────────────────────────────────
// GuardianProvider.normalizeArticle() image capture
// ──────────────────────────────────────────────────────────────────────────────

describe('GuardianProvider.normalizeArticle — imageUrl', () => {
  let GuardianProvider;

  beforeEach(async () => {
    const mod = await import('../../src/providers/GuardianProvider.js');
    GuardianProvider = mod.GuardianProvider;
  });

  const makeProvider = () => {
    const p = new GuardianProvider();
    p.sourceId = 'test-source-id';
    return p;
  };

  const baseRaw = {
    webPublicationDate: '2025-01-15T10:00:00Z',
    webUrl: 'https://theguardian.com/world/2025/test',
    webTitle: 'Test Article',
    fields: {
      headline: 'Test Headline',
      bodyText: 'Body content here.',
      byline: 'Jane Doe',
      shortUrl: 'https://gu.com/p/abc123',
      thumbnail: 'https://media.guim.co.uk/photo.jpg',
    },
  };

  it('captures fields.thumbnail into imageUrl', () => {
    const provider = makeProvider();
    const result = provider.normalizeArticle(baseRaw);
    expect(result.imageUrl).toBe('https://media.guim.co.uk/photo.jpg');
  });

  it('sets imageUrl to null when thumbnail is absent', () => {
    const provider = makeProvider();
    const raw = { ...baseRaw, fields: { ...baseRaw.fields, thumbnail: undefined } };
    const result = provider.normalizeArticle(raw);
    expect(result.imageUrl).toBeNull();
  });

  it('sets imageUrl to null when thumbnail is empty string', () => {
    const provider = makeProvider();
    const raw = { ...baseRaw, fields: { ...baseRaw.fields, thumbnail: '' } };
    const result = provider.normalizeArticle(raw);
    expect(result.imageUrl).toBeNull();
  });

  it('trims whitespace from thumbnail URL', () => {
    const provider = makeProvider();
    const raw = {
      ...baseRaw,
      fields: { ...baseRaw.fields, thumbnail: '  https://media.guim.co.uk/photo.jpg  ' },
    };
    const result = provider.normalizeArticle(raw);
    expect(result.imageUrl).toBe('https://media.guim.co.uk/photo.jpg');
  });

  it('still returns all other fields alongside imageUrl', () => {
    const provider = makeProvider();
    const result = provider.normalizeArticle(baseRaw);
    expect(result.title).toBeTruthy();
    expect(result.url).toBeTruthy();
    expect(result.content).toBeTruthy();
    expect(result.publishedAt).toBeInstanceOf(Date);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// NewsApiProvider.normalizeArticle() image capture
// ──────────────────────────────────────────────────────────────────────────────

describe('NewsApiProvider.normalizeArticle — imageUrl', () => {
  let NewsApiProvider;

  beforeEach(async () => {
    const mod = await import('../../src/providers/NewsApiProvider.js');
    NewsApiProvider = mod.NewsApiProvider;
  });

  const makeProvider = () => {
    const p = new NewsApiProvider();
    p.sourceId = 'test-source-id';
    return p;
  };

  const baseRaw = {
    title: 'Test NewsAPI Article',
    url: 'https://example.com/article',
    description: 'A short description.',
    content: 'Full content of the article goes here [+3000 chars]',
    author: 'John Smith',
    publishedAt: '2025-01-15T10:00:00Z',
    urlToImage: 'https://cdn.example.com/image.jpg',
  };

  it('captures urlToImage into imageUrl', () => {
    const provider = makeProvider();
    const result = provider.normalizeArticle(baseRaw);
    expect(result.imageUrl).toBe('https://cdn.example.com/image.jpg');
  });

  it('sets imageUrl to null when urlToImage is absent', () => {
    const provider = makeProvider();
    const { urlToImage, ...raw } = baseRaw;
    const result = provider.normalizeArticle(raw);
    expect(result.imageUrl).toBeNull();
  });

  it('sets imageUrl to null when urlToImage is null', () => {
    const provider = makeProvider();
    const result = provider.normalizeArticle({ ...baseRaw, urlToImage: null });
    expect(result.imageUrl).toBeNull();
  });

  it('sets imageUrl to null when urlToImage is empty string', () => {
    const provider = makeProvider();
    const result = provider.normalizeArticle({ ...baseRaw, urlToImage: '' });
    expect(result.imageUrl).toBeNull();
  });

  it('trims whitespace from urlToImage', () => {
    const provider = makeProvider();
    const result = provider.normalizeArticle({
      ...baseRaw,
      urlToImage: '  https://cdn.example.com/image.jpg  ',
    });
    expect(result.imageUrl).toBe('https://cdn.example.com/image.jpg');
  });

  it('still returns all other fields alongside imageUrl', () => {
    const provider = makeProvider();
    const result = provider.normalizeArticle(baseRaw);
    expect(result.title).toBe('Test NewsAPI Article');
    expect(result.url).toBe('https://example.com/article');
    expect(result.excerpt).toBe('A short description.');
    expect(result.publishedAt).toBeInstanceOf(Date);
  });
});
