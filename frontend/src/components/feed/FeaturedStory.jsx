import React from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, ChevronRight, Clock } from 'lucide-react';
import SeverityBadge from '../common/SeverityBadge.jsx';
import CredibilityBadge from '../common/CredibilityBadge.jsx';

// ─── Featured Story ───────────────────────────────────────────────────────────
// Responsive hero card for top critical/high severity geopolitical events.
// ─────────────────────────────────────────────────────────────────────────────

export default function FeaturedStory({ event, onSelect }) {
  const { t, i18n } = useTranslation();
  if (!event) return null;

  const locale = i18n.language?.startsWith('hi') ? 'hi-IN' : 'en-US';
  const formattedDate = event.createdAt
    ? new Date(event.createdAt).toLocaleDateString(locale, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  return (
    <div
      onClick={() => onSelect && onSelect(event)}
      className="relative p-4 sm:p-7 rounded-2xl sm:rounded-3xl border overflow-hidden cursor-pointer group transition-all duration-300 hover:border-amber-500/60 shadow-xl"
      style={{
        background: 'linear-gradient(135deg, rgba(26, 29, 36, 0.95) 0%, rgba(17, 19, 24, 0.98) 100%)',
        borderColor: 'var(--color-border)',
      }}
    >
      {/* Background glow accent */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-3 sm:space-y-4">
        {/* Top Tag & Badges */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <span className="text-[10px] sm:text-xs font-mono font-bold text-amber-950 bg-amber-400 px-2 py-0.5 rounded-full uppercase tracking-wide">
              {t('feed.topStory')}
            </span>
            <SeverityBadge severity={event.severity} />
            <CredibilityBadge
              label={event.credibilityLabel}
              score={event.credibilityScore}
            />
          </div>

          <div className="text-[11px] sm:text-xs text-slate-400 font-mono flex items-center gap-1 shrink-0">
            <Clock size={11} />
            <span>{formattedDate}</span>
          </div>
        </div>

        {/* Headline */}
        <h2 className="text-base sm:text-xl md:text-2xl font-bold text-white leading-snug sm:leading-tight group-hover:text-amber-300 transition-colors">
          {event.summary}
        </h2>

        {/* Verified Facts preview */}
        {event.facts && event.facts.length > 0 && (
          <p className="text-xs sm:text-sm text-slate-300/90 leading-relaxed max-w-3xl line-clamp-2">
            {event.facts.join(' • ')}
          </p>
        )}

        {/* Countries & Inspect Link */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            {event.countries && event.countries.length > 0 && (
              <div className="flex items-center gap-1 flex-wrap">
                <MapPin size={12} className="text-amber-400 shrink-0" />
                {event.countries.slice(0, 4).map((c) => (
                  <span
                    key={c}
                    className="px-1.5 py-0.5 rounded-md bg-slate-900 border border-slate-700/80 text-slate-300 text-[11px] font-medium"
                  >
                    {c}
                  </span>
                ))}
                {event.countries.length > 4 && (
                  <span className="text-[10px] text-slate-400 font-mono">
                    +{event.countries.length - 4}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 text-amber-400 font-semibold text-xs group-hover:translate-x-1 transition-transform ml-auto">
            <span>{t('feed.inspectDossier')}</span>
            <ChevronRight size={14} />
          </div>
        </div>
      </div>
    </div>
  );
}
