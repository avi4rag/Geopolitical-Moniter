import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  TrendingDown,
  TrendingUp,
  Sparkles,
  AlertTriangle,
  Layers,
  Activity,
  ArrowRight,
} from 'lucide-react';
import apiClient from '../lib/apiClient.js';
import DirectionBadge from '../components/common/DirectionBadge.jsx';
import SeverityBadge from '../components/common/SeverityBadge.jsx';
import EventDetailModal from '../components/events/EventDetailModal.jsx';
import { translateNewsText } from '../i18n/newsContentTranslations.js';

// ─── Editorial Impacts Page ───────────────────────────────────────────────────
// Full-width macroeconomic and cross-domain impact analysis explorer.
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
  const { t, i18n } = useTranslation();
  const [impacts, setImpacts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 16, total: 0, totalPages: 1 });
  const [selectedDomain, setSelectedDomain] = useState('ALL');
  const [selectedDirection, setSelectedDirection] = useState('ALL');
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEventId, setSelectedEventId] = useState(null);

  const lang = i18n.language || 'en';

  const directionTabs = [
    { value: 'ALL', label: t('impacts.allDirections', { defaultValue: 'All Directions' }), Icon: Activity },
    { value: 'POSITIVE', label: t('impacts.positiveOpportunities', { defaultValue: 'Positive Opportunities' }), Icon: TrendingUp, color: 'text-emerald-600' },
    { value: 'RISK_DECREASE', label: t('impacts.deescalationRelief', { defaultValue: 'De-escalation & Relief' }), Icon: Sparkles, color: 'text-emerald-600' },
    { value: 'RISK_INCREASE', label: t('impacts.riskIncreases', { defaultValue: 'Risk Increases' }), Icon: AlertTriangle, color: 'text-amber-600' },
    { value: 'NEGATIVE', label: t('impacts.downsideShocks', { defaultValue: 'Downside Shocks' }), Icon: TrendingDown, color: 'text-rose-600' },
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
      setError(err.message || t('impacts.errorLoading', { defaultValue: 'Failed to load impact assessments' }));
    } finally {
      setIsLoading(false);
    }
  }, [page, selectedDomain, selectedDirection, t]);

  useEffect(() => {
    fetchImpacts();
  }, [fetchImpacts]);

  return (
    <div className="space-y-8 w-full">
      {/* Header Banner */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2">
          <div className="h-3 w-1 bg-indigo-600 rounded-full" />
          <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-indigo-700">
            {t('impacts.engineTagline', { defaultValue: 'CAUSAL TRANSMISSION ENGINE' })}
          </span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight mt-1.5 flex items-center gap-3">
          <ShieldCheck size={32} className="text-indigo-600 shrink-0" />
          <span>{t('impacts.title', { defaultValue: 'Cross-Domain Impact Explorer' })}</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">
          {t('impacts.subtitle', { defaultValue: 'Qualitative causal ripple effects across 13 strategic macroeconomic sectors.' })}
        </p>
      </div>

      {/* Direction Filter Tabs */}
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
              className={`px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-150 flex items-center gap-1.5 cursor-pointer shrink-0 ${
                isSelected
                  ? 'bg-slate-900 text-white font-bold shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon size={13} className={isSelected ? 'text-white' : tab.color || 'text-slate-500'} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Domain Category Filter Pills */}
      <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-400 mb-1">
          <Layers size={13} className="text-indigo-600" />
          <span>{t('impacts.filterDomain', { defaultValue: 'Filter by Domain:' })}</span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {DOMAIN_KEYS.map((key) => {
            const isSelected = selectedDomain === key;
            const label = t(`domains.${key}`, { defaultValue: key });
            return (
              <button
                key={key}
                onClick={() => {
                  setSelectedDomain(key);
                  setPage(1);
                }}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-indigo-600 text-white font-bold shadow-2xs'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-950 border border-slate-200'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Header Count */}
      <div className="flex items-center justify-between text-xs text-slate-500 font-mono pb-2 border-b border-slate-200">
        <span>
          {t('impacts.showingImpacts', {
            count: impacts.length,
            total: pagination.total || impacts.length,
            defaultValue: `Showing ${impacts.length} of ${pagination.total || impacts.length} impact assessments`,
          })}
        </span>
        <span>
          Page {pagination.page} of {pagination.totalPages}
        </span>
      </div>

      {/* Impact Cards Grid (2-Column Desktop, 1-Column Mobile) */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="p-6 rounded-2xl bg-white border border-slate-200 space-y-3 animate-pulse">
              <div className="h-4 bg-slate-100 rounded w-1/4" />
              <div className="h-6 bg-slate-100 rounded w-3/4" />
              <div className="h-12 bg-slate-100 rounded w-full" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="p-10 rounded-2xl border border-rose-200 bg-rose-50 text-center text-rose-700 space-y-2">
          <AlertCircle size={32} className="mx-auto text-rose-600" />
          <p className="text-xs">{error}</p>
        </div>
      ) : impacts.length === 0 ? (
        <div className="p-14 rounded-2xl border border-slate-200 bg-white text-center text-slate-500 space-y-3">
          <Layers size={40} className="mx-auto text-slate-400 mb-1" />
          <h3 className="text-base font-bold text-slate-800">
            {t('impacts.noImpactsTitle', { defaultValue: 'No Impact Assessments Found' })}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {t('impacts.noImpactsDesc', { defaultValue: 'No qualitative evaluations match your selected sector or direction filter.' })}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {impacts.map((impact) => {
            const domainLabel = t(`domains.${impact.domain}`, { defaultValue: impact.domain });
            const localizedExplanation = translateNewsText(impact.explanation, lang);
            const localizedEventSummary = impact.eventId?.summary
              ? translateNewsText(impact.eventId.summary, lang)
              : 'Related Geopolitical Event';

            const confidence = impact.confidenceScore
              ? Math.round(impact.confidenceScore * 100)
              : 88;

            return (
              <div
                key={impact._id}
                className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Top Bar: Domain Pill + Direction Badge + Severity */}
                  <div className="flex items-center justify-between gap-2 flex-wrap pb-2 border-b border-slate-100">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-md">
                      {domainLabel}
                    </span>

                    <div className="flex items-center gap-2">
                      <DirectionBadge direction={impact.direction} />
                      <SeverityBadge severity={impact.severity} size="sm" />
                    </div>
                  </div>

                  {/* Qualitative Causal Explanation */}
                  <p className="text-sm font-medium text-slate-800 leading-relaxed">
                    {localizedExplanation}
                  </p>
                </div>

                {/* Bottom Bar: Related Event Link + Confidence */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3 text-xs">
                  <span className="font-mono text-slate-400 text-[11px]">
                    {t('impacts.confidence', { defaultValue: 'Confidence' })}: <strong className="text-slate-700">{confidence}%</strong>
                  </span>

                  {impact.eventId?._id ? (
                    <button
                      onClick={() => setSelectedEventId(impact.eventId._id)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 hover:text-indigo-900 transition-colors cursor-pointer group"
                    >
                      <span className="truncate max-w-[200px] sm:max-w-[280px]">
                        {localizedEventSummary}
                      </span>
                      <ArrowRight size={13} className="shrink-0 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  ) : (
                    <span className="text-slate-400 text-[11px]">
                      {impact.ruleId ? `Rule: ${impact.ruleId}` : 'Grounded Assessment'}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-6">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="p-2 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition cursor-pointer"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-xs font-mono text-slate-500">
            {page} / {pagination.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(p + 1, pagination.totalPages))}
            disabled={page === pagination.totalPages}
            className="p-2 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition cursor-pointer"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Event Detail Inspection Modal */}
      {selectedEventId && (
        <EventDetailModal
          eventId={selectedEventId}
          onClose={() => setSelectedEventId(null)}
        />
      )}
    </div>
  );
}
