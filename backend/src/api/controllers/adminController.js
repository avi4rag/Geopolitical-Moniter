import { runIngestion } from '../../services/ingestion/ingestionService.js';
import { runExtraction } from '../../services/llm/extractionService.js';
import { runImpactAssessment } from '../../services/impact/impactService.js';
import { runFullPipeline, getPipelineStatus } from '../../services/pipeline/pipelineService.js';
import { getSchedulerStatus } from '../../scheduler/cronScheduler.js';
import { logger } from '../../config/logger.js';

// ─── Admin Controller ─────────────────────────────────────────────────────────
// Exposes internal operations and pipeline control for development and operations.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/v1/admin/ingest
 * Manually trigger the news ingestion pipeline.
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

    res.status(200).json({ success: true, data: result, error: null });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/admin/extract
 * Manually trigger LLM extraction for STORED articles.
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

    res.status(200).json({ success: true, data: result, error: null });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/admin/impact
 * Run impact assessment for ANALYZED events.
 */
export async function triggerImpactAssessment(req, res, next) {
  try {
    const options = {};

    if (req.body?.batchSize !== undefined) {
      const batchSize = parseInt(req.body.batchSize, 10);
      if (isNaN(batchSize) || batchSize < 1 || batchSize > 500) {
        return res.status(400).json({
          success: false,
          data: null,
          error: { code: 'INVALID_BATCH_SIZE', message: 'batchSize must be between 1 and 500' },
        });
      }
      options.batchSize = batchSize;
    }

    if (req.body?.force === true) options.force = true;

    logger.info({ body: req.body }, 'Admin: impact assessment triggered manually');
    const result = await runImpactAssessment(options);

    res.status(200).json({ success: true, data: result, error: null });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/admin/pipeline/run
 * Trigger full 3-stage end-to-end intelligence cycle (Ingest -> Extract -> Impact).
 */
export async function triggerFullPipeline(req, res, next) {
  try {
    const options = {
      triggerSource: 'API',
    };

    if (req.body?.extractBatchSize) {
      options.extractBatchSize = parseInt(req.body.extractBatchSize, 10);
    }
    if (req.body?.impactBatchSize) {
      options.impactBatchSize = parseInt(req.body.impactBatchSize, 10);
    }
    if (req.body?.forceImpact === true) {
      options.forceImpact = true;
    }

    logger.info({ body: req.body }, 'Admin: full pipeline run requested');
    const result = await runFullPipeline(options);

    if (result.status === 'BUSY') {
      return res.status(409).json({
        success: false,
        data: result,
        error: { code: 'PIPELINE_BUSY', message: result.message },
      });
    }

    res.status(200).json({
      success: result.status === 'COMPLETED' || result.status === 'COMPLETED_WITH_ERRORS',
      data: result,
      error: result.errors.length > 0 ? { code: 'STAGE_ERRORS', errors: result.errors } : null,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/admin/pipeline/status
 * Get current pipeline execution state, history, and scheduler configuration.
 */
export async function getPipelineAndSchedulerStatus(req, res, next) {
  try {
    const pipeline = getPipelineStatus();
    const scheduler = getSchedulerStatus();

    res.status(200).json({
      success: true,
      data: {
        pipeline,
        scheduler,
      },
      error: null,
    });
  } catch (err) {
    next(err);
  }
}
