import React from 'react';
import { ChevronRight } from 'lucide-react';

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
  return (
    <div
      className="rounded-lg border overflow-hidden"
      style={{ backgroundColor: 'var(--color-surface-3)', borderColor: 'var(--color-border)' }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 border-b"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <h3
          className="text-[10px] font-mono-code font-bold uppercase tracking-widest"
          style={{ color: 'var(--color-text-dim)' }}
        >
          Trending Signals
        </h3>
      </div>

      {/* Event list */}
      <div className="divide-y" style={{ borderColor: 'var(--color-border-subtle)' }}>
        {(!trendingEvents || trendingEvents.length === 0) && (
          <div className="px-4 py-6 text-center text-xs font-mono-code" style={{ color: 'var(--color-text-dim)' }}>
            No trending signals
          </div>
        )}
        {(trendingEvents || []).slice(0, 6).map((event) => {
          const barColor = SEV_BAR[event.severity] || '#c3c0ff';
          return (
            <button
              key={event._id}
              onClick={() => onSelectEvent(event)}
              className="w-full px-4 py-3 text-left flex items-start gap-3 transition-colors cursor-pointer hover:bg-[var(--color-surface-4)] group"
            >
              {/* Severity bar */}
              <div
                className="w-0.5 rounded-full mt-1 flex-shrink-0 self-stretch min-h-[40px]"
                style={{ backgroundColor: barColor }}
              />
              <div className="flex-1 min-w-0">
                <p
                  className="text-xs font-headline font-semibold leading-snug line-clamp-2 group-hover:text-white transition-colors"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {event.summary}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  {event.sectors?.[0] && (
                    <span
                      className="text-[9px] font-mono-code uppercase"
                      style={{ color: 'var(--color-text-dim)' }}
                    >
                      {event.sectors[0]}
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
        className="w-full px-4 py-3 border-t flex items-center justify-center gap-1.5 text-xs font-mono-code font-bold uppercase tracking-wider transition-colors cursor-pointer"
        style={{
          borderColor: 'var(--color-border)',
          color: 'var(--color-accent)',
          backgroundColor: 'transparent',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-accent-bg)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
      >
        View Full Feed
        <ChevronRight size={12} />
      </button>
    </div>
  );
}
