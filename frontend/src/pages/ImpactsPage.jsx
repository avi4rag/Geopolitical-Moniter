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
      <div className="border-b pb-5" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center gap-2 mb-1">
          <div className="h-3 w-1 rounded-full" style={{ backgroundColor: 'var(--color-accent)' }} />
          <span className="text-[10px] font-mono-code font-bold uppercase tracking-widest" style={{ color: 'var(--color-accent)' }}>
            CAUSAL TRANSMISSION ENGINE
          </span>
        </div>
        <h1 className="font-headline text-2xl sm:text-4xl font-bold flex items-center gap-3 mt-1" style={{ color: 'var(--color-text-primary)' }}>
          <ShieldCheck size={28} style={{ color: 'var(--color-accent)', flexShrink: 0 }} />
          {t('impacts.title', { defaultValue: 'Systemic Impact Matrix' })}
        </h1>
        <p className="text-xs sm:text-sm mt-1 max-w-3xl leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
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
              className="flex items-center gap-1.5 px-3 py-2 rounded text-xs font-mono-code font-bold uppercase tracking-wide whitespace-nowrap cursor-pointer transition-colors flex-shrink-0"
              style={isActive
                ? { backgroundColor: 'var(--color-accent-bg)', border: '1px solid var(--color-accent-border)', color: 'var(--color-accent)' }
                : { backgroundColor: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text-dim)' }
              }
            >
              <Icon size={12} />
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
              className="px-2.5 py-1 rounded text-[10px] font-mono-code font-bold uppercase tracking-wide cursor-pointer transition-colors"
              style={isActive
                ? { backgroundColor: 'var(--color-accent-bg)', border: '1px solid var(--color-accent-border)', color: 'var(--color-accent)' }
                : { backgroundColor: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text-dim)' }
              }
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
              className="rounded-lg p-5 space-y-3 border animate-pulse"
              style={{ backgroundColor: 'var(--color-surface-2)', borderColor: 'var(--color-border)' }}
            >
              <div className="h-3 rounded w-1/3" style={{ backgroundColor: 'var(--color-surface-4)' }} />
              <div className="h-4 rounded w-full" style={{ backgroundColor: 'var(--color-surface-4)' }} />
              <div className="h-4 rounded w-3/4" style={{ backgroundColor: 'var(--color-surface-4)' }} />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="p-10 rounded-lg border text-center space-y-3" style={{ backgroundColor: 'var(--color-surface-1)', borderColor: 'var(--color-border)' }}>
          <AlertCircle size={28} style={{ color: 'var(--color-critical)', margin: '0 auto' }} />
          <p className="text-sm font-mono-code" style={{ color: 'var(--color-text-muted)' }}>{error}</p>
          <button
            onClick={fetchImpacts}
            className="px-4 py-2 rounded text-xs font-mono-code font-bold cursor-pointer"
            style={{ backgroundColor: 'var(--color-surface-4)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}
          >
            Retry
          </button>
        </div>
      ) : impacts.length === 0 ? (
        <div className="p-14 rounded-lg border text-center space-y-2" style={{ backgroundColor: 'var(--color-surface-1)', borderColor: 'var(--color-border)' }}>
          <Layers size={28} style={{ color: 'var(--color-text-dim)', margin: '0 auto' }} />
          <p className="text-sm font-mono-code" style={{ color: 'var(--color-text-muted)' }}>
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
                className="rounded-lg border p-5 space-y-3 transition-colors"
                style={{ backgroundColor: 'var(--color-surface-2)', borderColor: 'var(--color-border)' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-accent-border)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; }}
              >
                {/* Card header */}
                <div className="flex items-center justify-between gap-2 pb-2 border-b" style={{ borderColor: 'var(--color-border-subtle)' }}>
                  <span
                    className="text-[10px] font-mono-code font-bold uppercase tracking-wider px-2 py-0.5 rounded"
                    style={{ backgroundColor: 'var(--color-accent-bg)', border: '1px solid var(--color-accent-border)', color: 'var(--color-accent)' }}
                  >
                    {domainLabel}
                  </span>
                  <div className="flex items-center gap-2">
                    <DirectionBadge direction={impact.direction} />
                    <SeverityBadge severity={impact.severity} />
                  </div>
                </div>

                {/* Explanation */}
                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                  {explanation}
                </p>

                {/* Confidence bar */}
                <div>
                  <div className="flex justify-between text-[9px] font-mono-code mb-1" style={{ color: 'var(--color-text-dim)' }}>
                    <span>CONFIDENCE</span>
                    <span>{confidencePct}%</span>
                  </div>
                  <div className="w-full h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-surface-4)' }}>
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${confidencePct}%`, backgroundColor: 'var(--color-accent)' }}
                    />
                  </div>
                </div>

                {/* Event link */}
                {impact.eventId?._id && (
                  <button
                    onClick={() => navigate(`/event/${impact.eventId._id}`)}
                    className="text-[10px] font-mono-code font-bold cursor-pointer transition-colors"
                    style={{ color: 'var(--color-accent)' }}
                  >
                    → View Source Event
                  </button>
                )}
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
            className="flex items-center gap-1.5 px-4 py-2 rounded text-xs font-mono-code font-bold cursor-pointer disabled:opacity-40 transition-colors"
            style={{ backgroundColor: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}
          >
            <ChevronLeft size={14} />
            Previous
          </button>
          <span className="text-xs font-mono-code" style={{ color: 'var(--color-text-dim)' }}>
            {page} / {pagination.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
            disabled={page === pagination.totalPages}
            className="flex items-center gap-1.5 px-4 py-2 rounded text-xs font-mono-code font-bold cursor-pointer disabled:opacity-40 transition-colors"
            style={{ backgroundColor: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}
          >
            Next
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
