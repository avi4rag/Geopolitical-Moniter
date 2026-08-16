import crypto from 'crypto';

// ─── Content Hashing ──────────────────────────────────────────────────────────
// SHA-256 hash of normalized article content.
// Used for cross-URL deduplication (same story reposted with a different URL).
//
// Normalization before hashing:
//   - lowercase
//   - collapse whitespace
//   - remove punctuation
// This makes the hash resilient to minor editorial changes.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Normalize text content before hashing.
 * @param {string} text
 * @returns {string}
 */
function normalizeText(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')   // remove punctuation
    .replace(/\s+/g, ' ')       // collapse whitespace
    .trim();
}

/**
 * Compute a SHA-256 hex hash of normalized content.
 * @param {string} content - Raw article content or title+excerpt
 * @returns {string} 64-character hex string
 */
export function hashContent(content) {
  const normalized = normalizeText(content);
  return crypto.createHash('sha256').update(normalized, 'utf8').digest('hex');
}

/**
 * Compute a hash from title + excerpt (used when full content unavailable).
 * @param {string} title
 * @param {string} excerpt
 * @returns {string}
 */
export function hashTitleExcerpt(title, excerpt) {
  return hashContent(`${title ?? ''} ${excerpt ?? ''}`);
}
