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
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../lib/apiClient.js';
import DirectionBadge from '../components/common/DirectionBadge.jsx';
import SeverityBadge from '../components/common/SeverityBadge.jsx';
import { translateNewsText } from '../i18n/newsContentTranslations.js';

// ─── Systemic Impact Matrix Page ──────────────────────────────────────────────
// Dark Situation Room reskin of the impact explorer.
// Real data only — no fabricated metrics.
// Closes issue #10: Fix Domain Impact panel.
// ─────────────────────────────────────────────────────────────────────────────

const DOMAIN_KEYS = [
  'ALL', 'ENERGY', 'OIL_AND_GAS', 'TRADE', 'SUPPLY_CHAIN', 'CURRENCY', 'INFLATION',
  'DEFENSE', 'TECHNOLOGY', 'SEMICONDUCTORS', 'FOOD_AGRICULTURE', 'DIPLOMACY',
  'GLOBAL_STABILITY', 'FINANCIAL_MARKETS',
];

export default function ImpactsPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [impacts, setImpacts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 16, total: 0, totalPages: 1 });
  const [selectedDomain, setSelectedDomain] = useState('ALL');
  const [selectedDirection, setSelectedDirection] = useState('ALL');
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const lang = i18n.language || 'en';

  const directionTabs = [
    { value: 'ALL', label: 'All', Icon: Activity },
    { value: 'POSITIVE', label: 'Positive', Icon: TrendingUp },
    { value: 'RISK_DECREASE', label: 'De-escalation', Icon: Sparkles },
    { value: 'RISK_INCREASE', label: 'Risk Increase', Icon: AlertTriangle },
    { value: 'NEGATIVE', label: 'Negative', Icon: TrendingDown },
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

  useEffect(() => { fetchImpacts(); }, [fetchImpacts]);

  return (
    <div className="space-y-8 w-full">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="border-b border-slate-800/80 pb-5">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="h-3 w-1 rounded-full bg-cyan-400" />
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-cyan-400">
            CAUSAL TRANSMISSION ENGINE
          </span>
        </div>
        <h1 className="font-headline text-2xl sm:text-4xl font-bold flex items-center gap-3 mt-1 text-slate-100">
          <ShieldCheck size={30} className="text-cyan-400 shrink-0" />
          {t('impacts.title', { defaultValue: 'Systemic Impact Matrix' })}
        </h1>
        <p className="text-xs sm:text-sm mt-1 max-w-3xl leading-relaxed text-slate-400 font-sans">
          {t('impacts.subtitle', { defaultValue: 'Qualitative causal ripple effects across 13 strategic macroeconomic and geopolitical sectors.' })}
        </p>
      </div>

      {/* ── Direction Tabs ────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {directionTabs.map(({ value, label, Icon }) => {
          const isActive = selectedDirection === value;
          return (
            <button
              key={value}
              onClick={() => { setSelectedDirection(value); setPage(1); }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wide whitespace-nowrap cursor-pointer transition-all duration-150 shrink-0 ${
                isActive
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                  : 'glass-control text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon size={12} className={isActive ? 'text-cyan-400' : 'text-slate-500'} />
              {label}
            </button>
          );
        })}
      </div>

      {/* ── Domain Filter Pills ───────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-1.5">
        {DOMAIN_KEYS.map((d) => {
          const isActive = selectedDomain === d;
          const label = d === 'ALL' ? 'All Domains' : t(`domains.${d}`, { defaultValue: d.replace(/_/g, ' ') });
          return (
            <button
              key={d}
              onClick={() => { setSelectedDomain(d); setPage(1); }}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wide cursor-pointer transition-all duration-150 ${
                isActive
                  ? 'bg-cyan-500/25 text-cyan-200 border border-cyan-400/40 shadow-[0_0_10px_rgba(6,182,212,0.25)]'
                  : 'glass-control text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* ── Content Area ─────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="glass-panel rounded-2xl p-5 space-y-3 animate-pulse"
            >
              <div className="h-3 rounded w-1/3 bg-slate-800/80" />
              <div className="h-4 rounded w-full bg-slate-800/80" />
              <div className="h-4 rounded w-3/4 bg-slate-800/80" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="glass-panel p-10 rounded-2xl text-center space-y-3">
          <AlertCircle size={32} className="mx-auto text-rose-400" />
          <p className="text-sm font-mono text-slate-300">{error}</p>
          <button
            onClick={fetchImpacts}
            className="px-4 py-2 rounded-xl text-xs font-mono font-bold cursor-pointer glass-control text-slate-200 hover:text-white transition"
          >
            Retry
          </button>
        </div>
      ) : impacts.length === 0 ? (
        <div className="glass-panel p-14 rounded-2xl text-center space-y-2">
          <Layers size={32} className="mx-auto text-slate-500" />
          <p className="text-sm font-mono text-slate-400">
            {t('impacts.noImpactsFound', { defaultValue: 'No impacts found for the selected filters.' })}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {impacts.map((impact) => {
            const domainLabel = t(`domains.${impact.domain}`, { defaultValue: impact.domain?.replace(/_/g, ' ') || 'DOMAIN' });
            const explanation = translateNewsText(impact.explanation, lang);
            const confidencePct = Math.round((impact.confidenceScore || 0) * 100);
            return (
              <div
                key={impact._id}
                className="glass-card hover-lift rounded-2xl p-5 space-y-3 transition-all duration-200 border flex flex-col justify-between"
                style={{
                  backgroundColor: 'rgba(11, 16, 32, 0.70)',
                  borderColor: 'rgba(255, 255, 255, 0.08)',
                }}
              >
                <div className="space-y-3">
                  {/* Card header */}
                  <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-800/60">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30 text-cyan-300">
                      {domainLabel}
                    </span>
                    <div className="flex items-center gap-2">
                      <DirectionBadge direction={impact.direction} />
                      <SeverityBadge severity={impact.severity} />
                    </div>
                  </div>

                  {/* Explanation */}
                  <p className="text-sm leading-relaxed text-slate-200 font-sans">
                    {explanation}
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  {/* Confidence bar */}
                  <div>
                    <div className="flex justify-between text-[10px] font-mono mb-1 text-slate-400">
                      <span>VERIFICATION CONFIDENCE</span>
                      <span className="text-cyan-300 font-bold">{confidencePct}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full overflow-hidden bg-slate-800/80">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400"
                        style={{ width: `${confidencePct}%` }}
                      />
                    </div>
                  </div>

                  {/* Event link */}
                  {impact.eventId?._id && (
                    <button
                      onClick={() => navigate(`/event/${impact.eventId._id}`)}
                      className="text-[11px] font-mono font-bold cursor-pointer text-cyan-400 hover:text-cyan-200 transition-colors flex items-center gap-1 pt-1"
                    >
                      <span>→ View Corroborated Source Event</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Pagination ────────────────────────────────────────────────────── */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-mono font-bold cursor-pointer disabled:opacity-40 transition-colors glass-control text-slate-300 hover:text-white"
          >
            <ChevronLeft size={14} />
            Previous
          </button>
          <span className="text-xs font-mono text-slate-400">
            {page} / {pagination.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
            disabled={page === pagination.totalPages}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-mono font-bold cursor-pointer disabled:opacity-40 transition-colors glass-control text-slate-300 hover:text-white"
          >
            Next
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
