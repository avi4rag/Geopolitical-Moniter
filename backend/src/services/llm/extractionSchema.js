import { EVENT_TYPES, SEVERITY_LEVELS } from '../../config/constants.js';
import { z } from 'zod';

// ─── LLM Extraction Schema ────────────────────────────────────────────────────
// Defines the exact JSON structure the LLM must return.
// Validated with Zod after parsing — LLMs can hallucinate enum values.
//
// IMMUTABLE PRINCIPLE:
//   This schema defines what the LLM extracts.
//   Fields NOT in this schema are application-computed (credibility, impact).
//   The LLM never writes to credibilityLabel, credibilityScore, or any
//   ImpactAssessment field.
// ─────────────────────────────────────────────────────────────────────────────

export const PROMPT_VERSION = 'event-extraction-v1.1';

export const LLMExtractionSchema = z.object({
  // Gate: if false, article is not a geopolitical event → skip event creation
  isGeopoliticalEvent: z.boolean(),

  // Only required when isGeopoliticalEvent: true
  eventType: z
    .enum(EVENT_TYPES, {
      errorMap: () => ({ message: `Must be one of: ${EVENT_TYPES.join(', ')}` }),
    })
    .optional(),

  // 1–2 sentence factual summary — never paraphrase, only what's in the article
  summary: z.string().max(2000).optional(),

  countries: z.array(z.string().max(100)).default([]),
  regions: z.array(z.string().max(100)).default([]),
  sectors: z.array(z.string().max(100)).default([]),

  severity: z
    .enum(SEVERITY_LEVELS, {
      errorMap: () => ({ message: `Must be one of: ${SEVERITY_LEVELS.join(', ')}` }),
    })
    .optional(),

  // Discrete verifiable claims from the article text
  facts: z.array(z.string().max(500)).max(10).default([]),

  // Things the article itself flags as unconfirmed / alleged / disputed
  uncertainties: z.array(z.string().max(500)).max(5).default([]),

  // Named organizations, leaders, institutions
  entities: z.array(z.string().max(200)).max(20).default([]),
});

/**
 * Validate the raw JSON parsed from the LLM response.
 * @param {object} raw - Parsed JSON object from LLM
 * @returns {{ success: boolean, data?: object, error?: string }}
 */
export function validateLLMOutput(raw) {
  const result = LLMExtractionSchema.safeParse(raw);

  if (!result.success) {
    const messages = result.error.issues.map(
      (i) => `${i.path.join('.')}: ${i.message}`
    );
    return { success: false, error: messages.join('; ') };
  }

  // Additional semantic check: if it IS a geopolitical event, key fields must be present
  if (result.data.isGeopoliticalEvent) {
    const missing = [];
    if (!result.data.eventType) missing.push('eventType');
    if (!result.data.summary) missing.push('summary');
    if (!result.data.severity) missing.push('severity');

    if (missing.length > 0) {
      return {
        success: false,
        error: `isGeopoliticalEvent=true but missing required fields: ${missing.join(', ')}`,
      };
    }
  }

  return { success: true, data: result.data };
}
