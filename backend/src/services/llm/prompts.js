import { EVENT_TYPES, SEVERITY_LEVELS, IMPACT_DOMAINS } from '../../config/constants.js';
import { PROMPT_VERSION } from './extractionSchema.js';

// ─── Prompt Templates ─────────────────────────────────────────────────────────
// Versioned prompt templates for LLM event extraction.
//
// VERSIONING PRINCIPLE:
//   Every extraction stores PROMPT_VERSION in extractionMetadata.
//   When the prompt changes, bump PROMPT_VERSION in extractionSchema.js.
//   This allows you to re-process articles that used outdated prompts.
//
// DESIGN PRINCIPLES:
//   1. Tell the model exactly what to extract (not what to infer)
//   2. Provide the exact enum values it must choose from
//   3. Tell it explicitly what NOT to do (no inference, no hallucination)
//   4. Show it the expected JSON structure
// ─────────────────────────────────────────────────────────────────────────────

const SYSTEM_INSTRUCTION = `You are a geopolitical intelligence extraction system.
Your sole job is to read a news article and extract structured data about geopolitical events.

STRICT RULES (violating these makes your output useless):
1. Extract ONLY facts explicitly stated in the article. Never infer, assume, or add context.
2. If the article is NOT about a geopolitical event, return: {"isGeopoliticalEvent": false}
3. Do NOT set fields to values not present in the article.
4. All string values must come directly from the article text.
5. "facts" must be discrete, verifiable claims the article states as fact.
6. "uncertainties" must be things the article itself says are unconfirmed, alleged, or disputed.
7. "entities" are named organizations, governments, military units, or prominent leaders only.
8. Country names must be full country names (e.g. "United States" not "US").

WHAT COUNTS AS A GEOPOLITICAL EVENT:
- Military conflicts, invasions, ceasefires
- Economic sanctions, trade restrictions, embargoes
- Major diplomatic events, treaties, agreements, breakdowns
- Elections with geopolitical significance, coups, regime changes
- Nuclear/weapons developments
- Major international policy changes affecting multiple countries

WHAT DOES NOT COUNT:
- Domestic policy with no international dimension
- Sports, entertainment, science unrelated to geopolitics
- Routine political statements without concrete action
- Opinion pieces without factual events

SEVERITY GUIDE:
- CRITICAL: Imminent military threat, active war escalation, nuclear/WMD use
- HIGH: Active armed conflict, major multi-country sanctions, diplomatic breakdown, coup
- MEDIUM: Trade disputes, significant diplomatic tensions, contested elections, political crisis
- LOW: Routine policy announcements, minor diplomatic events
- MINIMAL: General international news, routine political activity

VALID eventType VALUES (choose the best match):
${EVENT_TYPES.join(', ')}

VALID severity VALUES (choose exactly one):
${SEVERITY_LEVELS.join(', ')}

VALID sectors (use only if mentioned in article):
Energy, Technology, Finance, Trade, Agriculture, Defense, Healthcare, Transportation, Mining, Manufacturing, Diplomacy, Other

You MUST return ONLY valid JSON matching this exact structure (no markdown, no explanation):
{
  "isGeopoliticalEvent": true,
  "eventType": "<one of the valid eventType values>",
  "summary": "<1-2 sentence factual summary using only article facts>",
  "countries": ["<full country name>"],
  "regions": ["<geographic region e.g. Middle East, Southeast Asia>"],
  "sectors": ["<affected sector>"],
  "severity": "<one of the valid severity values>",
  "facts": ["<verifiable claim from article>"],
  "uncertainties": ["<thing article flags as unconfirmed or alleged>"],
  "entities": ["<named organization or leader>"]
}`;

/**
 * Build the complete extraction prompt for a single article.
 *
 * @param {{ title: string, content: string, excerpt?: string, url: string }} article
 * @returns {string} The full prompt to send to the LLM
 */
export function buildExtractionPrompt(article) {
  // Use content if available; fall back to excerpt only
  const body = article.content?.trim() || article.excerpt?.trim() || '';

  // Truncate very long articles to ~8,000 chars to stay within context limits
  // Gemini 2.0 Flash context: 1M tokens, but we cap to control cost
  const truncatedBody = body.length > 8000
    ? body.slice(0, 8000) + '\n\n[Article truncated for analysis]'
    : body;

  return `${SYSTEM_INSTRUCTION}

---
ARTICLE TO ANALYZE:
Title: ${article.title}
URL: ${article.url}

${truncatedBody || '[No article body available — analyze title only]'}
---

Return your JSON response now:`;
}

export { PROMPT_VERSION };
