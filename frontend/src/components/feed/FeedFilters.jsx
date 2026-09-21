import React from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const DOMAINS = [
  { id: 'ALL', label: 'ALL DOMAINS', color: 'var(--color-accent)' },
  { id: 'DEFENSE', label: 'DEFENSE', color: '#f43f5e' },
  { id: 'ENERGY', label: 'ENERGY', color: '#f59e0b' },
  { id: 'TRADE', label: 'TRADE', color: '#38bdf8' },
  { id: 'TECHNOLOGY', label: 'TECHNOLOGY', color: '#a855f7' },
  { id: 'DIPLOMACY', label: 'DIPLOMACY', color: '#60a5fa' },
  { id: 'CYBER', label: 'CYBER', color: '#c084fc' },
  { id: 'FINANCIAL', label: 'FINANCIAL', color: '#34d399' },
  { id: 'HUMANITARIAN', label: 'HUMANITARIAN', color: '#fb923c' },
];

const SEVERITIES = [
  { id: 'ALL', label: 'ALL SEVERITIES' },
  { id: 'CRITICAL', label: 'CRITICAL', color: '#e11d48', bg: 'rgba(225,29,72,0.18)', border: 'rgba(225,29,72,0.40)' },
  { id: 'HIGH', label: 'HIGH', color: '#f59e0b', bg: 'rgba(245,158,11,0.18)', border: 'rgba(245,158,11,0.40)' },
  { id: 'MEDIUM', label: 'MEDIUM', color: '#38bdf8', bg: 'rgba(56,189,248,0.18)', border: 'rgba(56,189,248,0.40)' },
  { id: 'LOW', label: 'LOW', color: '#10b981', bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.35)' },
];

// ─── Feed Filters Toolbar ─────────────────────────────────────────────────────
// Controlled glass intelligence filter console with sector & severity telemetry.
// ─────────────────────────────────────────────────────────────────────────────

export default function FeedFilters({
  search, onSearchChange,
  domain, onDomainChange,
  severity, onSeverityChange,
  onReset, hasActiveFilters,
}) {
  const { t } = useTranslation();

  return (
    <div
      className="glass-panel rounded-xl p-4 sm:p-5 border space-y-3.5 shadow-md"
      style={{ borderColor: 'var(--color-border)' }}
    >
      {/* Top row: search + reset */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search
            size={13}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'var(--color-text-dim)' }}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t('filters.searchPlaceholder', { defaultValue: 'Filter intelligence stream by keyword...' })}
            className="w-full pl-9 pr-8 py-2 text-xs font-mono-code rounded-lg glass-control transition-all focus:outline-none"
            style={{
              color: 'var(--color-text-primary)',
            }}
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-dim)] hover:text-white cursor-pointer p-0.5"
              aria-label="Clear search"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono-code font-bold cursor-pointer transition-all duration-200 self-start sm:self-auto"
            style={{
              color: '#f43f5e',
              border: '1px solid rgba(244,63,94,0.35)',
              backgroundColor: 'rgba(244,63,94,0.12)',
              boxShadow: '0 0 12px rgba(244,63,94,0.15)',
            }}
          >
            <X size={12} />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      {/* Domain pills */}
      <div className="space-y-1.5">
        <span className="text-[9px] font-mono-code uppercase font-bold tracking-widest text-[var(--color-text-dim)]">
          Strategic Domain
        </span>
        <div className="flex flex-wrap gap-1.5">
          {DOMAINS.map((d) => {
            const isActive = domain === d.id;
            return (
              <button
                key={d.id}
                onClick={() => onDomainChange(d.id)}
                className="px-2.5 py-1 rounded-md text-[10px] font-mono-code font-bold uppercase tracking-wider transition-all duration-150 cursor-pointer"
                style={isActive
                  ? {
                      backgroundColor: 'rgba(195, 192, 255, 0.15)',
                      border: `1px solid ${d.color}`,
                      color: d.color,
                      boxShadow: `0 0 10px ${d.color}30`,
                    }
                  : {
                      backgroundColor: 'rgba(21, 27, 45, 0.50)',
                      border: '1px solid rgba(255, 255, 255, 0.07)',
                      color: 'var(--color-text-muted)',
                    }
                }
              >
                {d.id === 'ALL' ? t('filters.all', { defaultValue: 'ALL DOMAINS' }) : d.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Severity pills */}
      <div className="space-y-1.5 pt-1 border-t" style={{ borderColor: 'var(--color-border-subtle)' }}>
        <span className="text-[9px] font-mono-code uppercase font-bold tracking-widest text-[var(--color-text-dim)]">
          Severity Level
        </span>
        <div className="flex flex-wrap gap-1.5">
          {SEVERITIES.map((s) => {
            const isActive = severity === s.id;
            return (
              <button
                key={s.id}
                onClick={() => onSeverityChange(s.id)}
                className="px-2.5 py-1 rounded-md text-[10px] font-mono-code font-bold uppercase tracking-wider transition-all duration-150 cursor-pointer"
                style={isActive && s.color
                  ? {
                      backgroundColor: s.bg,
                      border: `1px solid ${s.border}`,
                      color: s.color,
                      boxShadow: `0 0 10px ${s.color}35`,
                    }
                  : isActive
                  ? {
                      backgroundColor: 'var(--color-accent-bg)',
                      border: '1px solid var(--color-accent)',
                      color: 'var(--color-accent)',
                    }
                  : {
                      backgroundColor: 'rgba(21, 27, 45, 0.50)',
                      border: '1px solid rgba(255, 255, 255, 0.07)',
                      color: 'var(--color-text-muted)',
                    }
                }
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
