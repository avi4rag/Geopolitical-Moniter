import cron from 'node-cron';
import { runFullPipeline, getPipelineStatus } from '../services/pipeline/pipelineService.js';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

// ─── Automated Cron Scheduler ────────────────────────────────────────────────
// Schedules the background intelligence cycle at configured intervals.
// ─────────────────────────────────────────────────────────────────────────────

let scheduledTask = null;
let startupTimer = null;
let isSchedulerActive = false;
let schedulerStartedAt = null;
let totalScheduledRuns = 0;
let lastScheduledRunAt = null;
let lastScheduledRunStatus = null;

/**
 * Initialize and start the recurring intelligence scheduler.
 *
 * @param {string} [cronPattern] - Override cron expression from env.ingestionCron
 * @param {object} [options={}]
 * @param {boolean} [options.runOnStart=false] - Whether to trigger an immediate catch-up run on startup
 * @param {number} [options.startDelayMs=5000] - Delay in milliseconds before executing startup run
 * @returns {boolean} Whether the scheduler successfully started
 */
export function startScheduler(cronPattern, options = {}) {
  const pattern = cronPattern || env.ingestionCron || '0 */2 * * *';
  const runOnStart = options.runOnStart ?? env.runPipelineOnStart ?? false;
  const startDelayMs = options.startDelayMs ?? 5000;

  if (!cron.validate(pattern)) {
    logger.error({ pattern }, 'Scheduler: Invalid cron pattern format');
    return false;
  }

  if (scheduledTask || startupTimer) {
    logger.warn('Scheduler: Already active — restarting with new pattern');
    stopScheduler();
  }

  scheduledTask = cron.schedule(pattern, async () => {
    logger.info({ cron: pattern }, '⏰ Scheduler: Triggering automated intelligence cycle');
    totalScheduledRuns++;
    lastScheduledRunAt = new Date();
    try {
      const result = await runFullPipeline({ triggerSource: 'CRON' });
      lastScheduledRunStatus = result.status;
      logger.info(
        { status: result.status, durationMs: result.durationMs },
        'Scheduler: Automated intelligence cycle completed'
      );
    } catch (err) {
      lastScheduledRunStatus = 'FAILED';
      logger.error({ err: err.message }, 'Scheduler: Uncaught error during automated run');
    }
  });

  isSchedulerActive = true;
  schedulerStartedAt = new Date();
  logger.info(
    { pattern, runOnStart, startDelayMs },
    '📅 Scheduler: Automated background intelligence monitoring started'
  );

  // Optional startup catch-up execution (vital for serverless / sleeping containers on Render)
  if (runOnStart) {
    logger.info({ delayMs: startDelayMs }, 'Scheduler: Queueing startup catch-up pipeline run');
    startupTimer = setTimeout(async () => {
      startupTimer = null;
      logger.info('🚀 Scheduler: Executing startup catch-up pipeline run');
      try {
        const result = await runFullPipeline({ triggerSource: 'STARTUP' });
        lastScheduledRunAt = new Date();
        lastScheduledRunStatus = result.status;
        logger.info(
          { status: result.status, durationMs: result.durationMs },
          'Scheduler: Startup catch-up pipeline run completed'
        );
      } catch (err) {
        lastScheduledRunStatus = 'FAILED';
        logger.error({ err: err.message }, 'Scheduler: Error during startup catch-up run');
      }
    }, startDelayMs);
  }

  return true;
}

/**
 * Stop and destroy the current background scheduler task.
 */
export function stopScheduler() {
  if (startupTimer) {
    clearTimeout(startupTimer);
    startupTimer = null;
  }
  if (scheduledTask) {
    scheduledTask.stop();
    scheduledTask = null;
  }
  isSchedulerActive = false;
  logger.info('Scheduler: Automated monitoring stopped');
}

/**
 * Get the current scheduler configuration and status.
 */
export function getSchedulerStatus() {
  return {
    isActive: isSchedulerActive,
    cronPattern: env.ingestionCron || '0 */2 * * *',
    startedAt: schedulerStartedAt,
    totalScheduledRuns,
    lastScheduledRunAt,
    lastScheduledRunStatus,
    pipeline: getPipelineStatus(),
  };
}
