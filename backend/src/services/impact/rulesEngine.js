import { IMPACT_RULES } from '../../config/impactRules.js';

// ─── Rules Engine ─────────────────────────────────────────────────────────────
// Matches geopolitical events against the impact rules library.
//
// MATCHING ALGORITHM (all conditions are AND):
//   1. eventTypes filter: event.eventType must be in rule.eventTypes
//   2. severity filter:   event.severity must be in rule.severity
//   3. sectors filter:    event.sectors must intersect rule.sectors
//      (case-insensitive partial match to handle "Energy" vs "energy sector")
//   4. countries filter:  event.countries must intersect rule.countries
//
// CONFIDENCE SCORING:
//   Start with rule.baseConfidence
//   Apply severity multiplier: CRITICAL +0.06, HIGH +0.03, MEDIUM 0, LOW -0.05, MINIMAL -0.10
//   Clamp to [0.40, 0.98]
// ─────────────────────────────────────────────────────────────────────────────

const SEVERITY_ADJUSTMENT = Object.freeze({
  CRITICAL: 0.06,
  HIGH: 0.03,
  MEDIUM: 0.00,
  LOW: -0.05,
  MINIMAL: -0.10,
});

/**
 * Find all rules that match this event.
 *
 * @param {object} event - Mongoose Event document (lean or hydrated)
 * @returns {Array<{ rule: object, confidence: number }>} Sorted by confidence descending
 */
export function findMatchingRules(event) {
  const eventType = event.eventType;
  const severity = event.severity;
  const sectors = (event.sectors || []).map((s) => s.toLowerCase());
  const countries = (event.countries || []).map((c) => c.toLowerCase());

  const matches = [];

  for (const rule of IMPACT_RULES) {
    // 1. Event type filter
    if (rule.eventTypes?.length && !rule.eventTypes.includes(eventType)) {
      continue;
    }

    // 2. Severity filter
    if (rule.severity?.length && !rule.severity.includes(severity)) {
      continue;
    }

    // 3. Sectors filter (case-insensitive substring match)
    if (rule.sectors?.length) {
      const ruleSectors = rule.sectors.map((s) => s.toLowerCase());
      const hasMatch = ruleSectors.some((rs) =>
        sectors.some((es) => es.includes(rs) || rs.includes(es))
      );
      if (!hasMatch) continue;
    }

    // 4. Countries filter (case-insensitive)
    if (rule.countries?.length) {
      const ruleCountries = rule.countries.map((c) => c.toLowerCase());
      const hasMatch = ruleCountries.some((rc) =>
        countries.some((ec) => ec.includes(rc) || rc.includes(ec))
      );
      if (!hasMatch) continue;
    }

    // Rule matched — compute confidence
    const confidence = calculateConfidence(rule, severity);

    matches.push({ rule, confidence });
  }

  // Sort by confidence descending so the best rule for each domain is first
  matches.sort((a, b) => b.confidence - a.confidence);

  return matches;
}

/**
 * From a list of rule matches, keep only the HIGHEST-confidence match
 * per domain. This prevents duplicate assessments for the same domain
 * from multiple overlapping rules.
 *
 * @param {Array<{ rule: object, confidence: number }>} matches
 * @returns {Array<{ rule: object, confidence: number }>}
 */
export function deduplicateByDomain(matches) {
  const seen = new Map(); // domain → best match

  for (const match of matches) {
    const { domain } = match.rule;
    if (!seen.has(domain) || match.confidence > seen.get(domain).confidence) {
      seen.set(domain, match);
    }
  }

  return Array.from(seen.values());
}

/**
 * Calculate final confidence score for a matched rule.
 * @param {object} rule
 * @param {string} severity
 * @returns {number} 0.40 – 0.98
 */
function calculateConfidence(rule, severity) {
  const base = rule.baseConfidence;
  const adjustment = SEVERITY_ADJUSTMENT[severity] ?? 0;
  const raw = base + adjustment;
  // Clamp and round to 2 decimal places
  return Math.round(Math.max(0.40, Math.min(0.98, raw)) * 100) / 100;
}

/**
 * Get all unique domain names that could be impacted by an event.
 * Useful for quick lookups.
 * @param {object} event
 * @returns {string[]}
 */
export function getImpactedDomains(event) {
  const matches = findMatchingRules(event);
  return [...new Set(matches.map((m) => m.rule.domain))];
}

/** Expose all rules for inspection / testing */
export { IMPACT_RULES };
