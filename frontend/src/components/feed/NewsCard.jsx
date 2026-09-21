import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowUpRight } from 'lucide-react';
import { translateNewsText } from '../../i18n/newsContentTranslations.js';
import { getNewsEditorialImage, DEFAULT_EDITORIAL_FALLBACK } from '../../lib/newsImages.js';

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'JUST NOW';
  if (m < 60) return `${m}M AGO`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}H AGO`;
  return `${Math.floor(h / 24)}D AGO`;
}

const SEV_DOT = {
  CRITICAL: '#e11d48',
  HIGH: '#f59e0b',
  MEDIUM: '#38bdf8',
  LOW: '#10b981',
};

function getSectorAccent(event) {
  const s = (event?.sectors?.[0] || event?.eventType || '').toUpperCase();
  if (s.includes('ENERGY') || s.includes('OIL')) {
    return { name: 'ENERGY', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.30)', glow: 'rgba(245,158,11,0.15)' };
  }
  if (s.includes('DEFENSE') || s.includes('MILITARY') || s.includes('CONFLICT') || s.includes('TERROR')) {
    return { name: 'DEFENSE', color: '#f43f5e', bg: 'rgba(244,63,94,0.12)', border: 'rgba(244,63,94,0.30)', glow: 'rgba(244,63,94,0.15)' };
  }
  if (s.includes('TECH') || s.includes('CYBER') || s.includes('SEMICONDUCTOR')) {
    return { name: 'TECHNOLOGY', color: '#a855f7', bg: 'rgba(168,85,247,0.12)', border: 'rgba(168,85,247,0.30)', glow: 'rgba(168,85,247,0.15)' };
  }
  if (s.includes('TRADE') || s.includes('SUPPLY') || s.includes('SANCTION') || s.includes('EXPORT')) {
    return { name: 'TRADE', color: '#38bdf8', bg: 'rgba(56,189,248,0.12)', border: 'rgba(56,189,248,0.30)', glow: 'rgba(56,189,248,0.15)' };
  }
  if (s.includes('CLIMATE') || s.includes('FOOD') || s.includes('AGRICULTURE')) {
    return { name: 'CLIMATE & FOOD', color: '#10b981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.30)', glow: 'rgba(16,185,129,0.15)' };
  }
  return { name: 'GEOPOLITICAL', color: '#c3c0ff', bg: 'rgba(195,192,255,0.10)', border: 'rgba(195,192,255,0.25)', glow: 'rgba(195,192,255,0.12)' };
}

// ─── News Card — Premium Editorial Intelligence Card ────────────────────────
// Translucent dark glass surface, subtle gradient, thin border, sector accent
// ─────────────────────────────────────────────────────────────────────────────

export default function NewsCard({ event, onSelect }) {
  const { i18n } = useTranslation();
  if (!event) return null;

  const lang = i18n.language || 'en';
  const tMinus = timeAgo(event.createdAt);
  const dotColor = SEV_DOT[event.severity] || '#38bdf8';
  const category = event.eventType?.replace(/_/g, ' ') || 'EVENT';
  const summary = translateNewsText(event.summary, lang);
  const imageUrl = getNewsEditorialImage(event);
  const sector = getSectorAccent(event);

  // Derive confidence if present
  const confidence = typeof event.confidenceScore === 'number'
    ? `${Math.round(event.confidenceScore > 1 ? event.confidenceScore : event.confidenceScore * 100)}%`
    : null;

  return (
    <article
      className="glass-card hover-lift rounded-xl p-4 flex flex-col justify-between gap-3.5 cursor-pointer group relative overflow-hidden border transition-all duration-200"
      onClick={() => onSelect(event)}
      onKeyDown={(e) => e.key === 'Enter' && onSelect(event)}
      role="button"
      tabIndex={0}
      aria-label={`Open briefing: ${event.summary}`}
      style={{
        borderColor: 'rgba(255, 255, 255, 0.08)',
        backgroundColor: 'rgba(11, 16, 32, 0.70)',
      }}
    >
      {/* Subtle top sector glow line */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] opacity-60 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `linear-gradient(90deg, transparent, ${sector.color}, transparent)` }}
      />

      {/* Article Picture Thumbnail */}
      <div
        className="relative w-full h-44 rounded-lg overflow-hidden border"
        style={{ backgroundColor: '#070a12', borderColor: 'rgba(255,255,255,0.06)' }}
      >
        <img
          src={imageUrl}
          alt={summary}
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = DEFAULT_EDITORIAL_FALLBACK;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070a12] via-[#070a12]/30 to-transparent pointer-events-none" />

        {/* Sector / Category badge */}
        <div className="absolute top-2.5 left-2.5">
          <span
            className="text-[10px] font-mono-code font-bold uppercase tracking-wider px-2 py-0.5 rounded backdrop-blur-md shadow-sm border"
            style={{
              backgroundColor: 'rgba(7,10,18,0.85)',
              color: sector.color,
              borderColor: sector.border,
            }}
          >
            {category}
          </span>
        </div>

        {/* Timestamp */}
        <div className="absolute top-2.5 right-2.5">
          <span
            className="text-[10px] font-mono-code px-2 py-0.5 rounded backdrop-blur-md shadow-sm border"
            style={{
              backgroundColor: 'rgba(7,10,18,0.85)',
              color: 'var(--color-text-secondary)',
              borderColor: 'rgba(255,255,255,0.08)',
            }}
          >
            {tMinus}
          </span>
        </div>

        {/* Confidence chip if genuine data exists */}
        {confidence && (
          <div className="absolute bottom-2 right-2">
            <span
              className="text-[9px] font-mono-code font-bold px-1.5 py-0.5 rounded backdrop-blur-md border"
              style={{
                backgroundColor: 'rgba(7,10,18,0.85)',
                color: 'var(--color-cyan)',
                borderColor: 'rgba(56,189,248,0.3)',
              }}
            >
              CONF: {confidence}
            </span>
          </div>
        )}
      </div>

      {/* Headline */}
      <h3
        className="font-headline text-base font-semibold leading-snug line-clamp-2 transition-colors duration-200 group-hover:text-white"
        style={{ color: 'var(--color-text-primary)' }}
      >
        {summary}
      </h3>

      {/* Wire Source and Country Tag */}
      <div className="flex items-center gap-2 text-[11px] font-mono-code flex-wrap">
        <span className="font-semibold tracking-tight" style={{ color: 'var(--color-cyan)' }}>
          {event.primaryArticleId?.sourceId?.name || 'Wire Dispatch'}
        </span>
        {event.countries?.[0] && (
          <>
            <span style={{ color: 'var(--color-text-dim)' }}>•</span>
            <span
              className="px-1.5 py-0.5 rounded text-[10px] uppercase font-bold"
              style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: 'var(--color-text-secondary)' }}
            >
              {translateNewsText(event.countries[0], lang)}
            </span>
          </>
        )}
      </div>

      {/* Bottom row: severity dot + CTA */}
      <div
        className="flex items-center justify-between gap-2 pt-2.5 border-t"
        style={{ borderColor: 'rgba(255,255,255,0.07)' }}
      >
        <span className="flex items-center gap-1.5 text-[10px] font-mono-code" style={{ color: 'var(--color-text-dim)' }}>
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{
              backgroundColor: dotColor,
              boxShadow: `0 0 8px ${dotColor}80`,
            }}
          />
          <span className="font-bold tracking-wider">{event.severity || 'UNKNOWN'}</span>
        </span>
        <span
          className="text-xs font-mono-code font-bold flex items-center gap-1 transition-all duration-200 group-hover:translate-x-0.5"
          style={{ color: 'var(--color-coral)' }}
        >
          <span>READ DOSSIER</span>
          <ArrowUpRight size={13} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </article>
  );
}
