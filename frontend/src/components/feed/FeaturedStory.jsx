import React from 'react';
import { Clock, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getNewsEditorialImage } from '../../lib/newsImages.js';

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const SEV_COLOR = {
  CRITICAL: '#e11d48',
  HIGH: '#f59e0b',
  MEDIUM: '#38bdf8',
  LOW: '#10b981',
};

// ─── Hero Featured Story ──────────────────────────────────────────────────────
// Full-width dark hero card backed by the highest-severity real event.
// Image sourced from getNewsEditorialImage() — real thumbnail or category fallback.
// ─────────────────────────────────────────────────────────────────────────────

export default function FeaturedStory({ event, onSelect }) {
  const { i18n } = useTranslation();
  if (!event) return null;

  const imageUrl = getNewsEditorialImage(event);
  const sevColor = SEV_COLOR[event.severity] || '#c3c0ff';
  const ago = timeAgo(event.createdAt);
  const isReal = !!(event.imageUrl);

  return (
    <div
      className="relative w-full min-h-[420px] rounded-lg overflow-hidden cursor-pointer group border"
      style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface-1)' }}
      onClick={() => onSelect(event)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onSelect(event)}
      aria-label={`Open dossier: ${event.summary}`}
    >
      {/* Background image */}
      <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-[1.02]">
        <img
          src={imageUrl}
          alt=""
          className="w-full h-full object-cover"
          style={{ opacity: isReal ? 0.55 : 0.35, mixBlendMode: 'luminosity' }}
        />
      </div>

      {/* Gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to top, #020617 0%, rgba(2,6,23,0.80) 45%, rgba(2,6,23,0.25) 100%)',
        }}
      />

      {/* Top-right: LIVE badge + severity */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        <span
          className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono-code font-bold uppercase"
          style={{ backgroundColor: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
          LIVE
        </span>
        <span
          className="px-2 py-0.5 rounded text-[10px] font-mono-code font-bold uppercase"
          style={{
            backgroundColor: `${sevColor}20`,
            color: sevColor,
            border: `1px solid ${sevColor}40`,
          }}
        >
          {event.severity}
        </span>
      </div>

      {/* Content — bottom anchored */}
      <div className="absolute inset-0 z-10 flex flex-col justify-end p-6 sm:p-8">
        {/* Category */}
        <div className="mb-3">
          <span
            className="text-[10px] font-mono-code font-bold uppercase tracking-widest"
            style={{ color: 'var(--color-accent)' }}
          >
            {event.eventType?.replace(/_/g, ' ') || 'INTELLIGENCE BRIEF'}
          </span>
        </div>

        {/* Headline */}
        <h2
          className="font-headline text-2xl sm:text-3xl md:text-4xl font-bold leading-tight mb-4 max-w-3xl group-hover:text-white transition-colors"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {event.summary}
        </h2>

        {/* Footer row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            {(event.countries || []).slice(0, 3).map((c) => (
              <span
                key={c}
                className="text-[10px] font-mono-code px-2 py-0.5 rounded"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  color: 'var(--color-text-muted)',
                  border: '1px solid rgba(255,255,255,0.10)',
                }}
              >
                {c}
              </span>
            ))}
            <span
              className="flex items-center gap-1 text-[10px] font-mono-code"
              style={{ color: 'var(--color-text-dim)' }}
            >
              <Clock size={10} />
              {ago}
            </span>
          </div>

          <span
            className="flex items-center gap-1 text-xs font-mono-code font-bold transition-colors"
            style={{ color: 'var(--color-accent)' }}
          >
            Inspect Full Dossier
            <ChevronRight size={13} />
          </span>
        </div>
      </div>
    </div>
  );
}
