import React from 'react';
import { Search, X, Filter, SlidersHorizontal } from 'lucide-react';

// ─── Event Filter Bar ─────────────────────────────────────────────────────────
// Controls search, severity pills, event-type selector, and sort ordering.
// ─────────────────────────────────────────────────────────────────────────────

const SEVERITIES = ['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

const EVENT_TYPES = [
  { value: 'ALL', label: 'All Event Types' },
  { value: 'SANCTION', label: 'Sanctions' },
  { value: 'MILITARY_CONFLICT', label: 'Military Conflict' },
  { value: 'TRADE_RESTRICTION', label: 'Trade Restrictions' },
  { value: 'EXPORT_RESTRICTION', label: 'Export Controls' },
  { value: 'DIPLOMATIC_AGREEMENT', label: 'Diplomatic Agreements' },
  { value: 'TREATY', label: 'Treaties & Pacts' },
  { value: 'POLITICAL_CRISIS', label: 'Political Crises' },
  { value: 'RESOURCE_DISRUPTION', label: 'Resource Shocks' },
  { value: 'POLICY_CHANGE', label: 'Policy Changes' },
  { value: 'ELECTION', label: 'Elections' },
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
  return (
    <div
      className="p-4 rounded-xl border space-y-3"
      style={{
        backgroundColor: 'var(--color-surface-1)',
        borderColor: 'var(--color-border)',
      }}
    >
      {/* Top row: Search input + Event Type dropdown + Sort dropdown */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search events, countries, entities, summaries..."
            className="w-full pl-9 pr-8 py-2 text-xs rounded-lg border bg-slate-950 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
            style={{ borderColor: 'var(--color-border)' }}
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Event Type Selector */}
        <div className="flex items-center gap-2">
          <select
            value={eventType}
            onChange={(e) => onEventTypeChange(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border bg-slate-950 text-slate-200 border-slate-700 focus:border-amber-500 focus:outline-none cursor-pointer"
          >
            {EVENT_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>

          {/* Sort By Selector */}
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border bg-slate-950 text-slate-200 border-slate-700 focus:border-amber-500 focus:outline-none cursor-pointer"
          >
            <option value="createdAt">Most Recent</option>
            <option value="credibilityScore">Highest Credibility</option>
          </select>

          {/* Reset Filters button */}
          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="px-2.5 py-2 text-xs rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer flex items-center gap-1 shrink-0"
              title="Reset all filters"
            >
              <X size={13} />
              <span className="hidden md:inline">Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Bottom row: Severity Quick Filter Pills */}
      <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-slate-800/80">
        <span className="text-[11px] font-semibold text-slate-400 mr-1 flex items-center gap-1">
          <SlidersHorizontal size={11} />
          Severity:
        </span>
        {SEVERITIES.map((sev) => {
          const isSelected = severity === sev;
          return (
            <button
              key={sev}
              onClick={() => onSeverityChange(sev)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer ${
                isSelected
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {sev}
            </button>
          );
        })}
      </div>
    </div>
  );
}
