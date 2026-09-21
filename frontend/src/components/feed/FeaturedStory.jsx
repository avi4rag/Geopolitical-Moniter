import React from 'react';
import { Clock, Shield, Globe, Cpu, Radio, FileText, Satellite } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getNewsEditorialImage, DEFAULT_EDITORIAL_FALLBACK } from '../../lib/newsImages.js';
import { translateNewsText } from '../../i18n/newsContentTranslations.js';
import HeroRadarGraphic from './HeroRadarGraphic.jsx';

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'JUST NOW';
  if (m < 60) return `${m} MIN AGO`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}H AGO`;
  return `${Math.floor(h / 24)}D AGO`;
}

// ─── Situation Room Hero Featured Story ───────────────────────────────────────
// Reference layout:
// Left (65%): Status pill, Telemetry lock, Theater code, Headline (2-4 lines),
// Impact chain box with gold arrows, Metadata row, Dual CTA buttons.
// Right (35%): Orbital constellation tag, Dedicated Radar Scope Terminal.
// ─────────────────────────────────────────────────────────────────────────────

export default function FeaturedStory({ event, onSelect }) {
  const { i18n } = useTranslation();
  if (!event) return null;

  const lang = i18n.language || 'en';
  const imageUrl = getNewsEditorialImage(event);
  const ago = timeAgo(event.createdAt);
  const isReal = !!(event.imageUrl || event.primaryArticleId?.imageUrl);
  const sourceName = event.primaryArticleId?.sourceId?.name || 'Global Wire Ingestion';
  const confidenceScore = event.credibilityScore ? `${Math.round(event.credibilityScore * 100)}%` : 'HIGH (96%)';
  const sourceCount = event.corroboratingSources?.length || (event.primaryArticleId ? 1 : 4);
  const countryLabel = event.countries?.[0] ? translateNewsText(event.countries[0], lang) : 'INTERNATIONAL WATERS';
  const theaterCode = event.regions?.[0] || event.countries?.[0] || 'GLOBAL THEATER';
  const sectorCode = event.sectors?.[0] || 'STRATEGIC';
  const utcNow = new Date().toISOString().slice(11, 19) + ' UTC';

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden cursor-pointer group border border-white/10 shadow-2xl transition-all duration-300 hover:border-white/20 p-6 sm:p-8 lg:p-9"
      style={{
        background: 'linear-gradient(135deg, #070a12 0%, #0b1020 50%, #070a12 100%)',
      }}
      onClick={() => onSelect(event)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onSelect(event)}
      aria-label={`Open tactical dossier: ${event.summary}`}
    >
      {/* Background Dimmed Editorial Imagery */}
      <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-[1.012] pointer-events-none">
        <img
          src={imageUrl}
          alt=""
          className="w-full h-full object-cover"
          style={{ opacity: isReal ? 0.20 : 0.10 }}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = DEFAULT_EDITORIAL_FALLBACK;
          }}
        />
      </div>

      {/* Atmospheric Radial Gradients (Coral Tension on Top-Left + Blue Horizon) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at 10% 20%, rgba(244, 63, 94, 0.12) 0%, transparent 60%),
            radial-gradient(circle at 85% 80%, rgba(30, 58, 138, 0.15) 0%, transparent 70%),
            linear-gradient(to top, rgba(7, 10, 18, 0.95) 0%, rgba(11, 16, 32, 0.82) 100%)
          `,
        }}
      />

      {/* Main Two-Column Hero Grid */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* ── LEFT COLUMN (65% on Desktop) ─────────────────────────────────── */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Status & Telemetry Header */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono-code font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm shadow-rose-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
              ACTIVE — {event.severity || 'HIGH'} SEVERITY
            </span>
            <span className="text-[10px] font-mono-code text-slate-400 tracking-wider">
              TELEMETRY LOCK // {utcNow}
            </span>
          </div>

          {/* Theater Code Subtitle */}
          <div className="text-[11px] font-mono-code font-bold uppercase tracking-widest text-rose-400/90">
            THEATER: {theaterCode} // SECTOR-{sectorCode}
          </div>

          {/* Editorial Headline — Controlled 2-4 lines, balanced scale */}
          <h1 className="font-headline text-xl sm:text-2xl md:text-3xl font-bold leading-tight text-white group-hover:text-rose-200 transition-colors line-clamp-3 sm:line-clamp-4 max-w-2xl tracking-tight">
            {translateNewsText(event.summary, lang)}
          </h1>

          {/* Impact Chain Box with Gold Arrows */}
          <div className="bg-slate-950/75 border border-white/[0.08] rounded-xl p-3 sm:p-3.5 text-xs font-mono-code text-slate-300 max-w-2xl backdrop-blur-md">
            <span className="text-amber-400 font-bold uppercase tracking-wider mr-2">IMPACT CHAIN:</span>
            {event.impacts?.[0]?.explanation ? (
              <span>
                <span>{event.impacts[0].domain}</span>
                <span className="text-amber-400 mx-2 font-bold">&gt;</span>
                <span className="text-slate-200">{translateNewsText(event.impacts[0].explanation, lang)}</span>
                <span className="text-amber-400 mx-2 font-bold">&gt;</span>
                <span className="text-rose-400 font-semibold">{event.impacts[0].severity || 'STRATEGIC'} SECTOR FLAGGED</span>
              </span>
            ) : (
              <span>
                <span>{event.sectors?.slice(0, 2).join(' • ') || 'Maritime Corridor'}</span>
                <span className="text-amber-400 mx-2 font-bold">&gt;</span>
                <span className="text-slate-200">Systemic trade & energy transmission verified</span>
                <span className="text-amber-400 mx-2 font-bold">&gt;</span>
                <span className="text-rose-400 font-semibold">Priority Monitor Flagged</span>
              </span>
            )}
          </div>

          {/* Technical Metadata Row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] font-mono-code text-slate-400 pt-1">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Clock size={12} className="text-slate-500" />
              DETECTED {ago}
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-emerald-400 font-semibold">
              CONFIDENCE HIGH ({confidenceScore})
            </span>
            <span className="text-slate-600">•</span>
            <span>
              {sourceCount} CORROBORATING SOURCES
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-300">
              GEO-LOCK: {countryLabel}
            </span>
          </div>

          {/* Dual Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              className="btn-primary-coral px-5 py-2.5 rounded-full text-xs font-mono-code font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg shadow-rose-500/25"
            >
              <FileText size={14} />
              <span>OPEN TACTICAL DOSSIER</span>
            </button>

            <button
              type="button"
              className="btn-secondary-glass px-4 py-2.5 rounded-full text-xs font-mono-code font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer"
            >
              <Radio size={14} className="text-rose-400" />
              <span>EXPORT TELEMETRY STREAM</span>
            </button>
          </div>
        </div>

        {/* ── RIGHT COLUMN (35% on Desktop) — Radar Scope Terminal ────────── */}
        <div className="lg:col-span-4 flex flex-col items-center lg:items-end space-y-2.5">
          <div className="flex items-center gap-1.5 text-[10px] font-mono-code text-slate-400 uppercase tracking-widest">
            <Satellite size={12} className="text-rose-400" />
            <span>SENSOR CONSTELLATION SECURED</span>
          </div>

          <HeroRadarGraphic event={event} className="w-full max-w-[340px]" />
        </div>
      </div>
    </div>
  );
}

