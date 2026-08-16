import { runIngestion } from '../../services/ingestion/ingestionService.js';
import { runExtraction } from '../../services/llm/extractionService.js';
import { logger } from '../../config/logger.js';

// ─── Admin Controller ─────────────────────────────────────────────────────────
// Exposes internal operations for development and operations use.
// In production, this route must be protected by auth middleware.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/v1/admin/ingest
 * Manually trigger the news ingestion pipeline.
 *
 * Body (optional):
 *   fromDate: ISO date string — override the default 24h lookback
 *   pageSize: number — override articles per section
 */
export async function triggerIngestion(req, res, next) {
  try {
    const options = {};

    if (req.body?.fromDate) {
      const fromDate = new Date(req.body.fromDate);
      if (isNaN(fromDate.getTime())) {
        return res.status(400).json({
          success: false,
          data: null,
          error: { code: 'INVALID_DATE', message: 'fromDate must be a valid ISO date string' },
        });
      }
      options.fromDate = fromDate;
    }

    if (req.body?.pageSize) {
      const pageSize = parseInt(req.body.pageSize, 10);
      if (isNaN(pageSize) || pageSize < 1 || pageSize > 200) {
        return res.status(400).json({
          success: false,
          data: null,
          error: { code: 'INVALID_PAGE_SIZE', message: 'pageSize must be between 1 and 200' },
        });
      }
      options.pageSize = pageSize;
    }

    logger.info({ body: req.body }, 'Admin: ingestion triggered manually');

    const result = await runIngestion(options);

    res.status(200).json({
      success: true,
      data: result,
      error: null,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/admin/extract
 * Manually trigger LLM extraction for STORED articles.
 *
 * Body (optional):
 *   batchSize: number — how many articles to process (default from env)
 */
export async function triggerExtraction(req, res, next) {
  try {
    const options = {};

    if (req.body?.batchSize !== undefined) {
      const batchSize = parseInt(req.body.batchSize, 10);
      if (isNaN(batchSize) || batchSize < 1 || batchSize > 100) {
        return res.status(400).json({
          success: false,
          data: null,
          error: { code: 'INVALID_BATCH_SIZE', message: 'batchSize must be between 1 and 100' },
        });
      }
      options.batchSize = batchSize;
    }

    logger.info({ body: req.body }, 'Admin: extraction triggered manually');

    const result = await runExtraction(options);

    res.status(200).json({
      success: true,
      data: result,
      error: null,
    });
  } catch (err) {
    next(err);
  }
}
