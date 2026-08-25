import React from 'react';
import { Search, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const DOMAINS = ['ALL', 'DEFENSE', 'ENERGY', 'TRADE', 'TECHNOLOGY', 'DIPLOMACY', 'CYBER', 'FINANCIAL', 'HUMANITARIAN'];
const SEVERITIES = ['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

const SEV_ACTIVE = {
  CRITICAL: { bg: 'rgba(225,29,72,0.20)', border: 'rgba(225,29,72,0.40)', color: '#e11d48' },
  HIGH:     { bg: 'rgba(245,158,11,0.20)', border: 'rgba(245,158,11,0.40)', color: '#f59e0b' },
  MEDIUM:   { bg: 'rgba(56,189,248,0.20)',  border: 'rgba(56,189,248,0.40)',  color: '#38bdf8' },
  LOW:      { bg: 'rgba(16,185,129,0.15)',  border: 'rgba(16,185,129,0.35)',  color: '#10b981' },
};

// ─── Feed Filters Toolbar ─────────────────────────────────────────────────────
// Dark filter bar: keyword search + domain + severity pills + reset.
// ─────────────────────────────────────────────────────────────────────────────

export default function FeedFilters({
  search, onSearchChange,
  domain, onDomainChange,
  severity, onSeverityChange,
  onReset, hasActiveFilters,
}) {
  const { t } = useTranslation();

  return (
    <div className="space-y-3">
      {/* Search + Reset row */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--color-text-dim)' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t('filters.searchPlaceholder', { defaultValue: 'Filter by keyword...' })}
            className="w-full pl-8 pr-3 py-2 text-xs font-mono-code rounded transition-colors"
            style={{
              backgroundColor: 'var(--color-surface-2)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-secondary)',
            }}
          />
        </div>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 px-3 py-2 rounded text-xs font-mono-code font-bold cursor-pointer transition-colors"
            style={{
              color: '#e11d48',
              border: '1px solid rgba(225,29,72,0.30)',
              backgroundColor: 'rgba(225,29,72,0.10)',
            }}
          >
            <X size={11} />
            Reset
          </button>
        )}
      </div>

      {/* Domain pills */}
      <div className="flex flex-wrap gap-1.5">
        {DOMAINS.map((d) => {
          const isActive = domain === d;
          return (
            <button
              key={d}
              onClick={() => onDomainChange(d)}
              className="px-2.5 py-1 rounded text-[10px] font-mono-code font-bold uppercase tracking-wide transition-colors cursor-pointer"
              style={isActive
                ? { backgroundColor: 'var(--color-accent-bg)', border: '1px solid var(--color-accent-border)', color: 'var(--color-accent)' }
                : { backgroundColor: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text-dim)' }
              }
            >
              {d === 'ALL' ? t('filters.all', { defaultValue: 'ALL' }) : d}
            </button>
          );
        })}
      </div>

      {/* Severity pills */}
      <div className="flex flex-wrap gap-1.5">
        {SEVERITIES.map((s) => {
          const isActive = severity === s;
          const activeStyle = SEV_ACTIVE[s];
          return (
            <button
              key={s}
              onClick={() => onSeverityChange(s)}
              className="px-2.5 py-1 rounded text-[10px] font-mono-code font-bold uppercase tracking-wide transition-colors cursor-pointer"
              style={isActive && activeStyle
                ? { backgroundColor: activeStyle.bg, border: `1px solid ${activeStyle.border}`, color: activeStyle.color }
                : isActive
                ? { backgroundColor: 'var(--color-accent-bg)', border: '1px solid var(--color-accent-border)', color: 'var(--color-accent)' }
                : { backgroundColor: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text-dim)' }
              }
            >
              {s}
            </button>
          );
        })}
      </div>
    </div>
  );
}
