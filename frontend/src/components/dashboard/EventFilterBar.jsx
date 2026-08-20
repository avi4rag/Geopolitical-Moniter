import React from 'react';
import { useTranslation } from 'react-i18next';
import { Search, X, SlidersHorizontal } from 'lucide-react';

// ─── Event Filter Bar ─────────────────────────────────────────────────────────
// Controls search, severity pills, event-type selector, and sort ordering.
// ─────────────────────────────────────────────────────────────────────────────

const SEVERITIES = ['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

const EVENT_TYPE_KEYS = [
  'ALL',
  'SANCTION',
  'MILITARY_CONFLICT',
  'TRADE_RESTRICTION',
  'EXPORT_RESTRICTION',
  'DIPLOMATIC_AGREEMENT',
  'TREATY',
  'POLITICAL_CRISIS',
  'RESOURCE_DISRUPTION',
  'POLICY_CHANGE',
  'ELECTION',
];

export default function EventFilterBar({
  search,
  onSearchChange,
  severity,
  onSeverityChange,
  eventType,
  onEventTypeChange,
  sortBy,
  onSortByChange,
  onResetFilters,
  hasActiveFilters,
}) {
  const { t } = useTranslation();

  return (
    <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3 shadow-xs">
      {/* Top row: Search input + Event Type dropdown + Sort dropdown */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search
            size={14}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t('search.searchPlaceholder', { defaultValue: 'Search events, countries, entities...' })}
            className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-400 transition"
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer p-0.5"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Event Type selector */}
        <div className="w-full sm:w-48">
          <select
            value={eventType}
            onChange={(e) => onEventTypeChange(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-indigo-400 transition cursor-pointer"
          >
            {EVENT_TYPE_KEYS.map((key) => (
              <option key={key} value={key}>
                {key === 'ALL'
                  ? t('filters.allEventTypes', { defaultValue: 'All Event Classifications' })
                  : t(`eventTypes.${key}`, { defaultValue: key.replace(/_/g, ' ') })}
              </option>
            ))}
          </select>
        </div>

        {/* Sort by selector */}
        <div className="w-full sm:w-44">
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-indigo-400 transition cursor-pointer"
          >
            <option value="createdAt">{t('analytics.mostRecent', { defaultValue: 'Most Recent' })}</option>
            <option value="credibilityScore">{t('analytics.highestCredibility', { defaultValue: 'Highest Credibility' })}</option>
          </select>
        </div>
      </div>

      {/* Bottom row: Severity filter pills + Reset button */}
      <div className="flex items-center justify-between gap-2 flex-wrap pt-2 border-t border-slate-100">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <span className="text-[11px] font-medium text-slate-500 mr-1 flex items-center gap-1 shrink-0">
            <SlidersHorizontal size={11} className="text-slate-400" />
            <span>{t('filters.severityLabel', { defaultValue: 'Severity:' })}</span>
          </span>

          {SEVERITIES.map((sev) => {
            const isSelected = severity === sev;
            const sevLabel =
              sev === 'ALL'
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
        </div>

        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="px-3 py-1 text-xs rounded-full border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 transition cursor-pointer flex items-center gap-1"
          >
            <X size={11} />
            <span>{t('filters.clearFilters', { defaultValue: 'Clear Filters' })}</span>
          </button>
        )}
      </div>
    </div>
  );
}
