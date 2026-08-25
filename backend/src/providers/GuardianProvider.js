import axios from 'axios';
import { BaseProvider } from './BaseProvider.js';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

// ─── Guardian Provider ────────────────────────────────────────────────────────
// Fetches articles from The Guardian Content API.
// Free tier: up to 500 requests/day.
// Advantage: Returns full article body text (other APIs only give excerpts).
//
// API Docs: https://open-platform.theguardian.com/documentation/
//
// Search strategy:
//   - Query for geopolitical sections (world, politics, us-news, etc.)
//   - Use from-date to only fetch recent articles (avoid reprocessing old ones)
//   - Request bodyText field for full content (needed for accurate LLM extraction)
// ─────────────────────────────────────────────────────────────────────────────

const GUARDIAN_BASE_URL = 'https://content.guardianapis.com';

// Sections most likely to contain geopolitical content
const GEOPOLITICAL_SECTIONS = ['world', 'politics', 'us-news', 'global'];

// Guardian API fields to include in the response
const SHOW_FIELDS = 'bodyText,headline,byline,shortUrl,thumbnail,wordcount';

export class GuardianProvider extends BaseProvider {
  constructor(sourceId) {
    super('theguardian.com', sourceId);
  }

  /**
   * Fetch recent geopolitical articles from The Guardian.
   * @param {object} options
   * @param {Date} [options.fromDate] - Fetch articles published after this date
   * @param {number} [options.pageSize] - Max articles to fetch (default: 50)
   * @param {string[]} [options.sections] - Guardian sections to query
   * @returns {Promise<object[]>} Raw Guardian article objects
   */
  async fetchRawArticles(options = {}) {
    const {
      fromDate = this._getDefaultFromDate(),
      pageSize = 50,
      sections = GEOPOLITICAL_SECTIONS,
    } = options;

    const allArticles = [];

    for (const section of sections) {
      try {
        const articles = await this._fetchSection(section, fromDate, pageSize);
        allArticles.push(...articles);
        logger.debug(
          { section, count: articles.length },
          'Guardian: fetched section'
        );
      } catch (err) {
        // One section failing should NOT stop the others
        logger.warn(
          { err: err.message, section },
          'Guardian: section fetch failed, continuing'
        );
      }
    }

    // Deduplicate by ID (same article can appear in multiple sections)
    const seen = new Set();
    const unique = allArticles.filter((a) => {
      if (seen.has(a.id)) return false;
      seen.add(a.id);
      return true;
    });

    logger.info({ total: unique.length }, 'Guardian: fetch complete');
    return unique;
  }

  /**
   * Normalize a raw Guardian article into our standard shape.
   * @param {object} raw - Raw Guardian article object
   * @returns {object} Normalized article
   */
  normalizeArticle(raw) {
    const fields = raw.fields || {};

    // Use bodyText if available; fall back to headline as content
    const content = fields.bodyText || fields.headline || '';
    const title = fields.headline || raw.webTitle || '';
    const url = fields.shortUrl || raw.webUrl || '';

    return {
      title: title.trim(),
      url: url.trim(),
      sourceId: this.sourceId,
      content: content.trim().slice(0, 50000), // Hard cap for DB storage
      excerpt: this._buildExcerpt(content),
      author: fields.byline?.trim() || null,
      publishedAt: new Date(raw.webPublicationDate),
      imageUrl: fields.thumbnail?.trim() || null,
    };
  }

  /**
   * Validate that the Guardian API response has the expected structure.
   */
  isValidResponse(response) {
    return (
      response?.response?.status === 'ok' &&
      Array.isArray(response?.response?.results)
    );
  }

  // ─── Private Methods ───────────────────────────────────────────────────────

  async _fetchSection(section, fromDate, pageSize) {
    const fromDateStr = fromDate.toISOString().split('T')[0]; // YYYY-MM-DD

    const params = {
      section,
      'from-date': fromDateStr,
      'page-size': Math.min(pageSize, 50), // Guardian max is 200, but we cap at 50
      'show-fields': SHOW_FIELDS,
      'order-by': 'newest',
      'api-key': env.guardianApiKey,
    };

    let response;
    try {
      const result = await axios.get(`${GUARDIAN_BASE_URL}/search`, {
        params,
        timeout: 15_000, // 15 second timeout
        headers: { 'User-Agent': 'GeoMonitor/1.0 (research project)' },
      });
      response = result.data;
    } catch (err) {
      if (err.response?.status === 429) {
        throw new Error(`Guardian rate limit hit for section: ${section}`);
      }
      if (err.response?.status === 401 || err.response?.status === 403) {
        throw new Error('Guardian API key is invalid or expired');
      }
      if (err.code === 'ECONNABORTED') {
        throw new Error(`Guardian API timeout for section: ${section}`);
      }
      throw new Error(`Guardian API error: ${err.message}`);
    }

    if (!this.isValidResponse(response)) {
      throw new Error(
        `Guardian API returned unexpected format for section: ${section}`
      );
    }

    return response.response.results;
  }

  _getDefaultFromDate() {
    // Default: fetch articles from the last 24 hours
    const date = new Date();
    date.setHours(date.getHours() - 24);
    return date;
  }

  _buildExcerpt(content) {
    if (!content) return '';
    // Take first 500 chars, break at last sentence boundary
    const trimmed = content.trim().slice(0, 500);
    const lastPeriod = trimmed.lastIndexOf('.');
    return lastPeriod > 100 ? trimmed.slice(0, lastPeriod + 1) : trimmed;
  }
}
