import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
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

const DOMAIN_KEYS = [
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

export default function ImpactsPage() {
  const { t } = useTranslation();
  const [impacts, setImpacts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 16, total: 0, totalPages: 1 });
  const [selectedDomain, setSelectedDomain] = useState('ALL');
  const [selectedDirection, setSelectedDirection] = useState('ALL');
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEventId, setSelectedEventId] = useState(null);

  const directionTabs = [
    { value: 'ALL', label: t('impacts.allDirections'), Icon: Activity },
    { value: 'POSITIVE', label: t('impacts.positiveOpportunities'), Icon: TrendingUp, color: 'text-emerald-400' },
    { value: 'RISK_DECREASE', label: t('impacts.deescalationRelief'), Icon: Sparkles, color: 'text-emerald-400' },
    { value: 'RISK_INCREASE', label: t('impacts.riskIncreases'), Icon: AlertTriangle, color: 'text-amber-400' },
    { value: 'NEGATIVE', label: t('impacts.downsideShocks'), Icon: TrendingDown, color: 'text-rose-400' },
  ];

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
      setError(err.message || t('impacts.errorLoading'));
    } finally {
      setIsLoading(false);
    }
  }, [page, selectedDomain, selectedDirection, t]);

  useEffect(() => {
    fetchImpacts();
  }, [fetchImpacts]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-amber-400">
          {t('impacts.engineTagline')}
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1 flex items-center gap-2.5">
          <ShieldCheck size={28} className="text-amber-400 shrink-0" />
          <span>{t('impacts.title')}</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1 max-w-2xl">
          {t('impacts.subtitle')}
        </p>
      </div>

      {/* Direction Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {directionTabs.map((tab) => {
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
            {t('impacts.filterDomain')}:
          </span>
          <select
            value={selectedDomain}
            onChange={(e) => {
              setSelectedDomain(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1.5 text-xs rounded-lg border bg-slate-950 text-slate-200 border-slate-700 focus:border-amber-500 focus:outline-none cursor-pointer font-medium"
          >
            {DOMAIN_KEYS.map((d) => (
              <option key={d} value={d}>
                {d === 'ALL' ? t('impacts.all13Domains') : t(`domains.${d}`, { defaultValue: d.replace(/_/g, ' ') })}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs text-slate-400 font-mono">
          {t('impacts.showingEvaluations', { count: impacts.length, total: pagination.total })}
        </div>
      </div>

      {/* Grid of Impact Cards */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 space-y-3">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-mono">{t('impacts.evaluating')}</p>
        </div>
      ) : error ? (
        <div className="p-8 rounded-2xl border border-rose-900/60 bg-rose-950/20 text-center text-rose-400">
          <AlertCircle size={32} className="mx-auto mb-2 text-rose-400" />
          <p className="text-xs">{error}</p>
        </div>
      ) : impacts.length === 0 ? (
        <div className="p-12 rounded-2xl border border-slate-800 bg-slate-900/20 text-center text-slate-400 text-xs">
          {t('impacts.noEvaluationsFound')}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {impacts.map((impact) => {
            const domainLabel = t(`domains.${impact.domain}`, { defaultValue: impact.domain });
            return (
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
                      {domainLabel}
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
                    <span>{t('analytics.confidence')}: <strong className="text-emerald-400">{Math.round(impact.confidenceScore * 100)}%</strong></span>
                    <span>{t('eventDetail.rule', { ruleId: impact.ruleId })}</span>
                  </div>

                  {impact.eventId && (
                    <div className="text-[11px] text-slate-400 flex items-center justify-between truncate pt-1">
                      <span className="truncate text-slate-300 group-hover:text-amber-300 transition-colors">
                        {impact.eventId.summary || t('impacts.viewAssociatedDossier')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
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
            <span>{t('analytics.previous')}</span>
          </button>

          <span className="text-xs text-slate-400 font-mono">
            {t('analytics.pageOf', { page: pagination.page, totalPages: pagination.totalPages })}
          </span>

          <button
            onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
            disabled={!pagination.hasNextPage}
            className="inline-flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-semibold border border-slate-700 bg-slate-900 text-slate-300 hover:text-white disabled:opacity-40 cursor-pointer"
          >
            <span>{t('analytics.next')}</span>
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
