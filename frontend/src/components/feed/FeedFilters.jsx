import React from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';

// ─── Feed Filters ──────────────────────────────────────────────────────────────
// Sticky, compact topic navigation bar.
// ─────────────────────────────────────────────────────────────────────────────

const DOMAINS = [
  { value: 'ALL', label: 'All Intelligence' },
  { value: 'ENERGY', label: 'Energy Security' },
  { value: 'TRADE', label: 'Trade & Tariffs' },
  { value: 'TECHNOLOGY', label: 'Tech & Chips' },
  { value: 'DEFENSE', label: 'Defense' },
  { value: 'FOOD_AGRICULTURE', label: 'Food & Ag' },
  { value: 'DIPLOMACY', label: 'Diplomacy' },
  { value: 'FINANCIAL_MARKETS', label: 'Markets & FX' },
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
  return (
    <div
      className="p-4 rounded-2xl border space-y-3 sticky top-16 z-30 shadow-md backdrop-blur-md"
      style={{
        backgroundColor: 'color-mix(in srgb, var(--color-surface-1) 95%, transparent)',
        borderColor: 'var(--color-border)',
      }}
    >
      {/* Top Bar: Topic Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {DOMAINS.map((item) => {
          const isSelected = domain === item.value;
          return (
            <button
              key={item.value}
              onClick={() => onDomainChange(item.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                isSelected
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-md'
                  : 'bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Bottom Bar: Search + Severity Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search news events, countries, leaders..."
            className="w-full pl-9 pr-8 py-1.5 text-xs rounded-xl border bg-slate-950 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
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

        {/* Severity Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
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
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                {sev}
              </button>
            );
          })}

          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="px-2 py-1 text-[11px] rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer flex items-center gap-1 ml-1"
            >
              <X size={11} />
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
