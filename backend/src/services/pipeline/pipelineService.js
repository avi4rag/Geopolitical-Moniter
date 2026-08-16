import { runIngestion } from '../ingestion/ingestionService.js';
import { runExtraction } from '../llm/extractionService.js';
import { runImpactAssessment } from '../impact/impactService.js';
import { logger } from '../../config/logger.js';

// ─── End-to-End Pipeline Orchestrator ─────────────────────────────────────────
// Chains the 3 sequential stages of intelligence processing:
//   Stage 1: News Ingestion (Guardian, NewsAPI) -> Articles (STORED)
//   Stage 2: LLM Event Extraction (Gemini 2.0 JSON) -> Events (ANALYZED)
//   Stage 3: Impact Assessment Engine (32 Domain Rules) -> Impacts (IMPACT_PROCESSED)
//
// CONCURRENCY LOCK:
//   A memory mutex prevents multiple simultaneous pipeline runs.
//   If a run is triggered while one is active, it returns status 'BUSY'.
// ─────────────────────────────────────────────────────────────────────────────

let isRunning = false;
let lastRunResult = null;
let runCount = 0;

/**
 * Execute the full intelligence pipeline.
 *
 * @param {object} [options={}]
 * @param {number} [options.extractBatchSize]
 * @param {number} [options.impactBatchSize]
 * @param {boolean} [options.forceImpact=false]
 * @param {string} [options.triggerSource='MANUAL'] - 'MANUAL' | 'CRON' | 'API'
 * @returns {Promise<PipelineResult>}
 */
export async function runFullPipeline(options = {}) {
  if (isRunning) {
    logger.warn({ triggerSource: options.triggerSource }, 'Pipeline: execution skipped — already running');
    return {
      success: false,
      status: 'BUSY',
      message: 'Pipeline is currently executing another job. Please try again later.',
      lastRun: lastRunResult,
    };
  }

  isRunning = true;
  runCount++;
  const startedAt = new Date();
  const trigger = options.triggerSource || 'MANUAL';

  logger.info({ runCount, trigger }, '🚀 Pipeline: Starting end-to-end intelligence cycle');

  const report = {
    runId: `run-${Date.now()}-${runCount}`,
    triggerSource: trigger,
    startedAt,
    completedAt: null,
    durationMs: 0,
    status: 'RUNNING',
    stages: {
      ingestion: null,
      extraction: null,
      impact: null,
    },
    errors: [],
  };

  try {
    // ─── STAGE 1: NEWS INGESTION ─────────────────────────────────────────────
    logger.info('Pipeline [Stage 1/3]: Ingesting news from providers...');
    try {
      report.stages.ingestion = await runIngestion();
      logger.info(
        { stored: report.stages.ingestion?.totalStored || 0 },
        'Pipeline [Stage 1/3]: News ingestion completed'
      );
    } catch (ingestErr) {
      logger.error({ err: ingestErr.message }, 'Pipeline [Stage 1/3]: News ingestion failed');
      report.errors.push({ stage: 'ingestion', error: ingestErr.message });
    }

    // ─── STAGE 2: LLM EVENT EXTRACTION ───────────────────────────────────────
    logger.info('Pipeline [Stage 2/3]: Extracting structured events via LLM...');
    try {
      const batchSize = options.extractBatchSize;
      report.stages.extraction = await runExtraction(batchSize ? { batchSize } : undefined);
      logger.info(
        {
          analyzed: report.stages.extraction?.analyzed || 0,
          irrelevant: report.stages.extraction?.irrelevant || 0,
        },
        'Pipeline [Stage 2/3]: LLM extraction completed'
      );
    } catch (extractErr) {
      logger.error({ err: extractErr.message }, 'Pipeline [Stage 2/3]: LLM extraction failed');
      report.errors.push({ stage: 'extraction', error: extractErr.message });
    }

    // ─── STAGE 3: IMPACT ASSESSMENT ENGINE ───────────────────────────────────
    logger.info('Pipeline [Stage 3/3]: Running domain impact assessment rules...');
    try {
      report.stages.impact = await runImpactAssessment({
        batchSize: options.impactBatchSize,
        force: options.forceImpact,
      });
      logger.info(
        {
          processedEvents: report.stages.impact?.processed || 0,
          assessmentsCreated: report.stages.impact?.assessmentsCreated || 0,
        },
        'Pipeline [Stage 3/3]: Impact assessment completed'
      );
    } catch (impactErr) {
      logger.error({ err: impactErr.message }, 'Pipeline [Stage 3/3]: Impact assessment failed');
      report.errors.push({ stage: 'impact', error: impactErr.message });
    }

    report.status = report.errors.length === 0 ? 'COMPLETED' : 'COMPLETED_WITH_ERRORS';
  } catch (unexpectedErr) {
    logger.error({ err: unexpectedErr.message }, 'Pipeline: Critical orchestrator failure');
    report.status = 'FAILED';
    report.errors.push({ stage: 'orchestrator', error: unexpectedErr.message });
  } finally {
    report.completedAt = new Date();
    report.durationMs = Date.now() - startedAt.getTime();
    isRunning = false;
    lastRunResult = report;

    logger.info(
      {
        status: report.status,
        durationMs: report.durationMs,
        errors: report.errors.length,
      },
      '🏁 Pipeline: Intelligence cycle finished'
    );
  }

  return report;
}

/**
 * Get current pipeline status and execution metrics.
 */
export function getPipelineStatus() {
  return {
    isRunning,
    runCount,
    lastRun: lastRunResult,
  };
}

/**
 * Reset pipeline state (used primarily in test suites).
 */
export function _resetPipelineState() {
  isRunning = false;
  lastRunResult = null;
  runCount = 0;
}
