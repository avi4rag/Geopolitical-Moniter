import { Event, Article, ImpactAssessment, Source } from '../../models/index.js';

// ─── Stats Controller ─────────────────────────────────────────────────────────
// Provides aggregated intelligence metrics, domain radars, and country risk breakdowns.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/stats
 * Returns high-level system summary counts and distributions.
 */
export async function getDashboardStats(req, res, next) {
  try {
    const [
      totalEvents,
      totalArticles,
      totalAssessments,
      totalSources,
      severityAggregation,
      eventTypeAggregation,
      statusAggregation,
      recentEvents,
    ] = await Promise.all([
      Event.countDocuments(),
      Article.countDocuments(),
      ImpactAssessment.countDocuments({ supersededAt: null }),
      Source.countDocuments({ active: { $ne: false } }),

      // Severity breakdown
      Event.aggregate([
        { $group: { _id: '$severity', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),

      // Event type breakdown
      Event.aggregate([
        { $group: { _id: '$eventType', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),

      // Status breakdown
      Article.aggregate([
        { $group: { _id: '$processingStatus', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),

      // 5 Most recent events
      Event.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('eventType summary severity countries createdAt')
        .lean(),
    ]);

    const severityBreakdown = severityAggregation.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    const eventTypeBreakdown = eventTypeAggregation.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    const articleStatusBreakdown = statusAggregation.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      data: {
        totals: {
          events: totalEvents,
          articles: totalArticles,
          activeImpacts: totalAssessments,
          sources: totalSources,
        },
        breakdowns: {
          bySeverity: severityBreakdown,
          byEventType: eventTypeBreakdown,
          byArticleStatus: articleStatusBreakdown,
        },
        recentEvents,
      },
      error: null,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/stats/domains
 * Returns impact distribution across all tracked economic/geopolitical domains.
 */
export async function getDomainStats(req, res, next) {
  try {
    const domainAggregation = await ImpactAssessment.aggregate([
      { $match: { supersededAt: null } },
      {
        $group: {
          _id: '$domain',
          totalCount: { $sum: 1 },
          avgConfidence: { $avg: '$confidenceScore' },
          negativeCount: {
            $sum: { $cond: [{ $eq: ['$direction', 'NEGATIVE'] }, 1, 0] },
          },
          positiveCount: {
            $sum: { $cond: [{ $eq: ['$direction', 'POSITIVE'] }, 1, 0] },
          },
          riskIncreaseCount: {
            $sum: { $cond: [{ $eq: ['$direction', 'RISK_INCREASE'] }, 1, 0] },
          },
          riskDecreaseCount: {
            $sum: { $cond: [{ $eq: ['$direction', 'RISK_DECREASE'] }, 1, 0] },
          },
        },
      },
      { $sort: { totalCount: -1 } },
    ]);

    const domains = domainAggregation.map((d) => ({
      domain: d._id,
      totalCount: d.totalCount,
      avgConfidence: Math.round((d.avgConfidence || 0) * 100) / 100,
      directionBreakdown: {
        negative: d.negativeCount,
        positive: d.positiveCount,
        riskIncrease: d.riskIncreaseCount,
        riskDecrease: d.riskDecreaseCount,
      },
    }));

    res.status(200).json({
      success: true,
      data: domains,
      error: null,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/stats/countries
 * Returns geopolitical event activity aggregated by country.
 */
export async function getCountryStats(req, res, next) {
  try {
    const countryAggregation = await Event.aggregate([
      { $unwind: '$countries' },
      {
        $group: {
          _id: '$countries',
          eventCount: { $sum: 1 },
          criticalCount: {
            $sum: { $cond: [{ $eq: ['$severity', 'CRITICAL'] }, 1, 0] },
          },
          highCount: {
            $sum: { $cond: [{ $eq: ['$severity', 'HIGH'] }, 1, 0] },
          },
          mediumCount: {
            $sum: { $cond: [{ $eq: ['$severity', 'MEDIUM'] }, 1, 0] },
          },
          lowCount: {
            $sum: { $cond: [{ $eq: ['$severity', 'LOW'] }, 1, 0] },
          },
        },
      },
      { $sort: { eventCount: -1 } },
      { $limit: 20 },
    ]);

    const countries = countryAggregation.map((c) => ({
      country: c._id,
      eventCount: c.eventCount,
      severityBreakdown: {
        critical: c.criticalCount,
        high: c.highCount,
        medium: c.mediumCount,
        low: c.lowCount,
      },
    }));

    res.status(200).json({
      success: true,
      data: countries,
      error: null,
    });
  } catch (err) {
    next(err);
  }
}
