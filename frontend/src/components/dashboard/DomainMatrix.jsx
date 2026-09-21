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
    <div
      className="p-5 sm:p-6 rounded-lg border shadow-xs space-y-4"
      style={{
        backgroundColor: 'var(--color-surface-1)',
        borderColor: 'var(--color-border)',
      }}
    >
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-2.5 w-1 rounded-full" style={{ backgroundColor: 'var(--color-accent)' }} />
            <span className="text-[10px] font-mono-code font-bold uppercase tracking-wider" style={{ color: 'var(--color-accent)' }}>
              SECTOR ANALYSIS
            </span>
          </div>
          <h2 className="text-base font-bold font-headline" style={{ color: 'var(--color-text-primary)' }}>
            {t('analytics.domainRadar', { defaultValue: 'Domain Impact Radar' })}
          </h2>
          <p className="text-xs font-mono-code" style={{ color: 'var(--color-text-dim)' }}>
            {t('analytics.domainRadarSub', { defaultValue: 'Real-time distribution across strategic economic sectors' })}
          </p>
        </div>

        {selectedDomain && (
          <button
            onClick={() => onSelectDomain(null)}
            className="text-xs font-mono-code font-bold cursor-pointer transition-colors"
            style={{ color: 'var(--color-critical, #e11d48)' }}
          >
            Clear Filter ×
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
        {allDomains.map((domainKey) => {
          const meta = DOMAIN_METADATA[domainKey];
          const { Icon } = meta;
          const stat = statsMap[domainKey];
          const count = stat?.count || 0;
          const isSelected = selectedDomain === domainKey;
          const domainLabel = t(`domains.${domainKey}`, { defaultValue: domainKey.replace(/_/g, ' ') });

          return (
            <button
              key={domainKey}
              onClick={() => onSelectDomain(isSelected ? null : domainKey)}
              className="p-3 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between gap-2"
              style={
                isSelected
                  ? {
                      backgroundColor: 'var(--color-accent-bg)',
                      borderColor: 'var(--color-accent-border)',
                      color: 'var(--color-accent)',
                    }
                  : {
                      backgroundColor: 'var(--color-surface-2)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-secondary)',
                    }
              }
              onMouseEnter={(e) => {
                if (!isSelected) e.currentTarget.style.borderColor = 'var(--color-accent-border)';
              }}
              onMouseLeave={(e) => {
                if (!isSelected) e.currentTarget.style.borderColor = 'var(--color-border)';
              }}
            >
              <div className="flex items-center justify-between">
                <div
                  className="p-1.5 rounded"
                  style={{
                    backgroundColor: isSelected ? 'var(--color-accent-border)' : 'var(--color-surface-4)',
                    color: isSelected ? '#ffffff' : 'var(--color-accent)',
                  }}
                >
                  <Icon size={13} />
                </div>
                <span className="text-xs font-mono-code font-bold" style={{ color: isSelected ? 'var(--color-accent)' : 'var(--color-text-primary)' }}>
                  {count}
                </span>
              </div>
              <span className="text-[11px] font-mono-code font-semibold leading-tight truncate" style={{ color: isSelected ? 'var(--color-accent)' : 'var(--color-text-muted)' }}>
                {domainLabel}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
