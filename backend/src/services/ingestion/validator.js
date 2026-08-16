import { z } from 'zod';

// ─── Article Normalization Validator ─────────────────────────────────────────
// Validates that a normalized article (from any provider) meets our
// minimum requirements before it's saved to MongoDB.
//
// This is NOT the same as Mongoose validation.
// This runs BEFORE saving, so we can give better error messages
// and fail fast before touching the database.
// ─────────────────────────────────────────────────────────────────────────────

export const NormalizedArticleSchema = z.object({
  title: z
    .string()
    .min(5, 'Title too short (< 5 chars)')
    .max(1000, 'Title too long (> 1000 chars)')
    .trim(),

  url: z
    .string()
    .url('URL must be a valid URL')
    .max(2048, 'URL too long'),

  sourceId: z.any().refine((v) => v !== null && v !== undefined, {
    message: 'sourceId is required',
  }),

  content: z.string().max(50000).optional().default(''),

  excerpt: z.string().max(2000).optional().default(''),

  author: z.string().max(200).nullable().optional(),

  publishedAt: z
    .date()
    .refine((d) => !isNaN(d.getTime()), { message: 'publishedAt must be a valid date' })
    .refine((d) => d <= new Date(), { message: 'publishedAt cannot be in the future' })
    .refine(
      (d) => d >= new Date('2000-01-01'),
      { message: 'publishedAt seems too old (before 2000)' }
    ),
});

/**
 * Validate a normalized article object.
 * @param {object} article
 * @returns {{ success: boolean, data?: object, error?: string }}
 */
export function validateNormalizedArticle(article) {
  const result = NormalizedArticleSchema.safeParse(article);

  if (!result.success) {
    const messages = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`);
    return { success: false, error: messages.join('; ') };
  }

  return { success: true, data: result.data };
}
