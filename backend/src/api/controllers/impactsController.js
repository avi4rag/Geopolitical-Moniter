import { ImpactAssessment } from '../../models/index.js';
import { PAGINATION, IMPACT_DOMAINS } from '../../config/constants.js';

// ─── Impacts Controller ───────────────────────────────────────────────────────
// Cross-event impact assessment queries and domain-specific impact analysis.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/impacts
 * Query all latest impact assessments with domain, direction, severity filters.
 *
 * Query Params:
 *   domain: string (ENERGY, TRADE, etc.)
 *   direction: string (POSITIVE, NEGATIVE, RISK_INCREASE, etc.)
 *   severity: string (CRITICAL, HIGH, etc.)
 *   confidence: string (HIGH, MEDIUM, LOW)
 *   page: number
 *   limit: number
 */
export async function listImpacts(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || PAGINATION.DEFAULT_PAGE);
    const limit = Math.min(
      PAGINATION.MAX_LIMIT,
      Math.max(1, parseInt(req.query.limit, 10) || PAGINATION.DEFAULT_LIMIT)
    );
    const skip = (page - 1) * limit;

    const filter = { supersededAt: null }; // Only return latest versions

    if (req.query.domain) {
      filter.domain = req.query.domain.toUpperCase();
    }

    if (req.query.direction) {
      filter.direction = req.query.direction.toUpperCase();
    }

    if (req.query.severity) {
      filter.severity = req.query.severity.toUpperCase();
    }

    if (req.query.confidence) {
      filter.confidence = req.query.confidence.toUpperCase();
    }

    const [impacts, total] = await Promise.all([
      ImpactAssessment.find(filter)
        .sort({ createdAt: -1, confidenceScore: -1 })
        .skip(skip)
        .limit(limit)
        .populate({
          path: 'eventId',
          select: 'eventType summary severity countries regions sectors credibilityLabel createdAt',
        })
        .lean(),
      ImpactAssessment.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: impacts,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      error: null,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/impacts/domain/:domain
 * Retrieve all latest impact assessments for a specific domain.
 */
export async function getImpactsByDomain(req, res, next) {
  try {
    const rawDomain = req.params.domain.toUpperCase();

    if (!IMPACT_DOMAINS.includes(rawDomain)) {
      return res.status(400).json({
        success: false,
        data: null,
        error: {
          code: 'INVALID_DOMAIN',
          message: `Invalid domain: '${rawDomain}'. Valid domains: ${IMPACT_DOMAINS.join(', ')}`,
        },
      });
    }

    const page = Math.max(1, parseInt(req.query.page, 10) || PAGINATION.DEFAULT_PAGE);
    const limit = Math.min(
      PAGINATION.MAX_LIMIT,
      Math.max(1, parseInt(req.query.limit, 10) || PAGINATION.DEFAULT_LIMIT)
    );
    const skip = (page - 1) * limit;

    const filter = {
      domain: rawDomain,
      supersededAt: null,
    };

    if (req.query.direction) {
      filter.direction = req.query.direction.toUpperCase();
    }

    const [impacts, total] = await Promise.all([
      ImpactAssessment.find(filter)
        .sort({ confidenceScore: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({
          path: 'eventId',
          select: 'eventType summary severity countries sectors credibilityLabel createdAt',
        })
        .lean(),
      ImpactAssessment.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      domain: rawDomain,
      data: impacts,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      error: null,
    });
  } catch (err) {
    next(err);
  }
}
