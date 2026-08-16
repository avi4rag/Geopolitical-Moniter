import cron from 'node-cron';
import { runFullPipeline, getPipelineStatus } from '../services/pipeline/pipelineService.js';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

// ─── Automated Cron Scheduler ────────────────────────────────────────────────
// Schedules the background intelligence cycle at configured intervals.
// ─────────────────────────────────────────────────────────────────────────────

let scheduledTask = null;
let isSchedulerActive = false;

/**
 * Initialize and start the recurring intelligence scheduler.
 *
 * @param {string} [cronPattern] - Override cron expression from env.ingestionCron
 * @returns {boolean} Whether the scheduler successfully started
 */
export function startScheduler(cronPattern) {
  const pattern = cronPattern || env.ingestionCron || '0 */2 * * *';

  if (!cron.validate(pattern)) {
    logger.error({ pattern }, 'Scheduler: Invalid cron pattern format');
    return false;
  }

  if (scheduledTask) {
    logger.warn('Scheduler: Already active — restarting with new pattern');
    stopScheduler();
  }

  scheduledTask = cron.schedule(pattern, async () => {
    logger.info({ cron: pattern }, '⏰ Scheduler: Triggering automated intelligence cycle');
    try {
      await runFullPipeline({ triggerSource: 'CRON' });
    } catch (err) {
      logger.error({ err: err.message }, 'Scheduler: Uncaught error during automated run');
    }
  });

  isSchedulerActive = true;
  logger.info({ pattern }, '📅 Scheduler: Automated background intelligence monitoring started');
  return true;
}

/**
 * Stop and destroy the current background scheduler task.
 */
export function stopScheduler() {
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
    pipeline: getPipelineStatus(),
  };
}
