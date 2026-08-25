import React from 'react';

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m || 1}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ─── Sub-Featured Rail — 3 mini cards below the hero ──────────────────────────

export default function SubFeaturedRail({ events, onSelect }) {
  if (!events || events.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {events.slice(0, 3).map((event) => (
        <div
          key={event._id}
          className="rounded-lg p-4 cursor-pointer group transition-colors border flex flex-col gap-2"
          style={{
            backgroundColor: 'var(--color-surface-2)',
            borderColor: 'var(--color-border)',
          }}
          onClick={() => onSelect(event)}
          onKeyDown={(e) => e.key === 'Enter' && onSelect(event)}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-accent-border)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; }}
          role="button"
          tabIndex={0}
          aria-label={`Open: ${event.summary}`}
        >
          {/* Category */}
          <span
            className="text-[9px] font-mono-code font-bold uppercase tracking-widest"
            style={{ color: 'var(--color-accent)' }}
          >
            {event.eventType?.replace(/_/g, ' ') || 'EVENT'}
          </span>

          {/* Headline */}
          <h3
            className="font-headline text-sm font-semibold leading-snug line-clamp-3 flex-1 group-hover:text-white transition-colors"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {event.summary}
          </h3>

          {/* Footer */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t" style={{ borderColor: 'var(--color-border-subtle)' }}>
            {(event.countries || []).slice(0, 1).map((c) => (
              <span
                key={c}
                className="text-[9px] font-mono-code px-1.5 py-0.5 rounded"
                style={{
                  backgroundColor: 'var(--color-surface-4)',
                  color: 'var(--color-text-dim)',
                }}
              >
                {c}
              </span>
            ))}
            <span className="text-[9px] font-mono-code ml-auto" style={{ color: 'var(--color-text-dim)' }}>
              {timeAgo(event.createdAt)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
