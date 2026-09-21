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
          <article
            key={event._id}
            className="glass-card hover-lift rounded-xl p-3 cursor-pointer group flex flex-col gap-2.5 relative overflow-hidden border transition-all duration-200"
            onClick={() => onSelect(event)}
            onKeyDown={(e) => e.key === 'Enter' && onSelect(event)}
            role="button"
            tabIndex={0}
            aria-label={`Open: ${event.summary}`}
            style={{
              backgroundColor: 'rgba(11, 16, 32, 0.65)',
              borderColor: 'rgba(255, 255, 255, 0.08)',
            }}
          >
            {/* Image Thumbnail */}
            <div
              className="relative w-full h-28 rounded-lg overflow-hidden border"
              style={{ backgroundColor: '#070a12', borderColor: 'rgba(255,255,255,0.06)' }}
            >
              <img
                src={imageUrl}
                alt={event.summary}
                className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = DEFAULT_EDITORIAL_FALLBACK;
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#070a12] via-transparent to-transparent pointer-events-none" />
              <div className="absolute top-2 left-2">
                <span
                  className="text-[9px] font-mono-code font-bold uppercase tracking-widest px-1.5 py-0.5 rounded backdrop-blur-md shadow-sm border"
                  style={{
                    backgroundColor: 'rgba(7,10,18,0.85)',
                    color: 'var(--color-cyan)',
                    borderColor: 'rgba(56,189,248,0.25)',
                  }}
                >
                  {event.eventType?.replace(/_/g, ' ') || 'EVENT'}
                </span>
              </div>
            </div>

            {/* Headline */}
            <h3
              className="font-headline text-sm font-semibold leading-snug line-clamp-2 flex-1 group-hover:text-white transition-colors duration-200"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {translateNewsText(event.summary, lang)}
            </h3>

            {/* Footer */}
            <div className="flex flex-wrap items-center gap-2 pt-1.5 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              {(event.countries || []).slice(0, 1).map((c) => (
                <span
                  key={c}
                  className="text-[9px] font-mono-code font-bold uppercase px-1.5 py-0.5 rounded"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.06)',
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
          </article>
        );
      })}
    </div>
  );
}
