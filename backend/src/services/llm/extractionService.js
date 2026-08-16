import { Article, Event } from '../../models/index.js';
import { getLLMClient } from './llmFactory.js';
import { buildExtractionPrompt, PROMPT_VERSION } from './prompts.js';
import { validateLLMOutput } from './extractionSchema.js';
import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';

// ─── Extraction Service ───────────────────────────────────────────────────────
// Orchestrates LLM event extraction for stored articles.
//
// PIPELINE:
//   STORED articles → LLM prompt → structured JSON → validate → save Event
//
// STATE MACHINE (per article):
//   STORED → ANALYZING   (start of processing — atomic update)
//   ANALYZING → ANALYZED  (LLM extracted a valid geopolitical event)
//   ANALYZING → IRRELEVANT (LLM says not a geopolitical event)
//   ANALYZING → STORED    (retryable error — increments attempts)
//   ANALYZING → FAILED    (max attempts reached — permanently failed)
//
// RATE LIMITING:
//   LLM_DELAY_MS between calls (default 4s for Gemini 15 RPM free tier).
//   LLM_BATCH_SIZE controls how many articles per run (default 10).
//   This keeps us well within free tier limits.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Run LLM extraction for a batch of STORED articles.
 *
 * @param {object} options
 * @param {number} [options.batchSize] - Override default batch size
 * @returns {Promise<ExtractionResult>}
 */
export async function runExtraction(options = {}) {
  const startedAt = new Date();
  const batchSize = options.batchSize ?? env.llmBatchSize;

  logger.info({ batchSize, provider: env.llmProvider }, 'Extraction: started');

  // Find STORED articles that passed relevance check, ordered by date
  const articles = await Article.find({
    processingStatus: 'STORED',
    relevanceScore: { $gte: env.relevanceThreshold },
  })
    .sort({ publishedAt: -1 })
    .limit(batchSize)
    .populate('sourceId', 'name domain reliabilityScore')
    .lean();

  if (articles.length === 0) {
    logger.info('Extraction: no STORED articles found — nothing to process');
    return buildResult(startedAt, { analyzed: 0, irrelevant: 0, failed: 0, total: 0 });
  }

  logger.info({ count: articles.length }, 'Extraction: articles queued');

  const stats = { analyzed: 0, irrelevant: 0, failed: 0, total: articles.length };
  const llmClient = getLLMClient();

  for (let i = 0; i < articles.length; i++) {
    const article = articles[i];

    const outcome = await extractArticle(llmClient, article);
    stats[outcome]++;

    // Rate limit delay between LLM calls (skip after last article)
    if (i < articles.length - 1) {
      await sleep(env.llmDelayMs);
    }
  }

  const result = buildResult(startedAt, stats);
  logger.info(result, 'Extraction: complete');
  return result;
}

// ─── Private: Single Article Extraction ───────────────────────────────────────

/**
 * @returns {Promise<'analyzed' | 'irrelevant' | 'failed'>}
 */
async function extractArticle(llmClient, article) {
  const articleId = article._id;
  const logCtx = { articleId, url: article.url };

  // 1. Atomically mark as ANALYZING to prevent concurrent processing
  const claimed = await Article.findOneAndUpdate(
    { _id: articleId, processingStatus: 'STORED' },
    { $set: { processingStatus: 'ANALYZING' } },
    { returnDocument: 'after' }
  );

  if (!claimed) {
    // Another process claimed this article — skip
    logger.debug(logCtx, 'Extraction: article already claimed, skipping');
    return 'failed';
  }

  // 2. Build prompt
  const prompt = buildExtractionPrompt({
    title: article.title,
    content: article.content,
    excerpt: article.excerpt,
    url: article.url,
  });

  // 3. Call LLM
  let llmResponse;
  try {
    llmResponse = await llmClient.generateJSON(prompt);
  } catch (err) {
    logger.error({ ...logCtx, err: err.message }, 'Extraction: LLM call failed');
    return await handleFailure(article, err.message);
  }

  // 4. Parse JSON
  let parsed;
  try {
    parsed = JSON.parse(llmResponse.rawText);
  } catch (parseErr) {
    logger.error(
      { ...logCtx, rawText: llmResponse.rawText?.slice(0, 200) },
      'Extraction: JSON parse failed'
    );
    return await handleFailure(article, `JSON parse failed: ${parseErr.message}`);
  }

  // 5. Validate against schema
  const validation = validateLLMOutput(parsed);
  if (!validation.success) {
    logger.error({ ...logCtx, error: validation.error }, 'Extraction: schema validation failed');
    return await handleFailure(article, `Schema validation: ${validation.error}`);
  }

  const extracted = validation.data;

  // 6. LLM says this is not a geopolitical event
  if (!extracted.isGeopoliticalEvent) {
    logger.info(logCtx, 'Extraction: LLM classified as non-geopolitical');
    await Article.updateOne(
      { _id: articleId },
      { $set: { processingStatus: 'IRRELEVANT' } }
    );
    return 'irrelevant';
  }

  // 7. Save the Event
  const extractionMetadata = {
    modelName: env.geminiModel,
    promptVersion: PROMPT_VERSION,
    analysisTimestamp: new Date(),
    inputTokens: llmResponse.inputTokens,
    outputTokens: llmResponse.outputTokens,
  };

  try {
    await Event.create({
      primaryArticleId: articleId,
      articleIds: [articleId],
      eventType: extracted.eventType,
      summary: extracted.summary,
      countries: extracted.countries,
      regions: extracted.regions,
      sectors: extracted.sectors,
      severity: extracted.severity,
      facts: extracted.facts,
      uncertainties: extracted.uncertainties,
      entities: extracted.entities,
      extractionMetadata,
      processingStatus: 'ANALYZED',
      // credibilityLabel and credibilityScore are set by the impact engine (Phase 5)
    });
  } catch (err) {
    logger.error({ ...logCtx, err: err.message }, 'Extraction: Event save failed');
    return await handleFailure(article, `Event save failed: ${err.message}`);
  }

  // 8. Mark article as ANALYZED
  await Article.updateOne(
    { _id: articleId },
    { $set: { processingStatus: 'ANALYZED' } }
  );

  logger.info(
    { ...logCtx, eventType: extracted.eventType, severity: extracted.severity },
    'Extraction: event extracted successfully'
  );

  return 'analyzed';
}

// ─── Private: Failure Handler ─────────────────────────────────────────────────

async function handleFailure(article, errorMessage) {
  const newAttempts = (article.processingAttempts || 0) + 1;
  const isPermanentlyFailed = newAttempts >= env.maxProcessingAttempts;

  await Article.updateOne(
    { _id: article._id },
    {
      $set: {
        processingStatus: isPermanentlyFailed ? 'FAILED' : 'STORED',
        processingAttempts: newAttempts,
        processingError: errorMessage.slice(0, 2000),
      },
    }
  );

  if (isPermanentlyFailed) {
    logger.warn(
      { articleId: article._id, attempts: newAttempts, error: errorMessage },
      'Extraction: article permanently failed (max attempts reached)'
    );
  }

  return 'failed';
}

// ─── Private: Helpers ─────────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildResult(startedAt, stats) {
  return {
    startedAt,
    completedAt: new Date(),
    durationMs: Date.now() - startedAt.getTime(),
    provider: env.llmProvider,
    model: env.geminiModel,
    ...stats,
  };
}
