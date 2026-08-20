import React from 'react';
import { useTranslation } from 'react-i18next';
import { Search, X, SlidersHorizontal, Layers } from 'lucide-react';

// ─── Clean Editorial Feed Filters ─────────────────────────────────────────────
// Sticky category and severity filter toolbar with light theme styling.
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
    <section className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3 sticky top-16 sm:top-20 z-30">
      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 mr-1 hidden sm:flex items-center gap-1 shrink-0">
          <Layers size={12} className="text-slate-500" />
          <span>TOPICS:</span>
        </span>

        {DOMAIN_KEYS.map((key) => {
          const isSelected = domain === key;
          const label = t(`domains.${key}`, { defaultValue: key });
          return (
            <button
              key={key}
              onClick={() => onDomainChange(key)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer shrink-0 ${
                isSelected
                  ? 'bg-slate-900 text-white font-bold shadow-xs scale-[1.02]'
                  : 'bg-slate-100/90 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Sub-Bar: Search + Severity Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search
            size={13}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t('filters.searchPlaceholder', { defaultValue: 'Search events, countries, leaders...' })}
            className="w-full pl-9 pr-8 py-2 text-xs rounded-full border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-400 transition"
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer p-0.5"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Severity Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <span className="text-[11px] font-medium text-slate-500 mr-1 flex items-center gap-1 shrink-0">
            <SlidersHorizontal size={11} className="text-slate-400" />
            <span className="hidden md:inline">{t('filters.severityLabel', { defaultValue: 'Severity:' })}</span>
          </span>

          {SEVERITIES.map((sev) => {
            const isSelected = severity === sev;
            const sevLabel = sev === 'ALL'
              ? t('filters.all', { defaultValue: 'All' })
              : t(`badges.severity.${sev}`, { defaultValue: sev });

            return (
              <button
                key={sev}
                onClick={() => onSeverityChange(sev)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-slate-900 text-white font-bold'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                {sevLabel}
              </button>
            );
          })}

          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="px-2.5 py-1 text-xs rounded-full border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 transition cursor-pointer flex items-center gap-1 ml-1 shrink-0"
              title="Reset all filters"
            >
              <X size={11} />
              <span>{t('filters.reset', { defaultValue: 'Reset' })}</span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
