import React from 'react';
import { useTranslation } from 'react-i18next';
import { Search, X, SlidersHorizontal } from 'lucide-react';

// ─── Feed Filters ──────────────────────────────────────────────────────────────
// Sticky, mobile-responsive topic and severity filter toolbar.
// ─────────────────────────────────────────────────────────────────────────────

const DOMAIN_KEYS = [
  'ALL',
  'ENERGY',
  'TRADE',
  'TECHNOLOGY',
  'DEFENSE',
  'FOOD_AGRICULTURE',
  'DIPLOMACY',
  'FINANCIAL_MARKETS',
];

const SEVERITIES = ['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

export default function FeedFilters({
  search,
  onSearchChange,
  domain,
  onDomainChange,
  severity,
  onSeverityChange,
  onReset,
  hasActiveFilters,
}) {
  const { t } = useTranslation();

  return (
    <div
      className="p-3 sm:p-4 rounded-2xl border space-y-2.5 sticky top-14 sm:top-16 z-30 shadow-lg backdrop-blur-md"
      style={{
        backgroundColor: 'color-mix(in srgb, var(--color-surface-1) 95%, transparent)',
        borderColor: 'var(--color-border)',
      }}
    >
      {/* Top Bar: Topic Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        {DOMAIN_KEYS.map((key) => {
          const isSelected = domain === key;
          const label = t(`domains.${key}`, { defaultValue: key });
          return (
            <button
              key={key}
              onClick={() => onDomainChange(key)}
              className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-semibold whitespace-nowrap transition cursor-pointer shrink-0 ${
                isSelected
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-md'
                  : 'bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Bottom Bar: Search + Severity Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t('filters.searchPlaceholder')}
            className="w-full pl-8 pr-7 py-1.5 text-xs rounded-xl border bg-slate-950 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
            style={{ borderColor: 'var(--color-border)' }}
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer p-0.5"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Severity Pills */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
          <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 mr-1 flex items-center gap-1 shrink-0">
            <SlidersHorizontal size={10} />
            <span className="hidden sm:inline">{t('filters.severityLabel')}</span>
          </span>
          {SEVERITIES.map((sev) => {
            const isSelected = severity === sev;
            const sevLabel = sev === 'ALL'
              ? t('filters.all')
              : t(`badges.severity.${sev}`, { defaultValue: sev });

            return (
              <button
                key={sev}
                onClick={() => onSeverityChange(sev)}
                className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-[10px] sm:text-[11px] font-medium transition cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                {sevLabel}
              </button>
            );
          })}

          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="px-1.5 py-0.5 text-[10px] sm:text-[11px] rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer flex items-center gap-0.5 ml-1 shrink-0"
            >
              <X size={10} />
              {t('filters.reset')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
