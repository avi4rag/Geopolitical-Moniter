// ─── Base Provider ────────────────────────────────────────────────────────────
// Abstract base class for all news source adapters.
// Each provider implements:
//   - fetchRawArticles(): calls the source API, returns raw response
//   - normalizeArticle(): converts raw format to our standard shape
//
// Providers MUST NOT access the database.
// Providers MUST NOT throw without wrapping errors.
// All HTTP calls must respect timeout and rate-limit settings.
// ─────────────────────────────────────────────────────────────────────────────

export class BaseProvider {
  constructor(name, sourceId) {
    this.name = name;
    this.sourceId = sourceId;
  }

  /**
   * Unique identifier for this provider (matches Source.domain).
   * @returns {string}
   */
  getName() {
    return this.name;
  }

  /**
   * Fetch raw articles from the external API.
   * Must be implemented by each provider.
   * @param {object} options - Provider-specific options (dates, query, etc.)
   * @returns {Promise<object[]>} Raw article objects from the API
   */
  async fetchRawArticles(options = {}) {
    throw new Error(`fetchRawArticles() must be implemented by ${this.name}`);
  }

  /**
   * Normalize a raw article into our standard shape.
   * Must be implemented by each provider.
   * @param {object} rawArticle - Raw API response object
   * @returns {object} Normalized article matching ArticleNormalizedSchema
   */
  normalizeArticle(rawArticle) {
    throw new Error(`normalizeArticle() must be implemented by ${this.name}`);
  }

  /**
   * Validate that the raw API response is in expected format.
   * Override to add provider-specific validation.
   * @param {object} response
   * @returns {boolean}
   */
  isValidResponse(response) {
    return response !== null && response !== undefined;
  }
}
