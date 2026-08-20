import React from 'react';
import { useTranslation } from 'react-i18next';
import { Search, X, SlidersHorizontal, Layers } from 'lucide-react';

// ─── Editorial Feed Filters ───────────────────────────────────────────────────
// Clean, sticky category selector & severity filter toolbar.
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
    <section
      className="p-3.5 sm:p-4 rounded-2xl border border-slate-800/90 bg-slate-950/80 backdrop-blur-md shadow-xl space-y-3 sticky top-16 sm:top-18 z-30 transition-all"
    >
      {/* Category Pills Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 mr-1 hidden sm:flex items-center gap-1 shrink-0">
          <Layers size={11} className="text-amber-400" />
          <span>TOPICS:</span>
        </span>

        {DOMAIN_KEYS.map((key) => {
          const isSelected = domain === key;
          const label = t(`domains.${key}`, { defaultValue: key });
          return (
            <button
              key={key}
              onClick={() => onDomainChange(key)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer shrink-0 ${
                isSelected
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-500/20 scale-[1.02]'
                  : 'bg-slate-900/80 text-slate-300 border border-slate-800 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Sub-Bar: Search + Severity Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2.5 border-t border-slate-800/70">
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
            placeholder={t('filters.searchPlaceholder')}
            className="w-full pl-9 pr-8 py-1.5 text-xs rounded-full border border-slate-800 bg-slate-900/90 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/80 transition"
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer p-0.5"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Severity Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <span className="text-[11px] font-mono font-medium text-slate-400 mr-1 flex items-center gap-1 shrink-0">
            <SlidersHorizontal size={11} className="text-amber-400" />
            <span className="hidden md:inline">{t('filters.severityLabel')}</span>
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
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                    : 'bg-slate-900/80 text-slate-400 border border-slate-800 hover:text-white hover:bg-slate-800'
                }`}
              >
                {sevLabel}
              </button>
            );
          })}

          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="px-2.5 py-1 text-xs rounded-full border border-rose-800/60 bg-rose-950/40 text-rose-300 hover:bg-rose-900/60 transition cursor-pointer flex items-center gap-1 ml-1 shrink-0"
              title="Reset all filters"
            >
              <X size={11} />
              <span>{t('filters.reset')}</span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
