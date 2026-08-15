// ─── Application Constants ────────────────────────────────────────────────────
// Central place for all enumerations and fixed values used across the app.
// Keep business constants here rather than scattered in model files.
// ─────────────────────────────────────────────────────────────────────────────

export const EVENT_TYPES = Object.freeze([
  'SANCTION',
  'ELECTION',
  'MILITARY_CONFLICT',
  'TREATY',
  'DIPLOMATIC_AGREEMENT',
  'EXPORT_RESTRICTION',
  'IMPORT_RESTRICTION',
  'TRADE_RESTRICTION',
  'POLICY_CHANGE',
  'POLITICAL_CRISIS',
  'RESOURCE_DISRUPTION',
  'INTERNATIONAL_DISPUTE',
  'GEOPOLITICAL_ANNOUNCEMENT',
  'OTHER',
]);

export const SEVERITY_LEVELS = Object.freeze(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);

export const PROCESSING_STATUSES = Object.freeze([
  'FETCHED',
  'VALIDATED',
  'STORED',
  'ANALYZING',
  'ANALYZED',
  'IMPACT_PROCESSED',
  'PUBLISHED',
  'FAILED',
  'IRRELEVANT',
]);

export const CREDIBILITY_LABELS = Object.freeze(['CONFIRMED', 'LIKELY', 'UNVERIFIED']);

export const CONFIDENCE_LEVELS = Object.freeze(['LOW', 'MEDIUM', 'HIGH']);

export const IMPACT_DOMAINS = Object.freeze([
  'ENERGY',
  'OIL_AND_GAS',
  'TRADE',
  'SUPPLY_CHAIN',
  'CURRENCY',
  'INFLATION',
  'DEFENSE',
  'TECHNOLOGY',
  'SEMICONDUCTORS',
  'FOOD_AGRICULTURE',
  'DIPLOMACY',
  'GLOBAL_STABILITY',
  'FINANCIAL_MARKETS',
]);

export const IMPACT_DIRECTIONS = Object.freeze([
  'POSITIVE',
  'NEGATIVE',
  'RISK_INCREASE',
  'RISK_DECREASE',
  'NEUTRAL',
]);

export const SOURCE_TYPES = Object.freeze([
  'OFFICIAL_GOVERNMENT',
  'INTERNATIONAL_ORG',
  'MAJOR_INTERNATIONAL_NEWS',
  'REGIONAL_PUBLICATION',
  'UNKNOWN',
]);

// Credibility score thresholds
export const CREDIBILITY_THRESHOLDS = Object.freeze({
  CONFIRMED: 0.75,
  LIKELY: 0.45,
  // below LIKELY → UNVERIFIED
});

// Confidence score thresholds
export const CONFIDENCE_THRESHOLDS = Object.freeze({
  HIGH: 0.7,
  MEDIUM: 0.4,
  // below MEDIUM → LOW
});

// LLM Configuration
export const LLM_CONFIG = Object.freeze({
  MODEL: 'gpt-4o-mini',
  MAX_TOKENS: 1024,
  TEMPERATURE: 0, // Deterministic output for structured extraction
  PROMPT_VERSION: '1.0',
});

// API Pagination defaults
export const PAGINATION = Object.freeze({
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
});
