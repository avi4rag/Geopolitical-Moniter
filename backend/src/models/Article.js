import mongoose from 'mongoose';
import { PROCESSING_STATUSES } from '../config/constants.js';

// ─── Article Schema ───────────────────────────────────────────────────────────
// Represents a single fetched news article.
// One article maps to one source. Multiple articles can reference the same event.
//
// DEDUPLICATION STRATEGY:
//   - url:         canonical URL dedup (exact match)
//   - contentHash: SHA-256 of normalized content (catches reposts with diff URLs)
//
// PROCESSING STATE:
//   Articles move through PROCESSING_STATUSES in sequence.
//   Only PUBLISHED events reach the API.
//   FAILED articles are retried up to MAX_PROCESSING_ATTEMPTS.
// ─────────────────────────────────────────────────────────────────────────────

const articleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [1000, 'Title cannot exceed 1000 characters'],
    },

    url: {
      type: String,
      required: [true, 'URL is required'],
      trim: true,
      unique: true,
      maxlength: [2048, 'URL cannot exceed 2048 characters'],
    },

    sourceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Source',
      required: [true, 'Source reference is required'],
    },

    // Full article text (may be truncated for cost control)
    content: {
      type: String,
      maxlength: [50000, 'Content cannot exceed 50,000 characters'],
    },

    // Short description / lede paragraph
    excerpt: {
      type: String,
      trim: true,
      maxlength: [2000, 'Excerpt cannot exceed 2000 characters'],
    },

    imageUrl: {
      type: String,
      trim: true,
      maxlength: [2048, 'Image URL cannot exceed 2048 characters'],
      default: null,
    },

    author: {
      type: String,
      trim: true,
      maxlength: [200, 'Author cannot exceed 200 characters'],
    },

    publishedAt: {
      type: Date,
      required: [true, 'Published date is required'],
    },

    fetchedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },

    // SHA-256 hash of normalized content — used for cross-URL deduplication
    contentHash: {
      type: String,
      trim: true,
      maxlength: [64, 'Content hash must be 64 characters (SHA-256 hex)'],
    },

    processingStatus: {
      type: String,
      enum: {
        values: PROCESSING_STATUSES,
        message: `Status must be one of: ${PROCESSING_STATUSES.join(', ')}`,
      },
      default: 'FETCHED',
      required: true,
    },

    // Number of times this article has been attempted through the pipeline
    processingAttempts: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Last error message if processing failed (human-readable)
    processingError: {
      type: String,
      maxlength: [2000, 'Error message cannot exceed 2000 characters'],
    },

    // Fast keyword-based pre-filter score (0.0–1.0)
    // Articles below RELEVANCE_THRESHOLD never reach the LLM
    relevanceScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 1,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
// Note: url already has a unique index from schema definition.
articleSchema.index({ contentHash: 1 });
articleSchema.index({ processingStatus: 1 });
articleSchema.index({ publishedAt: -1 });
articleSchema.index({ sourceId: 1 });
articleSchema.index({ fetchedAt: -1 });
// Compound: find articles by source that need processing
articleSchema.index({ sourceId: 1, processingStatus: 1 });
// Compound: find articles by status sorted by date (for pipeline processing)
articleSchema.index({ processingStatus: 1, publishedAt: -1 });

// ─── Model ────────────────────────────────────────────────────────────────────
export const Article = mongoose.model('Article', articleSchema);
