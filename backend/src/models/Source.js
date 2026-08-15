import mongoose from 'mongoose';
import { SOURCE_TYPES } from '../config/constants.js';

// ─── Source Schema ────────────────────────────────────────────────────────────
// Represents a trusted news source or official publisher.
// Reliability scores are configured here, not derived from ML.
// A source's reliabilityScore is a human-curated signal, not ground truth.
// ─────────────────────────────────────────────────────────────────────────────

const sourceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Source name is required'],
      trim: true,
      maxlength: [200, 'Name cannot exceed 200 characters'],
    },

    domain: {
      type: String,
      required: [true, 'Domain is required'],
      trim: true,
      lowercase: true,
      unique: true,
      maxlength: [255, 'Domain cannot exceed 255 characters'],
    },

    type: {
      type: String,
      enum: {
        values: SOURCE_TYPES,
        message: `Type must be one of: ${SOURCE_TYPES.join(', ')}`,
      },
      required: [true, 'Source type is required'],
    },

    // 0.0 = completely unreliable, 1.0 = maximum confidence
    // This is a curated human-set value, not an algorithm output.
    reliabilityScore: {
      type: Number,
      required: true,
      min: [0, 'Reliability score must be >= 0'],
      max: [1, 'Reliability score must be <= 1'],
      default: 0.5,
    },

    active: {
      type: Boolean,
      default: true,
    },

    // Metadata about how to fetch from this source
    metadata: {
      // Which env var holds the API key for this source (never the key itself)
      apiKeyEnvVar: {
        type: String,
        trim: true,
      },
      baseUrl: {
        type: String,
        trim: true,
      },
      // Max requests per day for this source's free tier
      rateLimit: {
        type: Number,
        min: 0,
      },
    },
  },
  {
    timestamps: true,
    // Ensures _id is always included in toJSON/toObject
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
// Note: domain already has a unique index from schema definition.
// We only add supplementary indexes here.
sourceSchema.index({ active: 1 });
sourceSchema.index({ type: 1 });

// ─── Model ────────────────────────────────────────────────────────────────────
export const Source = mongoose.model('Source', sourceSchema);
