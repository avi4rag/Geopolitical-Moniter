import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';
import {
  runFullPipeline,
  getPipelineStatus,
  _resetPipelineState,
} from '../../src/services/pipeline/pipelineService.js';
import {
  startScheduler,
  stopScheduler,
  getSchedulerStatus,
} from '../../src/scheduler/cronScheduler.js';

// Mock the individual stage services so pipeline orchestration tests run quickly and reliably
vi.mock('../../src/services/ingestion/ingestionService.js', () => ({
  runIngestion: vi.fn().mockResolvedValue({
    totalFetched: 10,
    totalStored: 5,
    totalDuplicates: 3,
    totalIrrelevant: 2,
  }),
}));

vi.mock('../../src/services/llm/extractionService.js', () => ({
  runExtraction: vi.fn().mockResolvedValue({
    total: 5,
    analyzed: 4,
    irrelevant: 1,
    failed: 0,
  }),
}));

vi.mock('../../src/services/impact/impactService.js', () => ({
  runImpactAssessment: vi.fn().mockResolvedValue({
    processed: 4,
    assessmentsCreated: 12,
    failed: 0,
  }),
}));

import { runIngestion } from '../../src/services/ingestion/ingestionService.js';
import { runExtraction } from '../../src/services/llm/extractionService.js';
import { runImpactAssessment } from '../../src/services/impact/impactService.js';

// ─── Pipeline & Scheduler Tests (Phase 7) ─────────────────────────────────────

describe('Pipeline Orchestrator (pipelineService)', () => {
  beforeEach(() => {
    _resetPipelineState();
    vi.clearAllMocks();
  });

  afterEach(() => {
    _resetPipelineState();
  });

  it('runs all 3 stages sequentially in a single intelligence cycle', async () => {
    const result = await runFullPipeline({ triggerSource: 'MANUAL' });

    expect(result.status).toBe('COMPLETED');
    expect(result.triggerSource).toBe('MANUAL');
    expect(result.stages.ingestion).toBeDefined();
    expect(result.stages.extraction).toBeDefined();
    expect(result.stages.impact).toBeDefined();
    expect(result.errors).toHaveLength(0);

    expect(runIngestion).toHaveBeenCalledTimes(1);
    expect(runExtraction).toHaveBeenCalledTimes(1);
    expect(runImpactAssessment).toHaveBeenCalledTimes(1);
  });

  it('enforces concurrency lock: returns BUSY when already executing', async () => {
    // Make extraction hang briefly
    runExtraction.mockImplementationOnce(
      () => new Promise((resolve) => setTimeout(resolve, 50))
    );

    const firstRunPromise = runFullPipeline();
    const secondRun = await runFullPipeline();

    expect(secondRun.status).toBe('BUSY');
    expect(secondRun.success).toBe(false);

    await firstRunPromise;

    // After completion, lock is released
    const status = getPipelineStatus();
    expect(status.isRunning).toBe(false);
  });

  it('handles stage failures gracefully without locking the pipeline permanently', async () => {
    runExtraction.mockRejectedValueOnce(new Error('LLM Provider Outage'));

    const result = await runFullPipeline();

    expect(result.status).toBe('COMPLETED_WITH_ERRORS');
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0].stage).toBe('extraction');

    // Impact assessment still gets attempted or handled, and lock is cleanly released
    const status = getPipelineStatus();
    expect(status.isRunning).toBe(false);
  });

  it('tracks execution history and run counts in getPipelineStatus()', async () => {
    expect(getPipelineStatus().runCount).toBe(0);

    await runFullPipeline();
    expect(getPipelineStatus().runCount).toBe(1);
    expect(getPipelineStatus().lastRun).not.toBeNull();
    expect(getPipelineStatus().lastRun.status).toBe('COMPLETED');
  });
});

describe('Cron Scheduler (cronScheduler)', () => {
  afterEach(() => {
    stopScheduler();
  });

  it('starts scheduler with valid cron pattern', () => {
    const started = startScheduler('*/10 * * * *');
    expect(started).toBe(true);

    const status = getSchedulerStatus();
    expect(status.isActive).toBe(true);
  });

  it('rejects invalid cron pattern format', () => {
    const started = startScheduler('invalid-cron-pattern');
    expect(started).toBe(false);

    const status = getSchedulerStatus();
    expect(status.isActive).toBe(false);
  });

  it('stops scheduler cleanly', () => {
    startScheduler('*/5 * * * *');
    expect(getSchedulerStatus().isActive).toBe(true);

    stopScheduler();
    expect(getSchedulerStatus().isActive).toBe(false);
  });
});

describe('Admin Pipeline API Endpoints', () => {
  beforeEach(() => {
    _resetPipelineState();
  });

  it('POST /api/v1/admin/pipeline/run triggers the full pipeline on demand', async () => {
    const res = await request(app)
      .post('/api/v1/admin/pipeline/run')
      .send({ extractBatchSize: 5, impactBatchSize: 20 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('COMPLETED');
    expect(res.body.data.stages.ingestion).toBeDefined();
  });

  it('GET /api/v1/admin/pipeline/status returns pipeline and scheduler health', async () => {
    const res = await request(app).get('/api/v1/admin/pipeline/status');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.pipeline).toBeDefined();
    expect(res.body.data.scheduler).toBeDefined();
    expect(res.body.data.pipeline.isRunning).toBe(false);
  });
});
