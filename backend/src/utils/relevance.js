// ─── Geopolitical Relevance Scorer ───────────────────────────────────────────
// Fast keyword-based pre-filter to avoid sending irrelevant articles to the LLM.
//
// PURPOSE: Cost control. LLM calls cost money. We don't want to analyze
// articles about sports, entertainment, or local weather.
//
// HOW IT WORKS:
//   1. Scan title + excerpt against two tiers of keyword lists
//   2. Compute a weighted score (0.0–1.0)
//   3. Articles below RELEVANCE_THRESHOLD get status IRRELEVANT and skip LLM
//
// TRADEOFFS:
//   - False positives (sending irrelevant articles to LLM): costs money
//   - False negatives (blocking relevant articles): lose intelligence
//   - Threshold 0.3 is intentionally low to prefer recall over precision
//   - The LLM then does proper classification on what passes through
// ─────────────────────────────────────────────────────────────────────────────

// Tier 1: Strong geopolitical signals (high weight)
const HIGH_WEIGHT_KEYWORDS = [
  'sanction', 'sanctions', 'sanctioned',
  'invasion', 'invade', 'invades',
  'military conflict', 'armed conflict',
  'coup', 'overthrow',
  'nuclear', 'ballistic missile', 'warhead',
  'ceasefire', 'peace deal', 'peace agreement',
  'war crimes', 'genocide',
  'embargo', 'blockade',
  'trade war', 'trade dispute',
  'export ban', 'export restriction', 'import restriction',
  'geopolitical', 'geopolitics',
  'regime change',
  'security council', 'un resolution',
  'international dispute',
];

// Tier 2: Moderate geopolitical signals (medium weight)
const MEDIUM_WEIGHT_KEYWORDS = [
  'war', 'conflict', 'military',
  'election', 'referendum', 'vote',
  'treaty', 'agreement', 'deal', 'accord',
  'diplomat', 'diplomacy', 'diplomatic',
  'president', 'prime minister', 'chancellor',
  'foreign minister', 'foreign policy',
  'nato', 'g7', 'g20', 'brics', 'asean',
  'united nations', 'un', 'imf', 'world bank',
  'tariff', 'tariffs', 'trade',
  'protest', 'demonstration', 'uprising',
  'tension', 'crisis', 'standoff',
  'energy', 'oil', 'gas', 'petroleum',
  'semiconductor', 'chip ban', 'tech ban',
  'currency', 'inflation', 'economic',
  'border', 'territory', 'sovereignty',
  'refugee', 'displacement',
  'intelligence', 'espionage', 'spy',
  'cybersecurity', 'cyberattack',
];

// Tier 3: Weak signals — only relevant if combined with others (low weight)
const LOW_WEIGHT_KEYWORDS = [
  'government', 'parliament', 'congress', 'senate',
  'minister', 'official', 'leader',
  'international', 'global', 'worldwide',
  'policy', 'legislation', 'law',
  'economy', 'economic', 'finance',
  'defense', 'security', 'intelligence',
  'weapon', 'arms', 'troops', 'soldiers',
];

const WEIGHT_MAP = {
  HIGH: 0.9,
  MEDIUM: 0.5,
  LOW: 0.2,
};

/**
 * Score an article for geopolitical relevance.
 *
 * @param {{ title: string, excerpt?: string, content?: string }} article
 * @returns {{ score: number, matchedKeywords: string[] }}
 *   score: 0.0 (irrelevant) to 1.0 (highly relevant)
 */
export function scoreRelevance({ title = '', excerpt = '', content = '' }) {
  // Use title + excerpt for scoring (content can be very long — excerpt is enough)
  const text = `${title} ${excerpt}`.toLowerCase();

  const matched = new Set();
  let rawScore = 0;

  // Check each tier
  for (const kw of HIGH_WEIGHT_KEYWORDS) {
    if (text.includes(kw)) {
      matched.add(kw);
      rawScore += WEIGHT_MAP.HIGH;
    }
  }

  for (const kw of MEDIUM_WEIGHT_KEYWORDS) {
    if (text.includes(kw)) {
      matched.add(kw);
      rawScore += WEIGHT_MAP.MEDIUM;
    }
  }

  for (const kw of LOW_WEIGHT_KEYWORDS) {
    if (text.includes(kw)) {
      matched.add(kw);
      rawScore += WEIGHT_MAP.LOW;
    }
  }

  // Cap at 1.0 using a soft ceiling (tanh-like normalization)
  // rawScore of 1.0 maps to ~0.5; rawScore of 3.0+ maps close to 1.0
  const score = matched.size === 0 ? 0 : Math.min(1, rawScore / 3.0);

  return {
    score: Math.round(score * 100) / 100, // Round to 2 decimal places
    matchedKeywords: Array.from(matched),
  };
}

/**
 * Quick boolean check — is this article relevant enough for LLM processing?
 * @param {object} article
 * @param {number} threshold - Default 0.3
 * @returns {boolean}
 */
export function isRelevant(article, threshold = 0.3) {
  const { score } = scoreRelevance(article);
  return score >= threshold;
}
