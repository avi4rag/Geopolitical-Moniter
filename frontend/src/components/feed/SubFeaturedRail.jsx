import React from 'react';
import { useTranslation } from 'react-i18next';
import { translateNewsText } from '../../i18n/newsContentTranslations.js';

// ─── Reference Design Sub-Stories Rail ────────────────────────────────────────
// 3-column horizontal sub-news row directly beneath the lead hero:
// - Top dash line indicator
// - Category • Time metadata
// - Bold 2-line headline
// ─────────────────────────────────────────────────────────────────────────────

export default function SubFeaturedRail({ events, onSelect }) {
  const { i18n } = useTranslation();
  if (!events || events.length === 0) return null;

  const lang = i18n.language || 'en';

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 pt-6 border-t border-slate-100">
      {events.slice(0, 3).map((event, idx) => {
        const localizedHeadline = translateNewsText(event.summary, lang);
        const categoryName = event.sectors && event.sectors.length > 0
          ? event.sectors[0]
          : 'World News';

        const formattedDate = event.createdAt
          ? new Date(event.createdAt).toLocaleDateString()
          : 'Recent';

        return (
          <article
            key={event._id || idx}
            onClick={() => onSelect && onSelect(event)}
            className="group cursor-pointer space-y-2.5"
          >
            {/* Horizontal Dash Indicator (First is solid dark, others grey) */}
            <div
              className={`h-0.5 w-7 rounded-full ${
                idx === 0 ? 'bg-slate-900' : 'bg-slate-300'
              }`}
            />

            {/* Category & Timestamp */}
            <div className="text-xs font-semibold text-indigo-600 flex items-center gap-1.5">
              <span>{categoryName}</span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-400 font-normal">{formattedDate}</span>
            </div>

            {/* Headline (2-lines, high readability) */}
            <h3 className="text-sm sm:text-base font-bold text-slate-950 leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2">
              {localizedHeadline}
            </h3>
          </article>
        );
      })}
    </div>
  );
}
