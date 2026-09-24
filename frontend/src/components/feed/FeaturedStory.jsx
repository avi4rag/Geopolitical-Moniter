import React from 'react';
import { Clock, ChevronRight, Shield, Globe, Cpu, Radio } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getNewsEditorialImage, DEFAULT_EDITORIAL_FALLBACK } from '../../lib/newsImages.js';
import { translateNewsText } from '../../i18n/newsContentTranslations.js';
import HeroRadarGraphic from './HeroRadarGraphic.jsx';
import heroPng from '../../assets/hero.png';

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
// Strict two-column editorial hierarchy:
// Left Column (60-65%): Status, event type, controlled clamp headline, impact, meta, CTA
// Right Column (35-40%): Dedicated radar detection terminal with hero.png signal backing
// Zero overlapping; responsive scaling across desktop, tablet, and mobile.
// ─────────────────────────────────────────────────────────────────────────────

export default function FeaturedStory({ event, onSelect }) {
  const { i18n } = useTranslation();
  if (!event) return null;

  const lang = i18n.language || 'en';
  const imageUrl = getNewsEditorialImage(event);
  const sevColor = SEV_COLOR[event.severity] || '#e11d48';
  const ago = timeAgo(event.createdAt);
  const sourceName = event.primaryArticleId?.sourceId?.name || 'Global Wire Ingestion';
  const confidenceScore = event.credibilityScore ? `${Math.round(event.credibilityScore * 100)}%` : 'VERIFIED';

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden cursor-pointer group border border-white/[0.08] shadow-2xl transition-all duration-300 hover:border-white/[0.18] bg-[#020617]"
      onClick={() => onSelect(event)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onSelect(event)}
      aria-label={`Open dossier: ${event.summary}`}
    >
      {/* Background Editorial Ambient Photo (Dimmed & Atmospheric) */}
      <div className="absolute inset-0 pointer-events-none opacity-20 mix-blend-luminosity overflow-hidden">
        <img
          src={imageUrl}
          alt=""
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = DEFAULT_EDITORIAL_FALLBACK;
          }}
        />
      </div>

      {/* Subtle Atmospheric Tension Gradient Overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at 10% 20%, rgba(225, 29, 72, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 90% 80%, rgba(56, 189, 248, 0.06) 0%, transparent 50%),
            linear-gradient(135deg, rgba(2, 6, 23, 0.96) 0%, rgba(3, 7, 18, 0.92) 50%, rgba(15, 23, 42, 0.90) 100%)
          `,
        }}
      />

      {/* Two-Column Grid: Left Content (62%) + Right Visual (38%) */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 items-stretch min-h-[440px]">
        {/* ── LEFT CONTENT REGION (62% width on desktop) ── */}
        <div className="lg:col-span-7 xl:col-span-8 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-6">
          {/* Top Status & Confidence Badges */}
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex flex-wrap items-center gap-2">
              {/* Live Signal Badge */}
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-mono-code font-bold uppercase tracking-wider"
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

            {/* Confidence & Timestamp */}
            <div className="flex items-center gap-2 text-[10px] font-mono-code">
              <span className="px-2 py-0.5 rounded border border-white/10 text-slate-300 bg-slate-900/80 backdrop-blur-sm">
                CONFIDENCE: <strong className="ml-1 text-emerald-400">{confidenceScore}</strong>
              </span>
              <span className="px-2 py-0.5 rounded border border-white/10 text-slate-400 bg-slate-900/80 backdrop-blur-sm">
                {ago}
              </span>
            </div>
          </div>

          {/* Event Categorization & Editorial Headline */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[10px] font-mono-code font-bold uppercase tracking-widest text-indigo-300">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              <span>{event.eventType?.replace(/_/g, ' ') || 'STRATEGIC INTELLIGENCE'}</span>
              {event.sectors?.[0] && (
                <span className="text-slate-400 font-normal">// {translateNewsText(event.sectors[0], lang)}</span>
              )}
            </div>

            {/* Responsive Editorial Headline with clamp() sizing */}
            <h1
              className="font-headline font-bold text-white group-hover:text-indigo-100 transition-colors"
              style={{
                fontSize: 'clamp(1.35rem, 2.3vw, 2.05rem)',
                lineHeight: 1.25,
                letterSpacing: '-0.02em',
                maxWidth: '100%',
                overflowWrap: 'break-word',
              }}
            >
              {translateNewsText(event.summary, lang)}
            </h1>

            {/* Impact Vector snippet */}
            {event.impacts?.[0]?.explanation && (
              <p className="text-xs sm:text-sm text-slate-300 line-clamp-3 leading-relaxed font-sans bg-white/[0.03] p-3 rounded-lg border border-white/[0.06] backdrop-blur-sm max-w-xl">
                <strong className="text-indigo-300 font-mono-code uppercase text-[10px] tracking-wider mr-1.5">
                  Impact Vector:
                </strong>
                {translateNewsText(event.impacts[0].explanation, lang)}
              </p>
            )}
          </div>

          {/* Footer Metadata & Action CTA */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/[0.08]">
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

            <span className="inline-flex items-center gap-1.5 text-xs font-mono-code font-bold text-indigo-300 group-hover:text-white transition-colors group-hover:translate-x-1 duration-200">
              Open Intelligence Dossier
              <ChevronRight size={14} />
            </span>
          </div>
        </div>

        {/* ── RIGHT VISUAL REGION (38% width on desktop) ── */}
        <div className="lg:col-span-5 xl:col-span-4 relative flex items-center justify-center p-6 border-t lg:border-t-0 lg:border-l border-white/[0.06] bg-slate-950/40 overflow-hidden min-h-[300px] lg:min-h-full">
          {/* Integrated hero.png Signal Graphic */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
            <img
              src={heroPng}
              alt=""
              className="w-[85%] max-w-[340px] object-contain opacity-25 mix-blend-screen scale-110 filter contrast-125"
            />
            {/* Atmospheric red & cyan depth glow */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'radial-gradient(circle at center, rgba(225, 29, 72, 0.12) 0%, rgba(56, 189, 248, 0.08) 50%, transparent 75%)',
              }}
            />
          </div>

          {/* Interactive Radar Terminal within Dedicated Space */}
          <div className="relative z-10 w-full max-w-[320px] aspect-square flex items-center justify-center pointer-events-none">
            <HeroRadarGraphic activeSector={event.eventType} className="w-full h-full" />
          </div>

          {/* Radar Scanner Calibration Indicator */}
          <div className="absolute bottom-3 right-3 text-[9px] font-mono-code px-2 py-0.5 rounded bg-slate-900/80 border border-white/10 text-slate-400">
            RADAR: <span className="text-emerald-400">TRACKING</span>
          </div>
        </div>
      </div>
    </div>
  );
}
