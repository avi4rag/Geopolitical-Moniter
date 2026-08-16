import mongoose from 'mongoose';
import { User, Event } from '../../models/index.js';

// ─── User Controller ──────────────────────────────────────────────────────────
// Handles authenticated user operations (bookmarks, topic preferences).
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/v1/users/bookmarks/:eventId
 * Toggle bookmark status for a specific event.
 */
export async function toggleBookmark(req, res, next) {
  try {
    const { eventId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({
        success: false,
        data: null,
        error: { code: 'INVALID_ID', message: `Invalid event ID: '${eventId}'` },
      });
    }

    const eventExists = await Event.exists({ _id: eventId });
    if (!eventExists) {
      return res.status(404).json({
        success: false,
        data: null,
        error: { code: 'EVENT_NOT_FOUND', message: `Event not found with ID: '${eventId}'` },
      });
    }

    const user = req.user;
    const isBookmarked = user.bookmarks.some((b) => b.toString() === eventId);

    if (isBookmarked) {
      user.bookmarks = user.bookmarks.filter((b) => b.toString() !== eventId);
    } else {
      user.bookmarks.push(eventId);
    }

    await user.save();

    res.status(200).json({
      success: true,
      data: {
        isBookmarked: !isBookmarked,
        bookmarks: user.bookmarks,
      },
      error: null,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/users/bookmarks
 * Retrieve all saved/bookmarked events for the authenticated user.
 */
export async function getBookmarks(req, res, next) {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'bookmarks',
      populate: {
        path: 'primaryArticleId',
        select: 'title url publishedAt sourceId',
        populate: { path: 'sourceId', select: 'name domain reliabilityScore' },
      },
    });

    res.status(200).json({
      success: true,
      data: user.bookmarks || [],
      error: null,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/v1/users/preferences
 * Update user topic and country interest preferences.
 */
export async function updatePreferences(req, res, next) {
  try {
    const { interestedDomains, interestedCountries } = req.body;
    const user = req.user;

    if (Array.isArray(interestedDomains)) {
      user.preferences.interestedDomains = interestedDomains;
    }
    if (Array.isArray(interestedCountries)) {
      user.preferences.interestedCountries = interestedCountries;
    }

    await user.save();

    res.status(200).json({
      success: true,
      data: {
        preferences: user.preferences,
      },
      error: null,
    });
  } catch (err) {
    next(err);
  }
}
