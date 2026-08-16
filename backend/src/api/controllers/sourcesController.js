import { Source, Article } from '../../models/index.js';

// ─── Sources Controller ───────────────────────────────────────────────────────
// Provides information about news feeds and providers.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/sources
 * List all active ingestion sources.
 */
export async function listSources(req, res, next) {
  try {
    const sources = await Source.find({ active: { $ne: false } })
      .sort({ reliabilityScore: -1, name: 1 })
      .lean();

    res.status(200).json({
      success: true,
      data: sources,
      count: sources.length,
      error: null,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/sources/:id
 * Retrieve single source with its latest article statistics.
 */
export async function getSource(req, res, next) {
  try {
    const { id } = req.params;

    const source = await Source.findById(id).lean();
    if (!source) {
      return res.status(404).json({
        success: false,
        data: null,
        error: { code: 'SOURCE_NOT_FOUND', message: `Source not found: '${id}'` },
      });
    }

    const articleCount = await Article.countDocuments({ sourceId: id });

    res.status(200).json({
      success: true,
      data: {
        ...source,
        stats: {
          articleCount,
        },
      },
      error: null,
    });
  } catch (err) {
    next(err);
  }
}
