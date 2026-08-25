import React from 'react';
import { useTranslation } from 'react-i18next';
import { translateNewsText } from '../../i18n/newsContentTranslations.js';

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'T-MINUS <1M';
  if (m < 60) return `${m} MIN AGO`;
  const h = Math.floor(m / 60);
  if (h < 24) return `T-MINUS ${h}H`;
  return `${Math.floor(h / 24)}D AGO`;
}

const SEV_DOT = {
  CRITICAL: '#e11d48',
  HIGH: '#f59e0b',
  MEDIUM: '#38bdf8',
  LOW: '#10b981',
};

// ─── News Card — Dark Situation Room ─────────────────────────────────────────
// Compact intelligence card for the 3-col feed grid.
// ─────────────────────────────────────────────────────────────────────────────

export default function NewsCard({ event, onSelect }) {
  const { i18n } = useTranslation();
  if (!event) return null;

  const lang = i18n.language || 'en';
  const tMinus = timeAgo(event.createdAt);
  const dotColor = SEV_DOT[event.severity] || '#c3c0ff';
  const category = event.eventType?.replace(/_/g, ' ') || 'EVENT';
  const summary = translateNewsText(event.summary, lang);

  return (
    <div
      className="data-card card-shimmer rounded-lg p-5 flex flex-col justify-between gap-4 cursor-pointer group transition-colors"
      style={{
        backgroundColor: 'var(--color-surface-2)',
        border: '1px solid var(--color-border)',
      }}
      onClick={() => onSelect(event)}
      onKeyDown={(e) => e.key === 'Enter' && onSelect(event)}
      role="button"
      tabIndex={0}
      aria-label={`Open briefing: ${event.summary}`}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-accent-border)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; }}
    >
      {/* Top row: category + timestamp */}
      <div className="flex items-center justify-between gap-2">
        <span
          className="text-[10px] font-mono-code font-bold uppercase tracking-wider px-2 py-0.5 rounded"
          style={{ backgroundColor: 'var(--color-surface-4)', color: 'var(--color-text-dim)' }}
        >
          {category}
        </span>
        <span
          className="text-[10px] font-mono-code"
          style={{ color: 'var(--color-text-dim)' }}
        >
          {tMinus}
        </span>
      </div>

      {/* Headline */}
      <h3
        className="font-headline text-base font-semibold leading-snug line-clamp-2 transition-colors"
        style={{ color: 'var(--color-text-primary)' }}
      >
        {summary}
      </h3>

      {/* Bottom row: severity dot + CTA */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t" style={{ borderColor: 'var(--color-border-subtle)' }}>
        <span className="flex items-center gap-1.5 text-[10px] font-mono-code" style={{ color: 'var(--color-text-dim)' }}>
          <span
            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: dotColor }}
          />
          {event.severity || 'UNKNOWN'}
        </span>
        <span
          className="text-[10px] font-mono-code font-bold flex items-center gap-1 transition-colors"
          style={{ color: 'var(--color-accent)' }}
        >
          Open Briefing →
        </span>
      </div>
    </div>
  );
}
