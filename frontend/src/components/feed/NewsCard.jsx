import React from 'react';
import { useTranslation } from 'react-i18next';
import { translateNewsText } from '../../i18n/newsContentTranslations.js';
import { getNewsEditorialImage, DEFAULT_EDITORIAL_FALLBACK } from '../../lib/newsImages.js';

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
// Compact intelligence card for the 3-col feed grid with article photography.
// ─────────────────────────────────────────────────────────────────────────────

export default function NewsCard({ event, onSelect }) {
  const { i18n } = useTranslation();
  if (!event) return null;

  const lang = i18n.language || 'en';
  const tMinus = timeAgo(event.createdAt);
  const dotColor = SEV_DOT[event.severity] || '#c3c0ff';
  const category = event.eventType?.replace(/_/g, ' ') || 'EVENT';
  const summary = translateNewsText(event.summary, lang);
  const imageUrl = getNewsEditorialImage(event);

  return (
    <div
      className="data-card card-shimmer rounded-lg p-4 flex flex-col justify-between gap-3 cursor-pointer group transition-colors"
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
      {/* Article Picture Thumbnail */}
      <div
        className="relative w-full h-44 rounded-md overflow-hidden border"
        style={{ backgroundColor: 'var(--color-surface-1)', borderColor: 'var(--color-border-subtle)' }}
      >
        <img
          src={imageUrl}
          alt={summary}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = DEFAULT_EDITORIAL_FALLBACK;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/25 pointer-events-none" />
        <div className="absolute top-2.5 left-2.5">
          <span
            className="text-[10px] font-mono-code font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow-sm"
            style={{ backgroundColor: 'rgba(2,6,23,0.85)', color: 'var(--color-text-dim)', border: '1px solid var(--color-border)' }}
          >
            {category}
          </span>
        </div>
        <div className="absolute top-2.5 right-2.5">
          <span
            className="text-[10px] font-mono-code px-1.5 py-0.5 rounded shadow-sm"
            style={{ backgroundColor: 'rgba(2,6,23,0.85)', color: 'var(--color-text-dim)' }}
          >
            {tMinus}
          </span>
        </div>
      </div>

      {/* Headline */}
      <h3
        className="font-headline text-base font-semibold leading-snug line-clamp-2 transition-colors group-hover:text-white"
        style={{ color: 'var(--color-text-primary)' }}
      >
        {summary}
      </h3>

      {/* Wire Source and Country Tag */}
      <div className="flex items-center gap-2 text-[11px] font-mono-code flex-wrap">
        <span className="font-semibold" style={{ color: 'var(--color-accent)' }}>
          {event.primaryArticleId?.sourceId?.name || 'Wire Dispatch'}
        </span>
        {event.countries?.[0] && (
          <>
            <span style={{ color: 'var(--color-text-dim)' }}>•</span>
            <span style={{ color: 'var(--color-text-muted)' }}>
              {translateNewsText(event.countries[0], lang)}
            </span>
          </>
        )}
      </div>

      {/* Bottom row: severity dot + CTA */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t" style={{ borderColor: 'var(--color-border-subtle)' }}>
        <span className="flex items-center gap-1.5 text-[10px] font-mono-code" style={{ color: 'var(--color-text-dim)' }}>
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: dotColor }}
          />
          <span className="font-bold tracking-wider">{event.severity || 'UNKNOWN'}</span>
        </span>
        <span
          className="text-xs font-mono-code font-bold flex items-center gap-1 transition-colors group-hover:translate-x-0.5 duration-150"
          style={{ color: 'var(--color-accent)' }}
        >
          Read Dossier →
        </span>
      </div>
    </div>
  );
}
