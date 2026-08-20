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

// ─── Domain Impact Radar / Matrix ─────────────────────────────────────────────
// Visual breakdown of economic and geopolitical impact domains.
// ─────────────────────────────────────────────────────────────────────────────

const DOMAIN_METADATA = {
  ENERGY: { Icon: Flame, color: 'text-amber-600', bg: 'bg-amber-50' },
  OIL_AND_GAS: { Icon: Fuel, color: 'text-orange-600', bg: 'bg-orange-50' },
  TRADE: { Icon: ArrowLeftRight, color: 'text-sky-600', bg: 'bg-sky-50' },
  SUPPLY_CHAIN: { Icon: Truck, color: 'text-purple-600', bg: 'bg-purple-50' },
  CURRENCY: { Icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  INFLATION: { Icon: Percent, color: 'text-rose-600', bg: 'bg-rose-50' },
  DEFENSE: { Icon: Shield, color: 'text-pink-600', bg: 'bg-pink-50' },
  TECHNOLOGY: { Icon: Cpu, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  SEMICONDUCTORS: { Icon: Microchip, color: 'text-teal-600', bg: 'bg-teal-50' },
  FOOD_AGRICULTURE: { Icon: Wheat, color: 'text-amber-600', bg: 'bg-amber-50' },
  DIPLOMACY: { Icon: Handshake, color: 'text-blue-600', bg: 'bg-blue-50' },
  GLOBAL_STABILITY: { Icon: Globe2, color: 'text-violet-600', bg: 'bg-violet-50' },
  FINANCIAL_MARKETS: { Icon: BarChart3, color: 'text-emerald-600', bg: 'bg-emerald-50' },
};

export default function DomainMatrix({ domainStats = [], selectedDomain, onSelectDomain }) {
  const { t } = useTranslation();

  const statsMap = (domainStats || []).reduce((acc, curr) => {
    acc[curr.domain] = curr;
    return acc;
  }, {});

  const allDomains = Object.keys(DOMAIN_METADATA);

  return (
    <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-slate-950">
            {t('analytics.domainRadar', { defaultValue: 'Domain Impact Radar' })}
          </h2>
          <p className="text-xs text-slate-500">
            {t('analytics.domainRadarSub', { defaultValue: 'Real-time distribution across strategic economic sectors' })}
          </p>
        </div>

        {selectedDomain && (
          <button
            onClick={() => onSelectDomain(null)}
            className="text-xs font-semibold text-rose-600 hover:underline cursor-pointer"
          >
            Clear Filter
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
        {allDomains.map((domainKey) => {
          const meta = DOMAIN_METADATA[domainKey];
          const { Icon, color, bg } = meta;
          const stat = statsMap[domainKey];
          const count = stat?.count || 0;
          const isSelected = selectedDomain === domainKey;
          const domainLabel = t(`domains.${domainKey}`, { defaultValue: domainKey });

          return (
            <button
              key={domainKey}
              onClick={() => onSelectDomain(isSelected ? null : domainKey)}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-50/80 shadow-2xs scale-[1.02]'
                  : 'border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-1.5 rounded-lg ${bg} ${color}`}>
                  <Icon size={14} />
                </div>
                <span className="text-xs font-mono font-bold text-slate-900">
                  {count}
                </span>
              </div>
              <span className="text-[11px] font-semibold text-slate-700 leading-tight truncate">
                {domainLabel}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
