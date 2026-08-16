import React from 'react';
import { ShieldAlert, MapPin, ChevronRight, Clock, ExternalLink } from 'lucide-react';
import SeverityBadge from '../common/SeverityBadge.jsx';
import CredibilityBadge from '../common/CredibilityBadge.jsx';

// ─── Featured Story ───────────────────────────────────────────────────────────
// Prominent hero banner for top critical / high severity geopolitical events.
// ─────────────────────────────────────────────────────────────────────────────

export default function FeaturedStory({ event, onSelect }) {
  if (!event) return null;

  const formattedDate = event.createdAt
    ? new Date(event.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  const sourceName = event.primaryArticleId?.sourceId?.name || 'Major News Wire';

  return (
    <div
      onClick={() => onSelect && onSelect(event)}
      className="relative p-6 sm:p-8 rounded-3xl border overflow-hidden cursor-pointer group transition-all duration-300 hover:border-amber-500/60 shadow-2xl"
      style={{
        background: 'linear-gradient(135deg, rgba(26, 29, 36, 0.95) 0%, rgba(17, 19, 24, 0.98) 100%)',
        borderColor: 'var(--color-border)',
      }}
    >
      {/* Background glow accent */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-4">
        {/* Top Tag & Badges */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono font-bold text-amber-950 bg-amber-400 px-2.5 py-0.5 rounded-full uppercase tracking-wide">
              Top Story
            </span>
            <SeverityBadge severity={event.severity} />
            <CredibilityBadge
              label={event.credibilityLabel}
              score={event.credibilityScore}
            />
          </div>

          <div className="text-xs text-slate-400 font-mono flex items-center gap-1">
            <Clock size={12} />
            <span>{formattedDate}</span>
          </div>
        </div>

        {/* Headline */}
        <h2 className="text-xl sm:text-2xl font-bold text-white leading-snug group-hover:text-amber-300 transition-colors">
          {event.summary}
        </h2>

        {/* Verified Facts preview */}
        {event.facts && event.facts.length > 0 && (
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl line-clamp-2">
            {event.facts.join(' • ')}
          </p>
        )}

        {/* Countries & Sectors */}
        <div className="pt-2 flex items-center justify-between flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            {event.countries && event.countries.length > 0 && (
              <div className="flex items-center gap-1 text-slate-300">
                <MapPin size={13} className="text-amber-400" />
                {event.countries.map((c) => (
                  <span
                    key={c}
                    className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700 text-slate-200 text-xs font-medium"
                  >
                    {c}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs group-hover:translate-x-1 transition-transform">
            <span>Inspect Full Dossier</span>
            <ChevronRight size={16} />
          </div>
        </div>
      </div>
    </div>
  );
}
