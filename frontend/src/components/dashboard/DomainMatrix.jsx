import React from 'react';
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

// ─── Domain Matrix ────────────────────────────────────────────────────────────
// Visual breakdown of economic and geopolitical impact domains.
// Clicking a domain filters the event stream.
// ─────────────────────────────────────────────────────────────────────────────

const DOMAIN_METADATA = {
  ENERGY: { label: 'Energy', Icon: Flame, color: '#f97316' },
  OIL_AND_GAS: { label: 'Oil & Gas', Icon: Fuel, color: '#fb923c' },
  TRADE: { label: 'Trade & Tariffs', Icon: ArrowLeftRight, color: '#38bdf8' },
  SUPPLY_CHAIN: { label: 'Supply Chain', Icon: Truck, color: '#a78bfa' },
  CURRENCY: { label: 'Currency / FX', Icon: DollarSign, color: '#34d399' },
  INFLATION: { label: 'Inflation', Icon: Percent, color: '#f87171' },
  DEFENSE: { label: 'Defense & Security', Icon: Shield, color: '#e879f9' },
  TECHNOLOGY: { label: 'Technology', Icon: Cpu, color: '#818cf8' },
  SEMICONDUCTORS: { label: 'Semiconductors', Icon: Microchip, color: '#2dd4bf' },
  FOOD_AGRICULTURE: { label: 'Food & Ag', Icon: Wheat, color: '#facc15' },
  DIPLOMACY: { label: 'Diplomacy', Icon: Handshake, color: '#60a5fa' },
  GLOBAL_STABILITY: { label: 'Global Stability', Icon: Globe2, color: '#ec4899' },
  FINANCIAL_MARKETS: { label: 'Financial Markets', Icon: BarChart3, color: '#4ade80' },
};

export default function DomainMatrix({ domainStats = [], selectedDomain, onSelectDomain }) {
  // Build lookup by domain name
  const statsMap = (domainStats || []).reduce((acc, curr) => {
    acc[curr.domain] = curr;
    return acc;
  }, {});

  const allDomains = Object.keys(DOMAIN_METADATA);

  return (
    <div
      className="p-5 rounded-xl border"
      style={{
        backgroundColor: 'var(--color-surface-1)',
        borderColor: 'var(--color-border)',
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-white">Cross-Domain Impact Radar</h3>
          <p className="text-xs text-slate-400">
            Click any domain to filter geopolitical events and assessed risks
          </p>
        </div>
        {selectedDomain && (
          <button
            onClick={() => onSelectDomain(null)}
            className="text-xs px-2 py-1 rounded bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
          >
            Clear Domain Filter (Showing: {selectedDomain})
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
        {allDomains.map((domainKey) => {
          const meta = DOMAIN_METADATA[domainKey];
          const stat = statsMap[domainKey];
          const count = stat?.totalCount || 0;
          const isSelected = selectedDomain === domainKey;
          const { Icon } = meta;

          return (
            <button
              key={domainKey}
              onClick={() => onSelectDomain(isSelected ? null : domainKey)}
              className={`p-2.5 rounded-lg border text-left transition-all duration-150 cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'border-amber-500/80 bg-amber-500/10 shadow-sm shadow-amber-500/10 ring-1 ring-amber-500/50'
                  : 'border-slate-800/80 bg-slate-900/40 hover:bg-slate-800/60 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div
                  className="w-6 h-6 rounded flex items-center justify-center"
                  style={{ backgroundColor: `${meta.color}20`, color: meta.color }}
                >
                  <Icon size={13} />
                </div>
                <span
                  className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${
                    count > 0 ? 'bg-slate-800 text-white' : 'text-slate-500'
                  }`}
                >
                  {count}
                </span>
              </div>
              <div className="mt-2">
                <div className="text-[11px] font-medium text-slate-300 truncate">
                  {meta.label}
                </div>
                {stat && stat.avgConfidence && (
                  <div className="text-[9px] text-slate-500 font-mono mt-0.5">
                    {Math.round(stat.avgConfidence * 100)}% conf
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
