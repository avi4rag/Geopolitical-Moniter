import mongoose from 'mongoose';
import {
  EVENT_TYPES,
  SEVERITY_LEVELS,
  CREDIBILITY_LABELS,
  PROCESSING_STATUSES,
} from '../config/constants.js';

// ─── Event Schema ─────────────────────────────────────────────────────────────
// Represents a geopolitical event extracted from one or more articles.
//
// CRITICAL DESIGN PRINCIPLE:
//   The LLM extracts language-level facts (eventType, countries, sectors, etc.)
//   The APPLICATION determines credibilityLabel/Score using rule-based scoring.
//   The LLM NEVER sets credibilityLabel or credibilityScore directly.
//
// One event can be supported by multiple articles (cross-source corroboration).
// credibilityScore improves as more sources corroborate the same event.
// ─────────────────────────────────────────────────────────────────────────────

const eventSchema = new mongoose.Schema(
  {
    // All articles that contributed to this event (may grow over time)
    articleIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Article',
      },
    ],

    // The first / most authoritative article
    primaryArticleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Article',
      required: [true, 'Primary article reference is required'],
    },

    // ── LLM-Extracted Fields ─────────────────────────────────────────────────
    // These come from the LLM but are validated by Zod before being stored.

    eventType: {
      type: String,
      enum: {
        values: EVENT_TYPES,
        message: `Event type must be one of: ${EVENT_TYPES.join(', ')}`,
      },
      required: [true, 'Event type is required'],
    },

    // 1–2 sentence factual summary (LLM-generated, human-readable)
    summary: {
      type: String,
      required: [true, 'Summary is required'],
      trim: true,
      maxlength: [2000, 'Summary cannot exceed 2000 characters'],
    },

    // Country names mentioned in the event
    countries: {
      type: [String],
      default: [],
    },

    // Geographic regions (e.g. "Middle East", "Southeast Asia")
    regions: {
      type: [String],
      default: [],
    },

    // Sectors mentioned (e.g. "Energy", "Technology")
    sectors: {
      type: [String],
      default: [],
    },

    // LLM's severity assessment (used as INPUT to impact engine, not final)
    severity: {
      type: String,
      enum: {
        values: SEVERITY_LEVELS,
        message: `Severity must be one of: ${SEVERITY_LEVELS.join(', ')}`,
      },
      required: [true, 'Severity is required'],
    },

    // Discrete factual claims extracted from the article
    facts: {
      type: [String],
      default: [],
    },

    // Things the article acknowledges are unconfirmed
    uncertainties: {
      type: [String],
      default: [],
    },

    // Key named entities (organizations, leaders, institutions)
    entities: {
      type: [String],
      default: [],
    },

    // ── LLM Metadata ─────────────────────────────────────────────────────────
    extractionMetadata: {
      modelName: { type: String, trim: true },
      promptVersion: { type: String, trim: true },
      analysisTimestamp: { type: Date },
      inputTokens: { type: Number, min: 0 },
      outputTokens: { type: Number, min: 0 },
    },

    // ── Application-Calculated Fields ─────────────────────────────────────────
    // These are set by our credibility service, NOT by the LLM.

    credibilityLabel: {
      type: String,
      enum: {
        values: CREDIBILITY_LABELS,
        message: `Credibility label must be one of: ${CREDIBILITY_LABELS.join(', ')}`,
      },
      default: 'UNVERIFIED',
    },

    // 0.0–1.0 — see docs/credibility.md for formula
    credibilityScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 1,
    },

    processingStatus: {
      type: String,
      enum: {
        values: PROCESSING_STATUSES,
        message: `Status must be one of: ${PROCESSING_STATUSES.join(', ')}`,
      },
      default: 'ANALYZED',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
eventSchema.index({ eventType: 1 });
eventSchema.index({ countries: 1 });
eventSchema.index({ sectors: 1 });
eventSchema.index({ severity: 1 });
eventSchema.index({ credibilityLabel: 1 });
eventSchema.index({ processingStatus: 1 });
eventSchema.index({ createdAt: -1 });
eventSchema.index({ primaryArticleId: 1 });
// Compound: dashboard query (most common: status + date sort)
eventSchema.index({ processingStatus: 1, createdAt: -1 });
// Compound: filter by event type + severity
eventSchema.index({ eventType: 1, severity: 1 });
// Compound: country + event type filtering
eventSchema.index({ countries: 1, eventType: 1 });

// ─── Model ────────────────────────────────────────────────────────────────────
export const Event = mongoose.model('Event', eventSchema);
