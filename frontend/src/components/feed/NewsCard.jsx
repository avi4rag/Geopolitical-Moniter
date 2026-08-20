import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bookmark, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { translateNewsText } from '../../i18n/newsContentTranslations.js';
import { getNewsEditorialImage } from '../../lib/newsImages.js';

// ─── Reference Design News Card ───────────────────────────────────────────────
// Clean, bright editorial story card with rounded corners, subtle border,
// high-contrast typography, and smooth hover elevation.
// ─────────────────────────────────────────────────────────────────────────────

export default function NewsCard({ event, onSelect }) {
  const { t, i18n } = useTranslation();
  const { isAuthenticated, isBookmarked, toggleBookmark } = useAuth();
  const [bookmarking, setBookmarking] = useState(false);

  if (!event) return null;

  const lang = i18n.language || 'en';
  const localizedHeadline = translateNewsText(event.summary, lang);
  const bookmarked = isBookmarked ? isBookmarked(event._id) : false;
  const imageUrl = getNewsEditorialImage(event);

  const categoryName = event.sectors && event.sectors.length > 0
    ? event.sectors[0]
    : 'World News';

  const formattedDate = event.createdAt
    ? new Date(event.createdAt).toLocaleDateString()
    : 'Recent';

  const handleBookmarkClick = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) return;
    try {
      setBookmarking(true);
      await toggleBookmark(event._id);
    } catch {
      // Handled silently
    } finally {
      setBookmarking(false);
    }
  };

  return (
    <article
      onClick={() => onSelect && onSelect(event)}
      className="group cursor-pointer bg-white rounded-2xl border border-slate-200/80 p-3.5 sm:p-4 hover:border-slate-300 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
    >
      <div className="space-y-3">
        {/* Thumbnail Image */}
        <div className="relative h-44 w-full rounded-xl overflow-hidden bg-slate-100">
          <img
            src={imageUrl}
            alt={event.summary}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />

          {/* Bookmark Action */}
          {isAuthenticated && (
            <button
              onClick={handleBookmarkClick}
              disabled={bookmarking}
              className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md transition-all cursor-pointer shadow-xs ${
                bookmarked
                  ? 'bg-slate-900 text-white'
                  : 'bg-white/80 text-slate-700 hover:bg-white hover:text-slate-950'
              }`}
              title={bookmarked ? 'Remove Bookmark' : 'Save Story'}
            >
              <Bookmark size={12} fill={bookmarked ? 'currentColor' : 'none'} />
            </button>
          )}
        </div>

        {/* Category & Timestamp */}
        <div className="text-xs font-semibold text-indigo-600 flex items-center gap-1.5">
          <span>{categoryName}</span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-400 font-normal">{formattedDate}</span>
        </div>

        {/* Headline */}
        <h3 className="text-sm sm:text-base font-bold text-slate-950 leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2">
          {localizedHeadline}
        </h3>
      </div>

      {/* Footer Read Indicator */}
      <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
        <span className="text-[11px] font-medium text-slate-500">
          {event.primaryArticleId?.sourceId?.name || 'Wire Report'}
        </span>

        <span className="text-indigo-600 font-semibold text-xs flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
          <span>{t('feed.readArticle', { defaultValue: 'Read article' })}</span>
          <ArrowRight size={12} />
        </span>
      </div>
    </article>
  );
}
