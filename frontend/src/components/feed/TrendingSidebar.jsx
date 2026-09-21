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
  CRITICAL: '#f43f5e',
  HIGH: '#fbbf24',
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
      className="terminal-panel rounded-xl overflow-hidden shadow-lg border"
      style={{ borderColor: 'rgba(255, 255, 255, 0.08)', backgroundColor: 'rgba(11, 16, 32, 0.75)' }}
      aria-label="Trending Intelligence Signals"
    >
      {/* Header */}
      <div
        className="px-4 py-3 border-b flex items-center justify-between"
        style={{ borderColor: 'rgba(255, 255, 255, 0.08)', backgroundColor: 'rgba(7, 10, 18, 0.60)' }}
      >
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[var(--color-coral)] animate-pulse" />
          <h3
            className="text-[10px] font-mono-code font-bold uppercase tracking-widest"
            style={{ color: 'var(--color-text-primary)' }}
          >
            TRENDING SIGNALS
          </h3>
        </div>
        <span className="text-[9px] font-mono-code uppercase px-1.5 py-0.5 rounded border border-rose-500/20 bg-rose-500/10 text-rose-400">
          LIVE STREAM
        </span>
      </div>

      {/* Event list */}
      <div className="divide-y" style={{ borderColor: 'rgba(255, 255, 255, 0.05)' }}>
        {(!trendingEvents || trendingEvents.length === 0) && (
          <div className="px-4 py-8 text-center text-xs font-mono-code" style={{ color: 'var(--color-text-dim)' }}>
            Awaiting incoming telemetry...
          </div>
        )}
        {(trendingEvents || []).slice(0, 6).map((event) => {
          const barColor = SEV_BAR[event.severity] || '#38bdf8';
          return (
            <button
              key={event._id}
              onClick={() => onSelectEvent(event)}
              className="w-full px-4 py-3 text-left flex items-start gap-3 transition-all duration-200 cursor-pointer hover:bg-[rgba(255,255,255,0.03)] group focus-visible:outline-2 focus-visible:outline-[var(--color-cyan)]"
            >
              {/* Severity bar */}
              <div
                className="w-1 rounded-full mt-1 flex-shrink-0 self-stretch min-h-[40px] transition-transform duration-200 group-hover:scale-y-110"
                style={{
                  backgroundColor: barColor,
                  boxShadow: `0 0 8px ${barColor}50`,
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
                      className="text-[9px] font-mono-code font-bold uppercase px-1.5 py-0.2 rounded border border-white/5"
                      style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--color-cyan)' }}
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
          borderColor: 'rgba(255, 255, 255, 0.08)',
          color: 'var(--color-coral)',
          backgroundColor: 'rgba(7, 10, 18, 0.40)',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(244, 63, 94, 0.08)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(7, 10, 18, 0.40)'; }}
      >
        <span>View Full Feed</span>
        <ChevronRight size={13} className="transition-transform duration-200 group-hover:translate-x-1" />
      </button>
    </aside>
  );
}
