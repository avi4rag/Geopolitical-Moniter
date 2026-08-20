import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bookmark, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { translateNewsText } from '../../i18n/newsContentTranslations.js';
import { getNewsEditorialImage } from '../../lib/newsImages.js';

// ─── Editorial News Card ──────────────────────────────────────────────────────
// Clean, bright editorial story card with subtle border, high-contrast
// headline typography, factual summary, source attribution, and bookmarking.
// ─────────────────────────────────────────────────────────────────────────────

export default function NewsCard({ event, onSelect }) {
  const { t, i18n } = useTranslation();
  const { isAuthenticated, isBookmarked, toggleBookmark } = useAuth();
  const [bookmarking, setBookmarking] = useState(false);

  if (!event) return null;

  const lang = i18n.language || 'en';
  const localizedHeadline = translateNewsText(event.summary, lang);
  const localizedFact = event.facts && event.facts.length > 0
    ? translateNewsText(event.facts[0], lang)
    : null;

  const bookmarked = isBookmarked ? isBookmarked(event._id) : false;
  const imageUrl = getNewsEditorialImage(event);
  const sourceName = event.primaryArticleId?.sourceId?.name || 'World News Wire';

  const categoryName = event.sectors && event.sectors.length > 0
    ? event.sectors[0]
    : 'World News';

  const formattedDate = event.createdAt
    ? new Date(event.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
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
      className="group cursor-pointer bg-white rounded-2xl border border-slate-200 p-4 hover:border-slate-300 hover:shadow-lg transition-all duration-200 flex flex-col justify-between"
    >
      <div className="space-y-3">
        {/* Editorial Photo Frame */}
        <div className="relative h-44 w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-100">
          <img
            src={imageUrl}
            alt={event.summary}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />

          {/* Bookmark Button */}
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
        <div className="text-xs font-semibold text-indigo-700 flex items-center gap-1.5 pt-0.5">
          <span>{categoryName}</span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-400 font-normal">{formattedDate}</span>
        </div>

        {/* Headline */}
        <h3 className="text-base font-bold text-slate-950 leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2">
          {localizedHeadline}
        </h3>

        {/* Short Summary / Fact */}
        {localizedFact && (
          <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
            {localizedFact}
          </p>
        )}
      </div>

      {/* Footer Bar */}
      <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
        <span className="text-[11px] font-medium text-slate-500">
          {sourceName}
        </span>

        <span className="text-indigo-700 font-semibold text-xs flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
          <span>{t('feed.readArticle', { defaultValue: 'Read Article' })}</span>
          <ArrowRight size={12} />
        </span>
      </div>
    </article>
  );
}
