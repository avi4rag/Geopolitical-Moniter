import axios from 'axios';
import { BaseProvider } from './BaseProvider.js';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

// ─── NewsAPI Provider ─────────────────────────────────────────────────────────
// Fetches articles from NewsAPI.org.
// Free developer tier: up to 100 requests/day, articles from last 30 days.
//
// LIMITATION: The free tier only returns the first ~200 characters of content.
// We use excerpt/description for relevance scoring; full text comes from Guardian.
// This provider is supplemental — it adds breadth, Guardian adds depth.
//
// API Docs: https://newsapi.org/docs
// ─────────────────────────────────────────────────────────────────────────────

const NEWSAPI_BASE_URL = 'https://newsapi.org/v2';

// Geopolitical search queries for NewsAPI
const SEARCH_QUERIES = [
  'sanctions OR "military conflict" OR geopolitics',
  'treaty OR diplomatic OR "foreign policy"',
  '"trade war" OR embargo OR "export ban"',
];

export class NewsApiProvider extends BaseProvider {
  constructor(sourceId) {
    super('newsapi.org', sourceId);
  }

  /**
   * Fetch recent geopolitical articles from NewsAPI.
   * @param {object} options
   * @param {Date} [options.fromDate]
   * @param {number} [options.pageSize]
   * @returns {Promise<object[]>}
   */
  async fetchRawArticles(options = {}) {
    if (!env.newsApiKey) {
      logger.warn('NewsAPI: NEWS_API_KEY not set, skipping provider');
      return [];
    }

    const {
      fromDate = this._getDefaultFromDate(),
      pageSize = 30, // Conservative: we have 100 req/day budget
    } = options;

    const allArticles = [];

    for (const query of SEARCH_QUERIES) {
      try {
        const articles = await this._fetchQuery(query, fromDate, pageSize);
        allArticles.push(...articles);
        logger.debug({ query, count: articles.length }, 'NewsAPI: fetched query');
      } catch (err) {
        logger.warn({ err: err.message, query }, 'NewsAPI: query failed, continuing');
      }
    }

    // Remove articles with no URL or [Removed] content (NewsAPI placeholder)
    const valid = allArticles.filter(
      (a) => a.url && a.url !== 'https://removed.com' && a.title !== '[Removed]'
    );

    // Deduplicate by URL
    const seen = new Set();
    const unique = valid.filter((a) => {
      if (seen.has(a.url)) return false;
      seen.add(a.url);
      return true;
    });

    logger.info({ total: unique.length }, 'NewsAPI: fetch complete');
    return unique;
  }

  /**
   * Normalize a raw NewsAPI article.
   */
  normalizeArticle(raw) {
    // NewsAPI free tier: content is truncated at ~200 chars
    // Use description (excerpt) + truncated content as best available text
    const content = raw.content?.replace(/\[\+\d+ chars\]$/, '').trim() || '';
    const excerpt = raw.description?.trim() || '';

    return {
      title: (raw.title || '').trim(),
      url: (raw.url || '').trim(),
      sourceId: this.sourceId,
      content: content.slice(0, 50000),
      excerpt: excerpt.slice(0, 2000),
      author: raw.author?.trim() || null,
      publishedAt: raw.publishedAt ? new Date(raw.publishedAt) : new Date(),
    };
  }

  isValidResponse(response) {
    return response?.status === 'ok' && Array.isArray(response?.articles);
  }

  // ─── Private ───────────────────────────────────────────────────────────────

  async _fetchQuery(query, fromDate, pageSize) {
    const fromDateStr = fromDate.toISOString().split('T')[0];

    const params = {
      q: query,
      language: 'en',
      sortBy: 'publishedAt',
      pageSize: Math.min(pageSize, 100),
      from: fromDateStr,
      apiKey: env.newsApiKey,
    };

    let response;
    try {
      const result = await axios.get(`${NEWSAPI_BASE_URL}/everything`, {
        params,
        timeout: 15_000,
        headers: { 'User-Agent': 'GeoMonitor/1.0 (research project)' },
      });
      response = result.data;
    } catch (err) {
      if (err.response?.status === 429) {
        throw new Error('NewsAPI rate limit exceeded');
      }
      if (err.response?.status === 401) {
        throw new Error('NewsAPI key is invalid');
      }
      if (err.code === 'ECONNABORTED') {
        throw new Error(`NewsAPI timeout for query: ${query}`);
      }
      // Log the actual API error message if available
      const apiMsg = err.response?.data?.message;
      throw new Error(apiMsg ? `NewsAPI error: ${apiMsg}` : `NewsAPI error: ${err.message}`);
    }

    if (!this.isValidResponse(response)) {
      throw new Error(`NewsAPI unexpected format for query: ${query}`);
    }

    return response.articles;
  }

  _getDefaultFromDate() {
    const date = new Date();
    date.setHours(date.getHours() - 24);
    return date;
  }
}
