// ─── Article & Event Image Resolver ───────────────────────────────────────────
// Extracts the exact image from the API/database payload, falling back
// cleanly to contextual geopolitical category photography only when missing.
// ─────────────────────────────────────────────────────────────────────────────

const FALLBACK_CATEGORY_IMAGES = {
  ENERGY: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=800&q=80',
  TECHNOLOGY: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
  TRADE: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
  DEFENSE: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=800&q=80',
  DIPLOMACY: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80',
  FOOD_AGRICULTURE: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80',
  FINANCE: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80',
};

const DEFAULT_EDITORIAL_FALLBACK = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80';

/**
 * Returns the exact image URL from the API/article if available,
 * otherwise returns a high-quality category-matched fallback.
 *
 * @param {object} event - Geopolitical Event or Article object
 * @returns {string} - Image URL
 */
export function getNewsEditorialImage(event) {
  if (!event) return DEFAULT_EDITORIAL_FALLBACK;

  // 1. Direct API / database image fields
  if (event.imageUrl) return event.imageUrl;
  if (event.image) return event.image;
  if (event.primaryArticleId?.imageUrl) return event.primaryArticleId.imageUrl;
  if (event.primaryArticleId?.image) return event.primaryArticleId.image;

  // 2. Sector match
  if (Array.isArray(event.sectors) && event.sectors.length > 0) {
    for (const sec of event.sectors) {
      const key = sec.toUpperCase().replace(/[\s&]+/g, '_');
      if (FALLBACK_CATEGORY_IMAGES[key]) {
        return FALLBACK_CATEGORY_IMAGES[key];
      }
    }
  }

  // 3. Event type match
  if (event.eventType === 'TREATY' || event.eventType === 'DIPLOMATIC_MEETING') {
    return FALLBACK_CATEGORY_IMAGES.DIPLOMACY;
  }
  if (event.eventType === 'SANCTION' || event.eventType === 'MILITARY_CONFLICT') {
    return FALLBACK_CATEGORY_IMAGES.DEFENSE;
  }

  return DEFAULT_EDITORIAL_FALLBACK;
}
