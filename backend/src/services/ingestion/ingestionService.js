import { Article } from '../../models/index.js';
import { validateNormalizedArticle } from './validator.js';
import { scoreRelevance } from '../../utils/relevance.js';
import { hashContent, hashTitleExcerpt } from '../../utils/hash.js';
import { getActiveProviders } from '../../providers/index.js';
import { logger } from '../../config/logger.js';
import { env } from '../../config/env.js';

// ─── Ingestion Service ────────────────────────────────────────────────────────
// Orchestrates the full article ingestion pipeline:
//
//   Provider.fetchRawArticles()
//     → Provider.normalizeArticle()
//       → validateNormalizedArticle()
//         → scoreRelevance()
//           → hashContent()
//             → deduplication check
//               → Article.save()
//
// This service is stateless. It can be called:
//   - Manually via POST /api/v1/admin/ingest (development)
//   - Automatically by the scheduler (Phase 6)
//
// SAFETY: One article failing NEVER stops the rest of the batch.
// IDEMPOTENT: Re-running ingestion on the same articles is safe (duplicate check).
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Run ingestion for all active providers.
 *
 * @param {object} options
 * @param {Date} [options.fromDate] - Override default lookback window
 * @param {number} [options.pageSize] - Articles per provider per section
 * @returns {Promise<IngestionResult>}
 */
export async function runIngestion(options = {}) {
  const startedAt = new Date();
  logger.info({ options }, 'Ingestion: started');

  const providers = await getActiveProviders();

  if (providers.length === 0) {
    logger.warn('Ingestion: no active providers found');
    return buildResult(startedAt, {});
  }

  const providerResults = {};

  for (const provider of providers) {
    providerResults[provider.getName()] = await ingestFromProvider(provider, options);
  }

  const result = buildResult(startedAt, providerResults);
  logger.info(result.totals, 'Ingestion: complete');
  return result;
}

// ─── Private: Single Provider Ingestion ───────────────────────────────────────

async function ingestFromProvider(provider, options) {
  const stats = {
    fetched: 0,
    saved: 0,
    duplicates: 0,
    irrelevant: 0,
    failed: 0,
    errors: [],
  };

  let rawArticles;
  try {
    rawArticles = await provider.fetchRawArticles(options);
    stats.fetched = rawArticles.length;
    logger.info(
      { provider: provider.getName(), fetched: stats.fetched },
      'Ingestion: articles fetched'
    );
  } catch (err) {
    const msg = `Provider fetch failed: ${err.message}`;
    logger.error({ provider: provider.getName(), err: err.message }, msg);
    stats.failed = 1;
    stats.errors.push(msg);
    return stats;
  }

  // Process each article — never stop the loop on individual failure
  for (const raw of rawArticles) {
    try {
      const outcome = await processArticle(provider, raw);
      stats[outcome]++;
    } catch (err) {
      stats.failed++;
      stats.errors.push(err.message);
      logger.warn({ err: err.message, provider: provider.getName() }, 'Article processing error');
    }
  }

  logger.info(
    { provider: provider.getName(), ...stats },
    'Ingestion: provider complete'
  );

  return stats;
}

// ─── Private: Single Article Processing ───────────────────────────────────────

/**
 * Process a single raw article through the full pipeline.
 * @returns {Promise<'saved'|'duplicates'|'irrelevant'|'failed'>}
 */
async function processArticle(provider, raw) {
  // 1. Normalize
  let normalized;
  try {
    normalized = provider.normalizeArticle(raw);
  } catch (err) {
    throw new Error(`Normalization failed: ${err.message}`);
  }

  // 2. Validate
  const validation = validateNormalizedArticle(normalized);
  if (!validation.success) {
    logger.debug(
      { url: normalized?.url, error: validation.error },
      'Ingestion: article failed validation'
    );
    throw new Error(`Validation failed: ${validation.error}`);
  }

  const article = validation.data;

  // 3. Compute content hash (for deduplication)
  const contentSource = article.content || '';
  const contentHash = contentSource.length > 100
    ? hashContent(contentSource)
    : hashTitleExcerpt(article.title, article.excerpt);

  // 4. Check for duplicates (URL first — fastest)
  const existingByUrl = await Article.findOne({ url: article.url }).select('_id').lean();
  if (existingByUrl) {
    logger.debug({ url: article.url }, 'Ingestion: duplicate URL, skipping');
    return 'duplicates';
  }

  // Check by content hash (catches reposts with different URLs)
  const existingByHash = await Article.findOne({ contentHash }).select('_id').lean();
  if (existingByHash) {
    logger.debug(
      { url: article.url, contentHash },
      'Ingestion: duplicate content hash, skipping'
    );
    return 'duplicates';
  }

  // 5. Score relevance (fast keyword check — done BEFORE saving to keep IRRELEVANT articles out)
  const { score: relevanceScore, matchedKeywords } = scoreRelevance({
    title: article.title,
    excerpt: article.excerpt,
    content: article.content,
  });

  const processingStatus = relevanceScore >= env.relevanceThreshold ? 'STORED' : 'IRRELEVANT';

  logger.debug(
    { url: article.url, relevanceScore, matchedKeywords, processingStatus },
    'Ingestion: relevance scored'
  );

  // 6. Save to database
  try {
    await Article.create({
      ...article,
      contentHash,
      fetchedAt: new Date(),
      processingStatus,
      relevanceScore,
    });
  } catch (err) {
    // Handle race condition: another process saved this URL between our check and insert
    if (err.code === 11000) {
      logger.debug({ url: article.url }, 'Ingestion: race condition duplicate, skipping');
      return 'duplicates';
    }
    throw new Error(`DB save failed: ${err.message}`);
  }

  if (processingStatus === 'IRRELEVANT') {
    logger.debug(
      { url: article.url, relevanceScore },
      'Ingestion: article marked irrelevant'
    );
    return 'irrelevant';
  }

  logger.debug({ url: article.url, relevanceScore }, 'Ingestion: article saved');
  return 'saved';
}

// ─── Private: Result Builder ──────────────────────────────────────────────────

function buildResult(startedAt, providerResults) {
  const totals = {
    fetched: 0,
    saved: 0,
    duplicates: 0,
    irrelevant: 0,
    failed: 0,
  };

  for (const stats of Object.values(providerResults)) {
    totals.fetched += stats.fetched || 0;
    totals.saved += stats.saved || 0;
    totals.duplicates += stats.duplicates || 0;
    totals.irrelevant += stats.irrelevant || 0;
    totals.failed += stats.failed || 0;
  }

  return {
    startedAt,
    completedAt: new Date(),
    durationMs: Date.now() - startedAt.getTime(),
    providers: providerResults,
    totals,
  };
}
