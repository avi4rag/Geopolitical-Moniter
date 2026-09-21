import React from 'react';
import { Clock, ChevronRight, Shield, Globe, Cpu, Radio } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getNewsEditorialImage, DEFAULT_EDITORIAL_FALLBACK } from '../../lib/newsImages.js';
import { translateNewsText } from '../../i18n/newsContentTranslations.js';
import HeroRadarGraphic from './HeroRadarGraphic.jsx';

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

const SEV_COLOR = {
  CRITICAL: '#e11d48',
  HIGH: '#f59e0b',
  MEDIUM: '#38bdf8',
  LOW: '#10b981',
};

// ─── Hero Featured Story ──────────────────────────────────────────────────────
// Near-black tension background, subtle red atmospheric glow, real top event,
// abstract geopolitical radar visualization, and comprehensive intelligence tags.
// ─────────────────────────────────────────────────────────────────────────────

export default function FeaturedStory({ event, onSelect }) {
  const { i18n } = useTranslation();
  if (!event) return null;

  const lang = i18n.language || 'en';
  const imageUrl = getNewsEditorialImage(event);
  const sevColor = SEV_COLOR[event.severity] || '#e11d48';
  const ago = timeAgo(event.createdAt);
  const isReal = !!(event.imageUrl || event.primaryArticleId?.imageUrl);
  const sourceName = event.primaryArticleId?.sourceId?.name || 'Global Wire Ingestion';
  const confidenceScore = event.credibilityScore ? `${Math.round(event.credibilityScore * 100)}%` : 'VERIFIED';

  return (
    <div
      className="relative w-full min-h-[460px] lg:min-h-[490px] rounded-xl overflow-hidden cursor-pointer group border border-white/[0.08] shadow-2xl transition-all duration-300 hover:border-white/[0.18]"
      style={{
        backgroundColor: '#020617',
      }}
      onClick={() => onSelect(event)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onSelect(event)}
      aria-label={`Open dossier: ${event.summary}`}
    >
      {/* Background Image — soft dimmed and editorial */}
      <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-[1.015]">
        <img
          src={imageUrl}
          alt=""
          className="w-full h-full object-cover"
          style={{ opacity: isReal ? 0.40 : 0.22 }}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = DEFAULT_EDITORIAL_FALLBACK;
          }}
        />
      </div>

      {/* Subtle Red Atmospheric Tension & Obsidian Overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at 85% 25%, rgba(225, 29, 72, 0.12) 0%, transparent 60%),
            radial-gradient(circle at 15% 85%, rgba(30, 58, 138, 0.15) 0%, transparent 70%),
            linear-gradient(to top, #020617 0%, rgba(2, 6, 23, 0.88) 50%, rgba(2, 6, 23, 0.45) 100%)
          `,
        }}
      />

      {/* Abstract Geopolitical Radar / Signal Detection Graphic (Right Side on Desktop) */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[340px] h-[340px] lg:w-[420px] lg:h-[420px] opacity-75 hidden md:block pointer-events-none transition-opacity duration-300 group-hover:opacity-95">
        <HeroRadarGraphic activeSector={event.eventType} />
      </div>

      {/* Top Banner Bar: LIVE status, Severity, Confidence, Signal Time */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          {/* Signal Live Badge */}
          <span
            className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-mono-code font-bold uppercase tracking-wider shadow-sm"
            style={{
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              color: '#10b981',
              border: '1px solid rgba(16, 185, 129, 0.35)',
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            LIVE SIGNAL
          </span>

          {/* Severity Badge */}
          <span
            className="px-2.5 py-1 rounded text-[10px] font-mono-code font-bold uppercase tracking-wider"
            style={{
              backgroundColor: `${sevColor}22`,
              color: sevColor,
              border: `1px solid ${sevColor}50`,
            }}
          >
            {event.severity} SEVERITY
          </span>
        </div>

        {/* Source confidence & count */}
        <div className="flex items-center gap-2 text-[10px] font-mono-code">
          <span
            className="hidden sm:inline-flex px-2 py-0.5 rounded border border-white/10 text-slate-300 bg-slate-900/80 backdrop-blur-sm"
          >
            CONFIDENCE: <strong className="ml-1 text-emerald-400">{confidenceScore}</strong>
          </span>
          <span
            className="px-2 py-0.5 rounded border border-white/10 text-slate-400 bg-slate-900/80 backdrop-blur-sm"
          >
            {ago}
          </span>
        </div>
      </div>

      {/* Hero Content — Bottom Anchored */}
      <div className="absolute inset-0 z-10 flex flex-col justify-end p-6 sm:p-8 lg:p-10 max-w-3xl">
        {/* Sector classification row */}
        <div className="flex items-center gap-2 mb-2.5">
          <span
            className="text-[10px] font-mono-code font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-700/40"
          >
            {event.eventType?.replace(/_/g, ' ') || 'STRATEGIC INTELLIGENCE'}
          </span>
          {event.sectors?.[0] && (
            <span className="text-[10px] font-mono-code text-slate-400">
              // {event.sectors[0]}
            </span>
          )}
        </div>

        {/* Editorial Headline */}
        <h1
          className="font-headline text-2xl sm:text-3xl md:text-4xl lg:text-[2.5rem] font-bold leading-tight mb-3 text-white group-hover:text-indigo-100 transition-colors"
        >
          {translateNewsText(event.summary, lang)}
        </h1>

        {/* Concise Impact Chain Snippet (if available) */}
        {event.impacts?.[0]?.explanation && (
          <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 mb-4 leading-relaxed font-sans max-w-2xl bg-black/40 p-2.5 rounded-lg border border-white/5 backdrop-blur-sm">
            <strong className="text-indigo-300 font-mono-code uppercase text-[10px] tracking-wider mr-1.5">Impact Vector:</strong>
            {translateNewsText(event.impacts[0].explanation, lang)}
          </p>
        )}

        {/* Footer Meta Row: Countries, Source Wire, Dossier CTA */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10">
          <div className="flex flex-wrap items-center gap-2">
            {(event.countries || []).slice(0, 4).map((c) => (
              <span
                key={c}
                className="text-[10px] font-mono-code px-2 py-0.5 rounded bg-slate-900/90 text-slate-300 border border-white/10"
              >
                {translateNewsText(c, lang)}
              </span>
            ))}
            <span className="text-[10px] font-mono-code text-slate-400 hidden sm:inline ml-1">
              Wire: <span className="text-slate-200">{sourceName}</span>
            </span>
          </div>

          <span
            className="flex items-center gap-1.5 text-xs font-mono-code font-bold text-indigo-300 group-hover:text-white transition-colors group-hover:translate-x-1 duration-200"
          >
            Open Intelligence Dossier
            <ChevronRight size={14} />
          </span>
        </div>
      </div>
    </div>
  );
}

