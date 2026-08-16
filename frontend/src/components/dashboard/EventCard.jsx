import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, ChevronRight, MapPin, Layers, Clock, AlertCircle } from 'lucide-react';
import SeverityBadge from '../common/SeverityBadge.jsx';
import CredibilityBadge from '../common/CredibilityBadge.jsx';

// ─── Event Card ───────────────────────────────────────────────────────────────
// Information-dense card representing an extracted geopolitical event.
// ─────────────────────────────────────────────────────────────────────────────

export default function EventCard({ event, onSelect }) {
  const formattedDate = event.createdAt
    ? new Date(event.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  const article = event.primaryArticleId;
  const sourceName = article?.sourceId?.name || 'News Wire';

  return (
    <div
      onClick={() => onSelect && onSelect(event)}
      className="p-5 rounded-xl border transition-all duration-200 hover:border-slate-600 hover:shadow-lg hover:shadow-black/40 cursor-pointer group flex flex-col justify-between"
      style={{
        backgroundColor: 'var(--color-surface-1)',
        borderColor: 'var(--color-border)',
      }}
    >
      <div>
        {/* Top Header: Event Type + Severity + Credibility + Date */}
        <div className="flex items-center justify-between gap-2 flex-wrap mb-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-amber-400 bg-amber-950/40 border border-amber-800/60 px-2 py-0.5 rounded">
              {event.eventType?.replace(/_/g, ' ')}
            </span>
            <SeverityBadge severity={event.severity} size="sm" />
            <CredibilityBadge
              label={event.credibilityLabel}
              score={event.credibilityScore}
            />
          </div>

          <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
            <Clock size={11} />
            <span>{formattedDate}</span>
          </div>
        </div>

        {/* Factual Summary */}
        <h4 className="text-sm font-medium text-slate-100 leading-snug group-hover:text-amber-300 transition-colors">
          {event.summary}
        </h4>

        {/* Key Extracted Facts Preview */}
        {event.facts && event.facts.length > 0 && (
          <ul className="mt-2.5 space-y-1 text-xs text-slate-300 border-l-2 border-slate-700/80 pl-2.5 py-0.5">
            {event.facts.slice(0, 2).map((fact, idx) => (
              <li key={idx} className="line-clamp-1">
                • {fact}
              </li>
            ))}
          </ul>
        )}

        {/* Tags: Countries & Sectors */}
        <div className="mt-3.5 flex items-center gap-1.5 flex-wrap">
          {event.countries && event.countries.length > 0 && (
            <div className="flex items-center gap-1 text-[11px] text-slate-400 mr-2">
              <MapPin size={11} className="text-slate-500" />
              {event.countries.slice(0, 3).map((country) => (
                <span
                  key={country}
                  className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 text-[10px]"
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
                  className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 text-[10px]"
                >
                  {sector}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer: Source link + View Details CTA */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-slate-500">Source:</span>
          {article?.url ? (
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-[11px] text-slate-300 hover:text-amber-400 inline-flex items-center gap-1 transition"
            >
              {sourceName}
              <ExternalLink size={10} />
            </a>
          ) : (
            <span className="text-[11px] text-slate-400">{sourceName}</span>
          )}
        </div>

        <button className="inline-flex items-center gap-1 text-amber-400 font-medium group-hover:translate-x-0.5 transition-transform text-xs cursor-pointer">
          <span>Inspect Impacts</span>
          <ChevronRight size={13} />
        </button>
      </div>
    </div>
  );
}
