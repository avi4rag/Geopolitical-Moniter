import React from 'react';
import { useTranslation } from 'react-i18next';
import { translateNewsText } from '../../i18n/newsContentTranslations.js';

// ─── Horizontal Editorial Sub-Stories Strip ───────────────────────────────────
// Clean 3-column story index directly beneath the main hero:
// - Top dash separator
// - Category & Publication timestamp
// - Bold 2-line headline with hover color transition
// ─────────────────────────────────────────────────────────────────────────────

export default function SubFeaturedRail({ events, onSelect }) {
  const { i18n } = useTranslation();
  if (!events || events.length === 0) return null;

  const lang = i18n.language || 'en';

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 pt-6">
      {events.slice(0, 3).map((event, idx) => {
        const localizedHeadline = translateNewsText(event.summary, lang);
        const categoryName = event.sectors && event.sectors.length > 0
          ? event.sectors[0]
          : 'Geopolitical News';

        const formattedDate = event.createdAt
          ? new Date(event.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })
          : 'Recent';

        return (
          <article
            key={event._id || idx}
            onClick={() => onSelect && onSelect(event)}
            className="group cursor-pointer space-y-2"
          >
            {/* Top Indicator Dash (Solid dark for first, slate for others) */}
            <div
              className={`h-0.5 w-6 rounded-full ${
                idx === 0 ? 'bg-slate-900' : 'bg-slate-300'
              }`}
            />

            {/* Category & Date */}
            <div className="text-xs font-semibold text-indigo-700 flex items-center gap-1.5 pt-0.5">
              <span>{categoryName}</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500 font-normal">{formattedDate}</span>
            </div>

            {/* Headline */}
            <h3 className="text-sm sm:text-base font-bold text-slate-950 leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2">
              {localizedHeadline}
            </h3>
          </article>
        );
      })}
    </div>
  );
}
