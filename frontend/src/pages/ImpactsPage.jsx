import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  Filter,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  TrendingDown,
  TrendingUp,
  Sparkles,
  AlertTriangle,
  Layers,
  Activity,
} from 'lucide-react';
import apiClient from '../lib/apiClient.js';
import DirectionBadge from '../components/common/DirectionBadge.jsx';
import SeverityBadge from '../components/common/SeverityBadge.jsx';
import EventDetailModal from '../components/events/EventDetailModal.jsx';

// ─── Impacts Page ─────────────────────────────────────────────────────────────
// Cross-domain qualitative impact assessments view with positive opportunities
// and downside risk exploration tabs.
// ─────────────────────────────────────────────────────────────────────────────

const DOMAINS = [
  'ALL',
  'ENERGY',
  'OIL_AND_GAS',
  'TRADE',
  'SUPPLY_CHAIN',
  'CURRENCY',
  'INFLATION',
  'DEFENSE',
  'TECHNOLOGY',
  'SEMICONDUCTORS',
  'FOOD_AGRICULTURE',
  'DIPLOMACY',
  'GLOBAL_STABILITY',
  'FINANCIAL_MARKETS',
];

const DIRECTION_TABS = [
  { value: 'ALL', label: 'All Directions', Icon: Activity },
  { value: 'POSITIVE', label: 'Positive & Opportunities', Icon: TrendingUp, color: 'text-emerald-400' },
  { value: 'RISK_DECREASE', label: 'De-escalation & Relief', Icon: Sparkles, color: 'text-emerald-400' },
  { value: 'RISK_INCREASE', label: 'Risk Increases', Icon: AlertTriangle, color: 'text-amber-400' },
  { value: 'NEGATIVE', label: 'Downside Shocks', Icon: TrendingDown, color: 'text-rose-400' },
];

export default function ImpactsPage() {
  const [impacts, setImpacts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 16, total: 0, totalPages: 1 });
  const [selectedDomain, setSelectedDomain] = useState('ALL');
  const [selectedDirection, setSelectedDirection] = useState('ALL');
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEventId, setSelectedEventId] = useState(null);

  const fetchImpacts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = { page, limit: 16 };
      if (selectedDomain !== 'ALL') params.domain = selectedDomain;
      if (selectedDirection !== 'ALL') params.direction = selectedDirection;

      const res = await apiClient.get('/impacts', { params });
      setImpacts(res.data || []);
      if (res.pagination) setPagination(res.pagination);
    } catch (err) {
      setError(err.message || 'Failed to fetch impact assessments');
    } finally {
      setIsLoading(false);
    }
  }, [page, selectedDomain, selectedDirection]);

  useEffect(() => {
    fetchImpacts();
  }, [fetchImpacts]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-amber-400">
          Macroeconomic & Geopolitical Impact Engine
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1 flex items-center gap-2.5">
          <ShieldCheck size={28} className="text-amber-400 shrink-0" />
          <span>Cross-Domain Impact Radar</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1 max-w-2xl">
          Comprehensive multi-domain impact evaluations covering upside opportunities, trade agreements, commodity price shifts, supply chain security, and downside risks.
        </p>
      </div>

      {/* Direction Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {DIRECTION_TABS.map((tab) => {
          const isSelected = selectedDirection === tab.value;
          const { Icon } = tab;
          return (
            <button
              key={tab.value}
              onClick={() => {
                setSelectedDirection(tab.value);
                setPage(1);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-md'
                  : 'bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon size={14} className={isSelected ? 'text-slate-950' : tab.color || 'text-slate-400'} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Domain Filter Bar */}
      <div
        className="p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-3 shadow-md"
        style={{
          backgroundColor: 'var(--color-surface-1)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
            <Layers size={13} />
            Filter Domain:
          </span>
          <select
            value={selectedDomain}
            onChange={(e) => {
              setSelectedDomain(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1.5 text-xs rounded-lg border bg-slate-950 text-slate-200 border-slate-700 focus:border-amber-500 focus:outline-none cursor-pointer font-medium"
          >
            {DOMAINS.map((d) => (
              <option key={d} value={d}>
                {d === 'ALL' ? 'All 13 Domains' : d.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs text-slate-400 font-mono">
          Showing <strong className="text-white">{impacts.length}</strong> of{' '}
          <strong className="text-white">{pagination.total}</strong> evaluations
        </div>
      </div>

      {/* Grid of Impact Cards */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 space-y-3">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-mono">Evaluating cross-domain causal matrices...</p>
        </div>
      ) : error ? (
        <div className="p-8 rounded-2xl border border-rose-900/60 bg-rose-950/20 text-center text-rose-400">
          <AlertCircle size={32} className="mx-auto mb-2 text-rose-400" />
          <p className="text-xs">{error}</p>
        </div>
      ) : impacts.length === 0 ? (
        <div className="p-12 rounded-2xl border border-slate-800 bg-slate-900/20 text-center text-slate-400 text-xs">
          No impact evaluations found for the selected direction/domain. Try selecting "All Directions".
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {impacts.map((impact) => (
            <div
              key={impact._id}
              onClick={() => impact.eventId && setSelectedEventId(impact.eventId._id || impact.eventId)}
              className="p-5 rounded-2xl border transition-all duration-200 hover:border-slate-600 hover:shadow-xl cursor-pointer flex flex-col justify-between group"
              style={{
                backgroundColor: 'var(--color-surface-1)',
                borderColor: 'var(--color-border)',
              }}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/40 border border-amber-800/60 px-2.5 py-0.5 rounded">
                    {impact.domain}
                  </span>
                  <div className="flex items-center gap-2">
                    <DirectionBadge direction={impact.direction} size="sm" />
                    <SeverityBadge severity={impact.severity} size="sm" />
                  </div>
                </div>

                <p className="text-xs text-slate-200 leading-relaxed font-medium mb-3">
                  {impact.explanation}
                </p>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>Confidence: <strong className="text-emerald-400">{Math.round(impact.confidenceScore * 100)}%</strong></span>
                  <span>Rule: {impact.ruleId}</span>
                </div>

                {impact.eventId && (
                  <div className="text-[11px] text-slate-400 flex items-center justify-between truncate pt-1">
                    <span className="truncate text-slate-300 group-hover:text-amber-300 transition-colors">
                      {impact.eventId.summary || 'View associated event dossier →'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="pt-4 flex items-center justify-between border-t border-slate-800">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={!pagination.hasPrevPage}
            className="inline-flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-semibold border border-slate-700 bg-slate-900 text-slate-300 hover:text-white disabled:opacity-40 cursor-pointer"
          >
            <ChevronLeft size={14} />
            <span>Previous</span>
          </button>

          <span className="text-xs text-slate-400 font-mono">
            Page {pagination.page} of {pagination.totalPages}
          </span>

          <button
            onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
            disabled={!pagination.hasNextPage}
            className="inline-flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-semibold border border-slate-700 bg-slate-900 text-slate-300 hover:text-white disabled:opacity-40 cursor-pointer"
          >
            <span>Next</span>
            <ChevronRight size={14} />
          </button>
        </div>
      )}

      {/* Modal Inspection */}
      {selectedEventId && (
        <EventDetailModal
          eventId={selectedEventId}
          onClose={() => setSelectedEventId(null)}
        />
      )}
    </div>
  );
}
