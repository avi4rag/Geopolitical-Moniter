import mongoose from 'mongoose';
import {
  IMPACT_DOMAINS,
  IMPACT_DIRECTIONS,
  SEVERITY_LEVELS,
  CONFIDENCE_LEVELS,
} from '../config/constants.js';

// ─── ImpactAssessment Schema ──────────────────────────────────────────────────
// Represents one domain's impact from a specific geopolitical event.
// One event produces N impact assessments (one per affected domain).
//
// IMMUTABILITY PRINCIPLE:
//   Assessments are NEVER overwritten.
//   When an event is re-assessed, a new document is created with:
//     - version: incremented
//     - The previous assessment gets supersededAt set to now
//   This preserves the full history of how assessments evolved over time.
//
// RULE TRACEABILITY:
//   ruleId links this assessment back to the specific rule in the impact engine
//   that generated it. This makes every assessment fully auditable.
//
// FINANCIAL MARKETS NOTE:
//   All impact assessments are QUALITATIVE only.
//   No numerical price predictions. No "X will rise Y%".
//   explanation fields use language like:
//     "Potential upward pressure on energy prices"
//     "Technology supply-chain risk increased"
// ─────────────────────────────────────────────────────────────────────────────

const impactAssessmentSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event reference is required'],
    },

    domain: {
      type: String,
      enum: {
        values: IMPACT_DOMAINS,
        message: `Domain must be one of: ${IMPACT_DOMAINS.join(', ')}`,
      },
      required: [true, 'Domain is required'],
    },

    direction: {
      type: String,
      enum: {
        values: IMPACT_DIRECTIONS,
        message: `Direction must be one of: ${IMPACT_DIRECTIONS.join(', ')}`,
      },
      required: [true, 'Direction is required'],
    },

    severity: {
      type: String,
      enum: {
        values: SEVERITY_LEVELS,
        message: `Severity must be one of: ${SEVERITY_LEVELS.join(', ')}`,
      },
      required: [true, 'Severity is required'],
    },

    confidence: {
      type: String,
      enum: {
        values: CONFIDENCE_LEVELS,
        message: `Confidence must be one of: ${CONFIDENCE_LEVELS.join(', ')}`,
      },
      required: [true, 'Confidence level is required'],
    },

    // 0.0–1.0 numeric score — see docs/credibility.md for methodology
    confidenceScore: {
      type: Number,
      required: true,
      min: [0, 'Confidence score must be >= 0'],
      max: [1, 'Confidence score must be <= 1'],
    },

    // Human-readable explanation of WHY this impact was assessed
    // Must be qualitative. Never numerical price predictions.
    explanation: {
      type: String,
      required: [true, 'Explanation is required'],
      trim: true,
      maxlength: [2000, 'Explanation cannot exceed 2000 characters'],
    },

    // The rule that triggered this assessment (links to impact engine rule set)
    ruleId: {
      type: String,
      required: [true, 'Rule ID is required'],
      trim: true,
      maxlength: [100, 'Rule ID cannot exceed 100 characters'],
    },

    // Monotonically increasing version per eventId+domain combination
    // Starts at 1, incremented on each re-assessment
    version: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },

    // Null = this is the current/latest assessment
    // Set to Date when a newer version supersedes this one
    supersededAt: {
      type: Date,
      default: null,
    },
  },
  {
    // createdAt only — no updatedAt (assessments are immutable once created)
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Virtuals ────────────────────────────────────────────────────────────────
// isLatest: true if this assessment has not been superseded
impactAssessmentSchema.virtual('isLatest').get(function () {
  return this.supersededAt === null || this.supersededAt === undefined;
});

// ─── Indexes ──────────────────────────────────────────────────────────────────
impactAssessmentSchema.index({ eventId: 1 });
impactAssessmentSchema.index({ domain: 1 });
impactAssessmentSchema.index({ direction: 1 });
impactAssessmentSchema.index({ createdAt: -1 });
// Compound: latest assessment for a specific event+domain
impactAssessmentSchema.index(
  { eventId: 1, domain: 1, version: -1 },
  { name: 'event_domain_version' }
);
// Compound: all latest (non-superseded) assessments for a domain
impactAssessmentSchema.index(
  { domain: 1, supersededAt: 1, createdAt: -1 },
  { name: 'domain_latest' }
);
// Compound: all assessments for an event (for timeline view)
impactAssessmentSchema.index(
  { eventId: 1, domain: 1, createdAt: 1 },
  { name: 'event_domain_timeline' }
);

// ─── Model ────────────────────────────────────────────────────────────────────
export const ImpactAssessment = mongoose.model('ImpactAssessment', impactAssessmentSchema);
