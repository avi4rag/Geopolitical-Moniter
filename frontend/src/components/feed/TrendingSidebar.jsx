import React from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronRight } from 'lucide-react';
import { translateNewsText } from '../../i18n/newsContentTranslations.js';
import { getNewsEditorialImage } from '../../lib/newsImages.js';

// ─── Editorial Recommended Stories Sidebar ───────────────────────────────────
// Right-hand secondary editorial column matching modern news publications:
// - "Recommended" header + "View all →"
// - Top hero card with image + gradient + overlay headline
// - Compact story list with right-aligned square thumbnails
// ─────────────────────────────────────────────────────────────────────────────

export default function TrendingSidebar({
  trendingEvents = [],
  onSelectEvent,
  onViewAll,
}) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language || 'en';

  if (!trendingEvents || trendingEvents.length === 0) return null;

  const topCardEvent = trendingEvents[0];
  const listEvents = trendingEvents.slice(1, 5);

  return (
    <aside className="w-full space-y-6">
      {/* Column Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <h2 className="text-base sm:text-lg font-black text-slate-950 tracking-tight">
          {t('feed.recommended', { defaultValue: 'Recommended' })}
        </h2>
        <button
          onClick={onViewAll}
          className="text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors flex items-center gap-0.5 cursor-pointer"
        >
          <span>{t('feed.viewAll', { defaultValue: 'View all' })}</span>
          <ChevronRight size={13} />
        </button>
      </div>

      {/* Top Featured Hero Card (Image + Overlay Headline) */}
      {topCardEvent && (
        <div
          onClick={() => onSelectEvent && onSelectEvent(topCardEvent)}
          className="relative h-48 sm:h-52 rounded-2xl overflow-hidden cursor-pointer group shadow-xs bg-slate-900 border border-slate-200"
        >
          <img
            src={getNewsEditorialImage(topCardEvent)}
            alt={topCardEvent.summary}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-90"
            loading="lazy"
          />

          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent pointer-events-none" />

          {/* Top white dash indicator */}
          <div className="absolute top-4 left-4 h-0.5 w-6 bg-white/90 rounded-full" />

          {/* Bottom text */}
          <div className="absolute bottom-4 left-4 right-4 space-y-1">
            <div className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
              <span>
                {topCardEvent.sectors && topCardEvent.sectors.length > 0
                  ? topCardEvent.sectors[0]
                  : 'World News'}
              </span>
              <span>•</span>
              <span className="text-slate-400 font-normal">
                {topCardEvent.createdAt ? new Date(topCardEvent.createdAt).toLocaleDateString() : 'Recent'}
              </span>
            </div>

            <h3 className="text-sm sm:text-base font-bold text-white leading-snug line-clamp-2 group-hover:text-indigo-200 transition-colors">
              {translateNewsText(topCardEvent.summary, lang)}
            </h3>
          </div>
        </div>
      )}

      {/* Stack of 4 Compact Stories with Right Thumbnail */}
      <div className="space-y-4 divide-y divide-slate-100">
        {listEvents.map((event, idx) => {
          const localizedTitle = translateNewsText(event.summary, lang);
          const imageUrl = getNewsEditorialImage(event);
          const categoryName = event.sectors && event.sectors.length > 0
            ? event.sectors[0]
            : 'Intelligence';

          const formattedDate = event.createdAt
            ? new Date(event.createdAt).toLocaleDateString()
            : 'Recent';

          return (
            <article
              key={event._id || idx}
              onClick={() => onSelectEvent && onSelectEvent(event)}
              className="pt-4 first:pt-0 group cursor-pointer flex items-start justify-between gap-4 transition-colors"
            >
              {/* Left Column: Category • Time + 2-Line Bold Headline */}
              <div className="space-y-1 flex-1 min-w-0">
                <div className="text-[11px] font-semibold text-indigo-700 flex items-center gap-1.5">
                  <span>{categoryName}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-400 font-normal">{formattedDate}</span>
                </div>

                <h4 className="text-xs sm:text-sm font-bold text-slate-950 leading-snug line-clamp-2 group-hover:text-indigo-600 transition-colors">
                  {localizedTitle}
                </h4>
              </div>

              {/* Right Column: Square Thumbnail */}
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden shrink-0 bg-slate-100 border border-slate-200 shadow-2xs">
                <img
                  src={imageUrl}
                  alt={event.summary}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
            </article>
          );
        })}
      </div>
    </aside>
  );
}
