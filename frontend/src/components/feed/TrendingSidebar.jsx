import React from 'react';
import { ChevronRight, Radio } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { translateNewsText } from '../../i18n/newsContentTranslations.js';

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m || 1}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

const SECTOR_COLOR = {
  CRITICAL: '#e11d48',
  HIGH: '#f59e0b',
  MEDIUM: '#38bdf8',
  LOW: '#10b981',
};

const SECTOR_ACCENTS = {
  DEFENSE: '#e11d48',
  SECURITY: '#e11d48',
  MILITARY: '#e11d48',
  DIPLOMACY: '#38bdf8',
  POLITICS: '#38bdf8',
  TECHNOLOGY: '#c3c0ff',
  CYBER: '#c3c0ff',
  ENERGY: '#f59e0b',
  ECONOMY: '#10b981',
  TRADE: '#10b981',
};

// ─── Trending Signals Horizontal Rail ─────────────────────────────────────────
// Full-width intelligence rail positioned directly below the Hero.
// Compact typography, dark navy surface, subtle transparency, sector indicators,
// and smooth 200-250ms hover state.
// ─────────────────────────────────────────────────────────────────────────────

export default function TrendingSidebar({ trendingEvents, onSelectEvent, onViewAll }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language || 'en';

  const signals = (trendingEvents || []).slice(0, 4);

  return (
    <section
      className="w-full rounded-xl overflow-hidden border border-white/[0.08] shadow-lg"
      style={{
        backgroundColor: 'rgba(10, 15, 30, 0.70)',
        backdropFilter: 'blur(12px)',
      }}
      aria-label="Trending Intelligence Signals"
    >
      {/* Header Bar */}
      <div
        className="px-4 py-2.5 border-b border-white/[0.06] flex items-center justify-between bg-slate-950/40"
      >
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
          </span>
          <h2 className="text-[11px] font-mono-code font-bold uppercase tracking-widest text-slate-200">
            TRENDING SIGNALS
          </h2>
          <span className="hidden sm:inline-block text-[9px] font-mono-code px-1.5 py-0.5 rounded bg-white/[0.04] text-slate-400 border border-white/[0.06]">
            HOTSPOTS
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[9px] font-mono-code font-semibold text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            LIVE STREAM
          </span>
          {onViewAll && (
            <button
              onClick={onViewAll}
              className="text-[10px] font-mono-code font-bold uppercase tracking-wider text-indigo-300 hover:text-white transition-colors duration-200 cursor-pointer flex items-center gap-1"
            >
              <span>{t('feed.viewAll', { defaultValue: 'View All' })}</span>
              <ChevronRight size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Signals Horizontal Rail Grid */}
      <div className="p-3">
        {(!signals || signals.length === 0) ? (
          <div className="py-6 text-center text-xs font-mono-code text-slate-500">
            Awaiting incoming telemetry streams...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {signals.map((event) => {
              const sectorName = event.sectors?.[0] || event.eventType?.replace(/_/g, ' ') || 'INTEL';
              const accentColor =
                SECTOR_ACCENTS[sectorName.toUpperCase()] ||
                SECTOR_COLOR[event.severity] ||
                '#c3c0ff';

              return (
                <button
                  key={event._id}
                  onClick={() => onSelectEvent(event)}
                  className="w-full text-left p-3 rounded-lg border border-white/[0.06] bg-slate-900/40 hover:bg-slate-800/60 hover:border-white/[0.16] cursor-pointer group transition-all duration-200 ease-out focus-visible:outline-2 focus-visible:outline-indigo-400 flex flex-col justify-between space-y-2 hover:-translate-y-0.5"
                >
                  {/* Top Line: Dot + Headline */}
                  <div className="flex items-start gap-2 min-w-0">
                    <span
                      className="w-2 h-2 rounded-full mt-1 flex-shrink-0 transition-transform duration-200 group-hover:scale-125"
                      style={{
                        backgroundColor: accentColor,
                        boxShadow: `0 0 8px ${accentColor}66`,
                      }}
                    />
                    <p className="text-xs font-headline font-semibold text-slate-300 group-hover:text-white transition-colors duration-200 line-clamp-2 leading-snug">
                      {translateNewsText(event.summary, lang)}
                    </p>
                  </div>

                  {/* Bottom Line: Sector Label + Time */}
                  <div className="flex items-center justify-between text-[10px] font-mono-code pt-1 border-t border-white/[0.04]">
                    <span
                      className="font-bold uppercase tracking-wider px-1.5 py-0.5 rounded transition-colors duration-200"
                      style={{
                        backgroundColor: `${accentColor}18`,
                        color: accentColor,
                        border: `1px solid ${accentColor}30`,
                      }}
                    >
                      {translateNewsText(sectorName, lang)}
                    </span>
                    <span className="text-slate-400 group-hover:text-slate-300 transition-colors duration-200">
                      {timeAgo(event.createdAt)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
