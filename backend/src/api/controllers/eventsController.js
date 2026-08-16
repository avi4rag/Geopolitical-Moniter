import mongoose from 'mongoose';
import { Event, ImpactAssessment } from '../../models/index.js';
import { PAGINATION } from '../../config/constants.js';

// ─── Events Controller ────────────────────────────────────────────────────────
// Handles queries for geopolitical events and their associated impacts.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/events
 * Query events with pagination, sorting, and multi-field filtering.
 *
 * Query Params:
 *   page: number (default 1)
 *   limit: number (default 20, max 100)
 *   eventType: string (optional)
 *   severity: string (optional)
 *   credibilityLabel: string (optional)
 *   country: string (optional)
 *   region: string (optional)
 *   sector: string (optional)
 *   status: string (optional, default: excludes FAILED/IRRELEVANT if not specified)
 *   search: string (keyword search on summary and entities)
 *   sortBy: string (createdAt, severity, credibilityScore - default createdAt)
 *   sortOrder: string (asc, desc - default desc)
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

    // Fetch all latest (non-superseded) impact assessments for this event
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
 * Query Params:
 *   all: boolean (if 'true', includes historical superseded versions; default false)
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
