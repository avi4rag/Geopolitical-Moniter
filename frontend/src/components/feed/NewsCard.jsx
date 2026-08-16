import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, MapPin, Layers, ExternalLink, Bookmark, ChevronRight } from 'lucide-react';
import SeverityBadge from '../common/SeverityBadge.jsx';
import CredibilityBadge from '../common/CredibilityBadge.jsx';
import DirectionBadge from '../common/DirectionBadge.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

// ─── News Card ────────────────────────────────────────────────────────────────
// Consumer news story card for the main feed.
// Clicking anywhere navigates to /event/:id dossier.
// ─────────────────────────────────────────────────────────────────────────────

export default function NewsCard({ event, onSelect }) {
  const { isAuthenticated, isBookmarked, toggleBookmark } = useAuth();
  const bookmarked = isBookmarked(event._id);

  const formattedDate = event.createdAt
    ? new Date(event.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  const article = event.primaryArticleId;
  const sourceName = article?.sourceId?.name || 'Reuters';

  const handleBookmarkClick = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (isAuthenticated) {
      await toggleBookmark(event._id);
    }
  };

  return (
    <article
      onClick={() => onSelect && onSelect(event)}
      className="p-5 rounded-2xl border transition-all duration-200 hover:border-slate-600 hover:shadow-xl hover:shadow-black/50 cursor-pointer group flex flex-col justify-between"
      style={{
        backgroundColor: 'var(--color-surface-1)',
        borderColor: 'var(--color-border)',
      }}
    >
      <div>
        {/* Top Header: Severity + Event Type + Source & Time + Bookmark */}
        <div className="flex items-center justify-between gap-2 flex-wrap mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <SeverityBadge severity={event.severity} size="sm" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-950/40 border border-amber-800/60 px-2 py-0.5 rounded">
              {event.eventType?.replace(/_/g, ' ')}
            </span>
            <CredibilityBadge
              label={event.credibilityLabel}
              score={event.credibilityScore}
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
              <span>{sourceName}</span>
              <span>•</span>
              <Clock size={11} />
              <span>{formattedDate}</span>
            </div>

            {isAuthenticated && (
              <button
                onClick={handleBookmarkClick}
                className={`p-1.5 rounded-lg border transition cursor-pointer ${
                  bookmarked
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
                title={bookmarked ? 'Remove bookmark' : 'Bookmark event'}
              >
                <Bookmark size={13} fill={bookmarked ? 'currentColor' : 'none'} />
              </button>
            )}
          </div>
        </div>

        {/* Headline / Factual Summary */}
        <h3 className="text-base font-bold text-white leading-snug group-hover:text-amber-300 transition-colors mb-2">
          {event.summary}
        </h3>

        {/* Facts Preview */}
        {event.facts && event.facts.length > 0 && (
          <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mb-3">
            {event.facts[0]}
          </p>
        )}

        {/* Countries & Sectors */}
        <div className="flex items-center gap-1.5 flex-wrap mt-3">
          {event.countries && event.countries.length > 0 && (
            <div className="flex items-center gap-1 text-[11px] text-slate-400 mr-2">
              <MapPin size={11} className="text-slate-500" />
              {event.countries.slice(0, 3).map((country) => (
                <span
                  key={country}
                  className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-200 text-[10px] font-medium"
                >
                  {country}
                </span>
              ))}
            </div>
          )}

          {event.sectors && event.sectors.length > 0 && (
            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <Layers size={11} className="text-slate-500" />
              {event.sectors.slice(0, 2).map((sector) => (
                <span
                  key={sector}
                  className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 text-[10px]"
                >
                  {sector}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Card Footer CTA */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <span className="text-[11px] text-slate-500 font-mono">
          {event.articleIds?.length || 1} Supporting Source Report{(event.articleIds?.length || 1) > 1 ? 's' : ''}
        </span>

        <span className="inline-flex items-center gap-1 text-amber-400 font-semibold group-hover:translate-x-0.5 transition-transform text-xs">
          <span>Read Dossier</span>
          <ChevronRight size={13} />
        </span>
      </div>
    </article>
  );
}
