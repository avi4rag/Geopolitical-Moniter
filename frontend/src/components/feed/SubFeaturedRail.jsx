import React from 'react';
import { useTranslation } from 'react-i18next';
import { getNewsEditorialImage, DEFAULT_EDITORIAL_FALLBACK } from '../../lib/newsImages.js';
import { translateNewsText } from '../../i18n/newsContentTranslations.js';

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
  const { i18n } = useTranslation();
  if (!events || events.length === 0) return null;

  const lang = i18n.language || 'en';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {events.slice(0, 3).map((event) => {
        const imageUrl = getNewsEditorialImage(event);
        return (
          <div
            key={event._id}
            className="rounded-lg p-3 cursor-pointer group transition-colors border flex flex-col gap-2.5"
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
            {/* Image Thumbnail */}
            <div
              className="relative w-full h-28 rounded overflow-hidden border"
              style={{ backgroundColor: 'var(--color-surface-1)', borderColor: 'var(--color-border-subtle)' }}
            >
              <img
                src={imageUrl}
                alt={event.summary}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = DEFAULT_EDITORIAL_FALLBACK;
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              <div className="absolute top-2 left-2">
                <span
                  className="text-[9px] font-mono-code font-bold uppercase tracking-widest px-1.5 py-0.5 rounded shadow-sm"
                  style={{ backgroundColor: 'rgba(2,6,23,0.85)', color: 'var(--color-accent)', border: '1px solid var(--color-border)' }}
                >
                  {event.eventType?.replace(/_/g, ' ') || 'EVENT'}
                </span>
              </div>
            </div>

            {/* Headline */}
            <h3
              className="font-headline text-sm font-semibold leading-snug line-clamp-3 flex-1 group-hover:text-white transition-colors"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {translateNewsText(event.summary, lang)}
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
                  {translateNewsText(c, lang)}
                </span>
              ))}
              <span className="text-[9px] font-mono-code ml-auto" style={{ color: 'var(--color-text-dim)' }}>
                {timeAgo(event.createdAt)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
