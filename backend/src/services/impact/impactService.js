import { Event, ImpactAssessment } from '../../models/index.js';
import { findMatchingRules, deduplicateByDomain } from './rulesEngine.js';
import { CONFIDENCE_THRESHOLDS } from '../../config/constants.js';
import { logger } from '../../config/logger.js';

// ─── Impact Assessment Service ────────────────────────────────────────────────
// Processes ANALYZED events through the rules engine to produce
// ImpactAssessment documents for each affected domain.
//
// KEY SCHEMA FACTS (from ImpactAssessment.js):
//   - severity:         String enum (LOW/MEDIUM/HIGH/CRITICAL/MINIMAL) — required
//   - confidence:       String enum (LOW/MEDIUM/HIGH) — required
//   - confidenceScore:  Number 0.0–1.0 — required
//   - isLatest:         VIRTUAL (computed from supersededAt === null)
//   - supersededAt:     null = latest; Date = superseded by newer version
//   - version:          monotonically increasing per eventId+domain
//
// VERSIONING:
//   Re-running creates a NEW assessment document, sets supersededAt on the old
//   one. isLatest virtual is automatically true when supersededAt is null.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Run impact assessment for all ANALYZED events.
 *
 * @param {object} options
 * @param {number} [options.batchSize=50]
 * @param {boolean} [options.force=false] - Re-process already-processed events
 * @returns {Promise<ImpactResult>}
 */
export async function runImpactAssessment(options = {}) {
  const startedAt = new Date();
  const { batchSize = 50, force = false } = options;

  const query = force
    ? { processingStatus: { $in: ['ANALYZED', 'IMPACT_PROCESSED'] } }
    : { processingStatus: 'ANALYZED' };

  const events = await Event.find(query)
    .sort({ createdAt: -1 })
    .limit(batchSize)
    .lean();

  logger.info(
    { count: events.length, force },
    'Impact: events queued for assessment'
  );

  if (events.length === 0) {
    return buildResult(startedAt, { processed: 0, assessmentsCreated: 0, skipped: 0, failed: 0 });
  }

  const stats = { processed: 0, assessmentsCreated: 0, skipped: 0, failed: 0 };

  for (const event of events) {
    const result = await assessEvent(event);
    if (result.outcome === 'processed') {
      stats.processed++;
      stats.assessmentsCreated += result.assessmentsCreated;
    } else {
      stats.failed++;
    }
  }

  const result = buildResult(startedAt, stats);
  logger.info(result, 'Impact: assessment complete');
  return result;
}

// ─── Private: Single Event Assessment ────────────────────────────────────────

async function assessEvent(event) {
  const logCtx = { eventId: event._id, eventType: event.eventType, severity: event.severity };

  const allMatches = findMatchingRules(event);

  if (allMatches.length === 0) {
    logger.debug(logCtx, 'Impact: no rules matched — marking IMPACT_PROCESSED with zero assessments');
    await Event.updateOne(
      { _id: event._id },
      { $set: { processingStatus: 'IMPACT_PROCESSED' } }
    );
    return { outcome: 'processed', assessmentsCreated: 0 };
  }

  // Keep best rule per domain
  const domainMatches = deduplicateByDomain(allMatches);

  logger.debug(
    { ...logCtx, domains: domainMatches.map((m) => m.rule.domain) },
    'Impact: rules matched'
  );

  let assessmentsCreated = 0;

  for (const { rule, confidence } of domainMatches) {
    try {
      await createAssessment(event, rule, confidence);
      assessmentsCreated++;
    } catch (err) {
      logger.error(
        { ...logCtx, domain: rule.domain, ruleId: rule.id, err: err.message },
        'Impact: assessment creation failed'
      );
    }
  }

  await Event.updateOne(
    { _id: event._id },
    { $set: { processingStatus: 'IMPACT_PROCESSED' } }
  );

  logger.info({ ...logCtx, assessmentsCreated }, 'Impact: event processed');

  return { outcome: 'processed', assessmentsCreated };
}

// ─── Private: Single Assessment Creation ─────────────────────────────────────

async function createAssessment(event, rule, confidence) {
  const now = new Date();

  // Find the current latest version for this event+domain
  const existing = await ImpactAssessment.findOne({
    eventId: event._id,
    domain: rule.domain,
    supersededAt: null, // null = currently latest
  });

  const nextVersion = existing ? existing.version + 1 : 1;

  // Supersede the old assessment
  if (existing) {
    await ImpactAssessment.updateOne(
      { _id: existing._id },
      { $set: { supersededAt: now } }
    );
  }

  // Map numeric confidence to string label
  const confidenceLabel = scoreToLabel(confidence);

  await ImpactAssessment.create({
    eventId: event._id,
    domain: rule.domain,
    direction: rule.direction,
    severity: event.severity,         // Inherited from the event
    confidence: confidenceLabel,      // String enum: LOW/MEDIUM/HIGH
    confidenceScore: confidence,      // Numeric 0.0–1.0
    explanation: rule.description,
    ruleId: rule.id,
    version: nextVersion,
    supersededAt: null,               // null = this is the latest
  });
}

// ─── Private: Helpers ─────────────────────────────────────────────────────────

/**
 * Convert numeric confidence score to string label.
 * Uses CONFIDENCE_THRESHOLDS from constants.
 */
function scoreToLabel(score) {
  if (score >= CONFIDENCE_THRESHOLDS.HIGH) return 'HIGH';
  if (score >= CONFIDENCE_THRESHOLDS.MEDIUM) return 'MEDIUM';
  return 'LOW';
}

function buildResult(startedAt, stats) {
  return {
    startedAt,
    completedAt: new Date(),
    durationMs: Date.now() - startedAt.getTime(),
    ...stats,
  };
}
