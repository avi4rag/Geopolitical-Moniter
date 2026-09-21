import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import SeverityBadge from '../common/SeverityBadge.jsx';
import CredibilityBadge from '../common/CredibilityBadge.jsx';
import { translateNewsText } from '../../i18n/newsContentTranslations.js';

// ─── Editorial Event Card (Analytics View) ────────────────────────────────────
// Compact analytical story card with severity badge, source attribution,
// and smooth hover state.
// ─────────────────────────────────────────────────────────────────────────────

export default function EventCard({ event, onSelect }) {
  const { t, i18n } = useTranslation();

  const lang = i18n.language || 'en';
  const formattedDate = event.createdAt
    ? new Date(event.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    : 'Recent';

  const article = event.primaryArticleId;
  const sourceName = article?.sourceId?.name || 'World News Wire';
  const localizedSummary = translateNewsText(event.summary, lang);

  const eventTypeLabel = event.eventType
    ? t(`eventTypes.${event.eventType}`, { defaultValue: event.eventType.replace(/_/g, ' ') })
    : 'INTELLIGENCE';

  return (
    <div
      onClick={() => onSelect && onSelect(event)}
      className="glass-card hover-lift p-5 rounded-2xl border transition-all cursor-pointer group flex flex-col justify-between"
      style={{
        backgroundColor: 'rgba(11, 16, 32, 0.70)',
        borderColor: 'rgba(255, 255, 255, 0.08)',
      }}
    >
      <div className="space-y-3">
        {/* Top Header: Event Type + Severity + Credibility */}
        <div className="flex items-center justify-between gap-2 flex-wrap pb-2 border-b border-slate-800/60">
          <span className="text-[11px] font-mono font-bold uppercase text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded-md">
            {eventTypeLabel}
          </span>
          <div className="flex items-center gap-1.5">
            <SeverityBadge severity={event.severity} size="sm" />
            <CredibilityBadge
              label={event.credibilityLabel}
              score={event.credibilityScore}
            />
          </div>
        </div>

        {/* Headline */}
        <h3 className="text-sm sm:text-base font-bold text-slate-100 leading-snug group-hover:text-cyan-300 transition-colors line-clamp-2">
          {localizedSummary}
        </h3>

        {/* Sectors & Countries */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1 text-xs">
          {event.countries?.slice(0, 2).map((c) => (
            <span
              key={c}
              className="px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700/60 text-slate-300 text-[11px] font-medium"
            >
              {c}
            </span>
          ))}
          {event.sectors?.slice(0, 2).map((s) => (
            <span
              key={s}
              className="px-2 py-0.5 rounded-md bg-slate-900/60 border border-slate-800 text-cyan-400/80 text-[11px] font-mono"
            >
              #{s}
            </span>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="pt-3 mt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
        <span className="font-mono text-slate-400 text-[11px]">{sourceName}</span>
        <span className="text-cyan-400 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
          <span>Read</span>
          <ArrowRight size={11} />
        </span>
      </div>
    </div>
  );
}
