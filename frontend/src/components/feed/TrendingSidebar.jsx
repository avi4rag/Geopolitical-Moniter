import React from 'react';
import { ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { translateNewsText } from '../../i18n/newsContentTranslations.js';

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m || 1}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

const SEV_BAR = {
  CRITICAL: '#e11d48',
  HIGH: '#f59e0b',
  MEDIUM: '#38bdf8',
  LOW: '#10b981',
};

// ─── Trending Signals Sidebar ────────────────────────────────────────────────
// Dark right-column panel showing top trending events.
// ─────────────────────────────────────────────────────────────────────────────

export default function TrendingSidebar({ trendingEvents, onSelectEvent, onViewAll }) {
  const { i18n } = useTranslation();
  const lang = i18n.language || 'en';

  return (
    <aside
      className="glass-panel rounded-xl overflow-hidden shadow-lg border"
      style={{ borderColor: 'var(--color-border)' }}
      aria-label="Trending Intelligence Signals"
    >
      {/* Header */}
      <div
        className="px-4 py-3 border-b flex items-center justify-between"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[var(--color-critical)] animate-pulse" />
          <h3
            className="text-[10px] font-mono-code font-bold uppercase tracking-widest"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Trending Signals
          </h3>
        </div>
        <span className="text-[9px] font-mono-code text-[var(--color-text-dim)] uppercase">
          LIVE STREAM
        </span>
      </div>

      {/* Event list */}
      <div className="divide-y" style={{ borderColor: 'var(--color-border-subtle)' }}>
        {(!trendingEvents || trendingEvents.length === 0) && (
          <div className="px-4 py-8 text-center text-xs font-mono-code" style={{ color: 'var(--color-text-dim)' }}>
            Awaiting incoming telemetry...
          </div>
        )}
        {(trendingEvents || []).slice(0, 6).map((event) => {
          const barColor = SEV_BAR[event.severity] || '#c3c0ff';
          return (
            <button
              key={event._id}
              onClick={() => onSelectEvent(event)}
              className="w-full px-4 py-3 text-left flex items-start gap-3 transition-all duration-200 cursor-pointer hover:bg-[rgba(195,192,255,0.05)] group focus-visible:outline-2 focus-visible:outline-[var(--color-accent)]"
            >
              {/* Severity bar */}
              <div
                className="w-1 rounded-full mt-1 flex-shrink-0 self-stretch min-h-[40px] transition-transform duration-200 group-hover:scale-y-105"
                style={{
                  backgroundColor: barColor,
                  boxShadow: `0 0 8px ${barColor}40`,
                }}
              />
              <div className="flex-1 min-w-0">
                <p
                  className="text-xs font-headline font-semibold leading-snug line-clamp-2 group-hover:text-white transition-colors duration-200"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {translateNewsText(event.summary, lang)}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  {event.sectors?.[0] && (
                    <span
                      className="text-[9px] font-mono-code font-bold uppercase px-1.5 py-0.2 rounded"
                      style={{ backgroundColor: 'var(--color-surface-4)', color: 'var(--color-text-dim)' }}
                    >
                      {translateNewsText(event.sectors[0], lang)}
                    </span>
                  )}
                  <span
                    className="text-[9px] font-mono-code ml-auto"
                    style={{ color: 'var(--color-text-dim)' }}
                  >
                    {timeAgo(event.createdAt)}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* View all footer */}
      <button
        onClick={onViewAll}
        className="w-full px-4 py-3 border-t flex items-center justify-center gap-1.5 text-xs font-mono-code font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer group"
        style={{
          borderColor: 'var(--color-border)',
          color: 'var(--color-accent)',
          backgroundColor: 'transparent',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-accent-bg)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
      >
        <span>View Full Feed</span>
        <ChevronRight size={13} className="transition-transform duration-200 group-hover:translate-x-1" />
      </button>
    </aside>
  );
}
