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

// ─── Domain Matrix ────────────────────────────────────────────────────────────
// Visual breakdown of economic and geopolitical impact domains.
// Clicking a domain filters the event stream.
// ─────────────────────────────────────────────────────────────────────────────

const DOMAIN_METADATA = {
  ENERGY: { Icon: Flame, color: '#f97316' },
  OIL_AND_GAS: { Icon: Fuel, color: '#fb923c' },
  TRADE: { Icon: ArrowLeftRight, color: '#38bdf8' },
  SUPPLY_CHAIN: { Icon: Truck, color: '#a78bfa' },
  CURRENCY: { Icon: DollarSign, color: '#34d399' },
  INFLATION: { Icon: Percent, color: '#f87171' },
  DEFENSE: { Icon: Shield, color: '#e879f9' },
  TECHNOLOGY: { Icon: Cpu, color: '#818cf8' },
  SEMICONDUCTORS: { Icon: Microchip, color: '#2dd4bf' },
  FOOD_AGRICULTURE: { Icon: Wheat, color: '#facc15' },
  DIPLOMACY: { Icon: Handshake, color: '#60a5fa' },
  GLOBAL_STABILITY: { Icon: Globe2, color: '#ec4899' },
  FINANCIAL_MARKETS: { Icon: BarChart3, color: '#4ade80' },
};

export default function DomainMatrix({ domainStats = [], selectedDomain, onSelectDomain }) {
  const { t } = useTranslation();

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
          <h3 className="text-sm font-semibold text-white">{t('analytics.domainRadarTitle')}</h3>
          <p className="text-xs text-slate-400">
            {t('analytics.domainRadarDesc')}
          </p>
        </div>
        {selectedDomain && (
          <button
            onClick={() => onSelectDomain(null)}
            className="text-xs px-2 py-1 rounded bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
          >
            {t('analytics.clearDomainFilter', { domain: t(`domains.${selectedDomain}`, { defaultValue: selectedDomain }) })}
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
          const domainLabel = t(`domains.${domainKey}`, { defaultValue: domainKey });

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
                  {domainLabel}
                </div>
                {stat && stat.avgConfidence && (
                  <div className="text-[9px] text-slate-500 font-mono mt-0.5">
                    {Math.round(stat.avgConfidence * 100)}% {t('analytics.confidence')}
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
