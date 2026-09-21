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
  ENERGY: { Icon: Flame, hex: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.30)' },
  OIL_AND_GAS: { Icon: Fuel, hex: '#f97316', bg: 'rgba(249, 115, 22, 0.12)', border: 'rgba(249, 115, 22, 0.30)' },
  TRADE: { Icon: ArrowLeftRight, hex: '#38bdf8', bg: 'rgba(56, 189, 248, 0.12)', border: 'rgba(56, 189, 248, 0.30)' },
  SUPPLY_CHAIN: { Icon: Truck, hex: '#c084fc', bg: 'rgba(192, 132, 252, 0.12)', border: 'rgba(192, 132, 252, 0.30)' },
  CURRENCY: { Icon: DollarSign, hex: '#34d399', bg: 'rgba(52, 211, 153, 0.12)', border: 'rgba(52, 211, 153, 0.30)' },
  INFLATION: { Icon: Percent, hex: '#fb7185', bg: 'rgba(251, 113, 133, 0.12)', border: 'rgba(251, 113, 133, 0.30)' },
  DEFENSE: { Icon: Shield, hex: '#f43f5e', bg: 'rgba(244, 63, 94, 0.12)', border: 'rgba(244, 63, 94, 0.30)' },
  TECHNOLOGY: { Icon: Cpu, hex: '#a855f7', bg: 'rgba(168, 85, 247, 0.12)', border: 'rgba(168, 85, 247, 0.30)' },
  SEMICONDUCTORS: { Icon: Microchip, hex: '#14b8a6', bg: 'rgba(20, 184, 166, 0.12)', border: 'rgba(20, 184, 166, 0.30)' },
  FOOD_AGRICULTURE: { Icon: Wheat, hex: '#eab308', bg: 'rgba(234, 179, 8, 0.12)', border: 'rgba(234, 179, 8, 0.30)' },
  DIPLOMACY: { Icon: Handshake, hex: '#60a5fa', bg: 'rgba(96, 165, 250, 0.12)', border: 'rgba(96, 165, 250, 0.30)' },
  GLOBAL_STABILITY: { Icon: Globe2, hex: '#818cf8', bg: 'rgba(129, 140, 248, 0.12)', border: 'rgba(129, 140, 248, 0.30)' },
  FINANCIAL_MARKETS: { Icon: BarChart3, hex: '#10b981', bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.30)' },
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
      className="glass-panel p-5 sm:p-6 rounded-xl border space-y-4 shadow-lg"
      style={{
        borderColor: 'var(--color-border)',
      }}
    >
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-2.5 w-1 rounded-full" style={{ backgroundColor: 'var(--color-accent)' }} />
            <span className="text-[10px] font-mono-code font-bold uppercase tracking-widest text-[var(--color-accent)]">
              STRATEGIC SECTOR TELEMETRY
            </span>
          </div>
          <h2 className="text-base font-bold font-headline" style={{ color: 'var(--color-text-primary)' }}>
            {t('analytics.domainRadar', { defaultValue: 'Domain Impact Radar' })}
          </h2>
          <p className="text-xs font-mono-code" style={{ color: 'var(--color-text-dim)' }}>
            {t('analytics.domainRadarSub', { defaultValue: 'Real-time event distribution and causal risk across 13 global domains' })}
          </p>
        </div>

        {selectedDomain && (
          <button
            onClick={() => onSelectDomain(null)}
            className="text-xs font-mono-code font-bold cursor-pointer transition-colors px-2.5 py-1 rounded-md border"
            style={{
              color: '#f43f5e',
              backgroundColor: 'rgba(244,63,94,0.10)',
              borderColor: 'rgba(244,63,94,0.25)',
            }}
          >
            Clear Filter ×
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
        {allDomains.map((domainKey) => {
          const meta = DOMAIN_METADATA[domainKey];
          const { Icon, hex, bg, border } = meta;
          const stat = statsMap[domainKey];
          const count = stat?.count || 0;
          const isSelected = selectedDomain === domainKey;
          const domainLabel = t(`domains.${domainKey}`, { defaultValue: domainKey.replace(/_/g, ' ') });

          return (
            <button
              key={domainKey}
              onClick={() => onSelectDomain(isSelected ? null : domainKey)}
              className="p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between gap-2.5 group relative overflow-hidden focus-visible:outline-2 focus-visible:outline-[var(--color-accent)]"
              style={
                isSelected
                  ? {
                      backgroundColor: 'rgba(195, 192, 255, 0.15)',
                      borderColor: hex,
                      boxShadow: `0 0 15px ${hex}30`,
                    }
                  : {
                      backgroundColor: 'rgba(21, 27, 45, 0.55)',
                      borderColor: 'rgba(255, 255, 255, 0.07)',
                    }
              }
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = hex;
                  e.currentTarget.style.backgroundColor = 'rgba(21, 27, 45, 0.80)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.07)';
                  e.currentTarget.style.backgroundColor = 'rgba(21, 27, 45, 0.55)';
                }
              }}
            >
              {/* Top ambient sector line */}
              <div
                className="absolute top-0 left-0 right-0 h-[2px] opacity-40 group-hover:opacity-100 transition-opacity"
                style={{ background: hex }}
              />

              <div className="flex items-center justify-between">
                <div
                  className="p-1.5 rounded-lg transition-transform duration-200 group-hover:scale-110"
                  style={{
                    backgroundColor: bg,
                    color: hex,
                    border: `1px solid ${border}`,
                  }}
                >
                  <Icon size={14} />
                </div>
                <div className="flex items-center gap-1.5">
                  {count > 0 && (
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: hex, boxShadow: `0 0 6px ${hex}` }}
                    />
                  )}
                  <span
                    className="text-xs font-mono-code font-bold"
                    style={{ color: isSelected ? hex : 'var(--color-text-primary)' }}
                  >
                    {count}
                  </span>
                </div>
              </div>

              <span
                className="text-[11px] font-mono-code font-semibold leading-tight truncate transition-colors"
                style={{ color: isSelected ? 'white' : 'var(--color-text-secondary)' }}
                title={domainLabel}
              >
                {domainLabel}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
