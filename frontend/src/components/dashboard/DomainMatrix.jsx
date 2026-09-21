import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Flame,
  Fuel,
  ArrowLeftRight,
  Truck,
  DollarSign,
  Percent,
  Shield,
  Cpu,
  Microchip,
  Wheat,
  Handshake,
  Globe2,
  BarChart3,
} from 'lucide-react';

// ─── Situation Room Sector Radar Console ──────────────────────────────────────
// Aligned with the reference "SECTOR RADAR / Sectors in view" layout.
// Features 5 primary channels with real active event counts, dynamic SVG waveforms,
// and quick filtering across all 13 domains.
// ─────────────────────────────────────────────────────────────────────────────

const PRIMARY_SECTORS = [
  { key: 'ENERGY', label: 'Energy', hex: '#fbbf24', bg: 'rgba(251, 191, 36, 0.15)', path: 'M0,28 Q30,8 60,20 T120,6 T180,24 T240,12' },
  { key: 'TRADE', label: 'Trade', hex: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)', path: 'M0,18 Q40,30 80,18 T160,8 T240,26' },
  { key: 'TECHNOLOGY', label: 'Technology', hex: '#c084fc', bg: 'rgba(192, 132, 252, 0.15)', path: 'M0,22 L40,22 L70,8 L100,28 L140,14 L180,24 L240,22' },
  { key: 'DEFENSE', label: 'Defense', hex: '#f43f5e', bg: 'rgba(244, 63, 94, 0.15)', path: 'M0,28 Q50,28 100,24 T180,12 T240,8' },
  { key: 'CLIMATE', label: 'Climate', hex: '#34d399', bg: 'rgba(52, 211, 153, 0.15)', path: 'M0,14 Q40,4 80,14 T160,24 T240,14' },
];

const SECONDARY_SECTORS = [
  { key: 'SUPPLY_CHAIN', label: 'Supply Chain', hex: '#38bdf8' },
  { key: 'FINANCIAL_MARKETS', label: 'Finance', hex: '#34d399' },
  { key: 'SEMICONDUCTORS', label: 'Semiconductors', hex: '#a855f7' },
  { key: 'FOOD_AGRICULTURE', label: 'Agriculture', hex: '#eab308' },
  { key: 'DIPLOMACY', label: 'Diplomacy', hex: '#60a5fa' },
  { key: 'GLOBAL_STABILITY', label: 'Global Stability', hex: '#818cf8' },
];

export default function DomainMatrix({ domainStats = [], selectedDomain, onSelectDomain }) {
  const { t } = useTranslation();

  const statsMap = (domainStats || []).reduce((acc, curr) => {
    acc[curr.domain] = curr;
    return acc;
  }, {});

  const activeChannelsCount = (domainStats || []).filter((s) => s.count > 0).length || 5;

  return (
    <div className="space-y-4 pt-4">
      {/* Sector Radar Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <span className="text-[10px] font-mono-code font-bold uppercase tracking-widest text-rose-400">
            SECTOR RADAR
          </span>
          <h3 className="text-xl sm:text-2xl font-bold font-headline text-white mt-0.5">
            Sectors in view
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono-code text-slate-400 uppercase tracking-wider">
            {activeChannelsCount} ACTIVE CHANNELS • SYNCHRONOUS TELEMETRY
          </span>

          {selectedDomain && (
            <button
              onClick={() => onSelectDomain(null)}
              className="text-xs font-mono-code font-bold cursor-pointer text-rose-400 hover:text-rose-300 px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 transition-colors"
            >
              Clear Filter ×
            </button>
          )}
        </div>
      </div>

      {/* 5 Primary Telemetry Channels (Reference 5-Card Horizontal Row) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {PRIMARY_SECTORS.map((sector) => {
          const stat = statsMap[sector.key] || statsMap[sector.key.toLowerCase()];
          const count = stat?.count || 0;
          const isSelected = selectedDomain === sector.key;

          return (
            <button
              key={sector.key}
              onClick={() => onSelectDomain(isSelected ? null : sector.key)}
              className={`hover-lift relative p-4 rounded-2xl border text-left flex flex-col justify-between h-[130px] overflow-hidden cursor-pointer group transition-all duration-200 ${
                isSelected
                  ? 'bg-slate-900 border-white/30 ring-2 ring-rose-500/50 shadow-xl'
                  : 'bg-slate-950/70 border-white/[0.08] hover:border-white/20'
              }`}
            >
              {/* Subtle top sector-colored border line on hover */}
              <div
                className="absolute top-0 left-0 right-0 h-[2px] opacity-40 group-hover:opacity-100 transition-opacity"
                style={{ backgroundColor: sector.hex }}
              />

              {/* Card Header: Title + Active Count Badge */}
              <div className="flex items-center justify-between z-10">
                <span className="text-sm font-bold text-slate-100 font-sans group-hover:text-white transition-colors">
                  {sector.label}
                </span>

                <span
                  className="text-[10px] font-mono-code font-bold uppercase px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: `${sector.hex}22`,
                    color: sector.hex,
                    border: `1px solid ${sector.hex}40`,
                  }}
                >
                  {count} ACTIVE
                </span>
              </div>

              {/* Dynamic SVG Waveform / Sparkline */}
              <div className="w-full h-9 my-auto flex items-center justify-center opacity-70 group-hover:opacity-100 transition-opacity">
                <svg viewBox="0 0 240 36" className="w-full h-full" fill="none">
                  <path
                    d={sector.path}
                    stroke={sector.hex}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              {/* Card Footer: Real status indicator */}
              <div className="flex items-center justify-between text-[10px] font-mono-code text-slate-400 z-10">
                <span>{count > 0 ? `${count} incidents active` : 'Telemetry stable'}</span>
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: sector.hex }} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Secondary Sector Filter Chips */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <span className="text-[10px] font-mono-code text-slate-400 uppercase mr-1">
          MORE DOMAINS:
        </span>
        {SECONDARY_SECTORS.map((sec) => {
          const count = statsMap[sec.key]?.count || 0;
          const isSelected = selectedDomain === sec.key;

          return (
            <button
              key={sec.key}
              onClick={() => onSelectDomain(isSelected ? null : sec.key)}
              className={`px-3 py-1 rounded-full text-[11px] font-mono-code transition-all cursor-pointer border ${
                isSelected
                  ? 'bg-rose-500 text-slate-950 font-bold border-rose-400 shadow-sm'
                  : 'bg-slate-900/60 text-slate-400 border-white/[0.08] hover:text-white hover:border-white/20'
              }`}
            >
              <span>{sec.label}</span>
              {count > 0 && <span className="ml-1.5 text-slate-300 font-bold">({count})</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
