import mongoose from 'mongoose';
import { Event, ImpactAssessment } from '../../models/index.js';
import { PAGINATION } from '../../config/constants.js';
import { GeminiClient } from '../../services/llm/clients/geminiClient.js';
import { env } from '../../config/env.js';

// ─── Events Controller ────────────────────────────────────────────────────────
// Handles queries for geopolitical events, associated impacts, and AI intelligence synthesis.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/events
 * Query events with pagination, sorting, and multi-field filtering.
 */
export async function listEvents(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || PAGINATION.DEFAULT_PAGE);
    const limit = Math.min(
      PAGINATION.MAX_LIMIT,
      Math.max(1, parseInt(req.query.limit, 10) || PAGINATION.DEFAULT_LIMIT)
    );
    const skip = (page - 1) * limit;

    const filter = {};

    if (req.query.eventType) {
      filter.eventType = req.query.eventType.toUpperCase();
    }

    if (req.query.severity) {
      filter.severity = req.query.severity.toUpperCase();
    }

    if (req.query.credibilityLabel) {
      filter.credibilityLabel = req.query.credibilityLabel.toUpperCase();
    }

    if (req.query.status) {
      filter.processingStatus = req.query.status.toUpperCase();
    }

    if (req.query.country) {
      filter.countries = { $regex: new RegExp(req.query.country, 'i') };
    }

    if (req.query.region) {
      filter.regions = { $regex: new RegExp(req.query.region, 'i') };
    }

    if (req.query.sector) {
      filter.sectors = { $regex: new RegExp(req.query.sector, 'i') };
    }

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filter.$or = [
        { summary: searchRegex },
        { entities: searchRegex },
        { facts: searchRegex },
      ];
    }

    // Sort order
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    const sort = { [sortBy]: sortOrder };

    const [events, total] = await Promise.all([
      Event.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate({
          path: 'primaryArticleId',
          select: 'title url publishedAt relevanceScore sourceId',
          populate: { path: 'sourceId', select: 'name domain reliabilityScore type' },
        })
        .lean(),
      Event.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: events,
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
 * GET /api/v1/events/:id
 * Retrieve a single event along with its latest impact assessments.
 */
export async function getEvent(req, res, next) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        data: null,
        error: { code: 'INVALID_ID', message: `Invalid event ID: '${id}'` },
      });
    }

    const event = await Event.findById(id)
      .populate({
        path: 'primaryArticleId',
        select: 'title url excerpt publishedAt sourceId',
        populate: { path: 'sourceId', select: 'name domain reliabilityScore type' },
      })
      .populate('articleIds', 'title url publishedAt sourceId')
      .lean();

    if (!event) {
      return res.status(400).json({
        success: false,
        data: null,
        error: { code: 'EVENT_NOT_FOUND', message: `Event not found with ID: '${id}'` },
      });
    }

    const impacts = await ImpactAssessment.find({
      eventId: id,
      supersededAt: null,
    })
      .sort({ confidenceScore: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: {
        ...event,
        impacts,
      },
      error: null,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/events/:id/impacts
 * Retrieve all impact assessments for a specific event.
 */
export async function getEventImpacts(req, res, next) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        data: null,
        error: { code: 'INVALID_ID', message: `Invalid event ID: '${id}'` },
      });
    }

    const eventExists = await Event.exists({ _id: id });
    if (!eventExists) {
      return res.status(404).json({
        success: false,
        data: null,
        error: { code: 'EVENT_NOT_FOUND', message: `Event not found with ID: '${id}'` },
      });
    }

    const filter = { eventId: id };
    if (req.query.all !== 'true') {
      filter.supersededAt = null;
    }

    const impacts = await ImpactAssessment.find(filter)
      .sort({ domain: 1, version: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: impacts,
      count: impacts.length,
      error: null,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/events/ask
 * AI-powered natural language query engine that synthesizes intelligence
 * from MongoDB Atlas events using Gemini.
 */
export async function askIntel(req, res, next) {
  try {
    const { query } = req.body;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        data: null,
        error: { code: 'EMPTY_QUERY', message: 'Query string is required' },
      });
    }

    // Retrieve relevant events using regex keyword matching across summary, facts, countries, sectors
    const words = query.trim().split(/\s+/).filter((w) => w.length > 2);
    const searchConditions = words.map((w) => {
      const reg = new RegExp(w, 'i');
      return {
        $or: [
          { summary: reg },
          { facts: reg },
          { countries: reg },
          { sectors: reg },
          { eventType: reg },
        ],
      };
    });

    const filter = searchConditions.length > 0 ? { $or: searchConditions } : {};

    const candidateEvents = await Event.find(filter)
      .sort({ createdAt: -1 })
      .limit(6)
      .populate('primaryArticleId', 'title url')
      .lean();

    if (candidateEvents.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          answer: 'No specific geopolitical intelligence dossiers currently in the database match your inquiry. Try searching for broader terms (e.g. "sanctions", "conflict", "energy", or a specific country).',
          citedEvents: [],
        },
        error: null,
      });
    }

    // Fetch related impact assessments
    const eventIds = candidateEvents.map((e) => e._id);
    const impacts = await ImpactAssessment.find({
      eventId: { $in: eventIds },
      supersededAt: null,
    }).lean();

    // Group impacts by event
    const impactsByEvent = {};
    for (const imp of impacts) {
      const eid = imp.eventId.toString();
      if (!impactsByEvent[eid]) impactsByEvent[eid] = [];
      impactsByEvent[eid].push(`${imp.domain} (${imp.direction}, ${imp.severity}): ${imp.explanation}`);
    }

    // Construct grounded prompt
    const eventContext = candidateEvents
      .map((e, idx) => {
        const impList = impactsByEvent[e._id.toString()] || [];
        return `[Event ${idx + 1} - ID: ${e._id}]
Type: ${e.eventType} | Severity: ${e.severity} | Countries: ${(e.countries || []).join(', ')}
Summary: ${e.summary}
Facts: ${(e.facts || []).join('; ')}
Impacts: ${impList.join(' | ') || 'None assessed'}
`;
      })
      .join('\n');

    const prompt = `You are the GeoMonitor Geopolitical Intelligence Analyst.
Answer the user's question concisely based ONLY on the grounded intelligence events provided below.
Cite specific events using [Event 1], [Event 2], etc.
Highlight both positive opportunities and downside risks where relevant.

USER QUESTION:
"${query}"

GROUNDED INTELLIGENCE DOSSIERS:
${eventContext}

Provide a concise, 2-3 paragraph executive briefing answering the query.`;

    let answerText = '';

    try {
      const gemini = GeminiClient.getInstance();
      const result = await gemini.generateJSON(prompt);
      answerText = result.rawText || 'Analysis compiled based on grounded reports.';
    } catch (llmErr) {
      // Fallback if LLM unavailable
      answerText = `Based on the latest intelligence dossiers: ${candidateEvents
        .slice(0, 3)
        .map((e, i) => `[Event ${i + 1}] ${e.summary}`)
        .join(' ')}`;
    }

    res.status(200).json({
      success: true,
      data: {
        answer: answerText,
        citedEvents: candidateEvents.map((e) => ({
          _id: e._id,
          eventType: e.eventType,
          summary: e.summary,
          severity: e.severity,
          countries: e.countries,
          primaryArticleTitle: e.primaryArticleId?.title,
          primaryArticleUrl: e.primaryArticleId?.url,
        })),
      },
      error: null,
    });
  } catch (err) {
    next(err);
  }
}
