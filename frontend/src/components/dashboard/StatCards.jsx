import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, AlertOctagon, TrendingUp, Newspaper, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';
import apiClient from '../../lib/apiClient.js';

// ─── Stat Cards & Sync Controller ─────────────────────────────────────────────
// Displays top-level KPI metrics and provides a 1-click full pipeline trigger.
// ─────────────────────────────────────────────────────────────────────────────

export default function StatCards({ stats, onRefresh }) {
  const { t } = useTranslation();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);

  const totals = stats?.totals || {
    events: 0,
    articles: 0,
    activeImpacts: 0,
    sources: 0,
  };

  const highCriticalCount =
    (stats?.breakdowns?.bySeverity?.CRITICAL || 0) +
    (stats?.breakdowns?.bySeverity?.HIGH || 0);

  const handleSyncNow = async () => {
    try {
      setIsSyncing(true);
      setSyncStatus(null);

      const response = await apiClient.post(
        '/admin/pipeline/run',
        {
          extractBatchSize: 10,
          impactBatchSize: 50,
        },
        {
          timeout: 180_000,
        }
      );

      if (response.success) {
        const stored = response.data?.stages?.ingestion?.totalStored || 0;
        const analyzed = response.data?.stages?.extraction?.analyzed || 0;
        const impacts = response.data?.stages?.impact?.assessmentsCreated || 0;

        setSyncStatus({
          type: 'success',
          message: `Pipeline synced: ${stored} stored, ${analyzed} analyzed, ${impacts} impacts evaluated.`,
        });
        if (onRefresh) onRefresh();
      } else {
        setSyncStatus({
          type: 'error',
          message: response.data?.message || 'Sync completed with warnings.',
        });
      }
    } catch (err) {
      setSyncStatus({
        type: 'error',
        message: err.message || 'Sync request failed.',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const cards = [
    {
      title: t('analytics.statTotal', { defaultValue: 'Total Events' }),
      value: totals.events,
      sub: `${totals.articles} articles ingested`,
      Icon: Globe,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
    },
    {
      title: t('analytics.statCritical', { defaultValue: 'High / Critical Alerts' }),
      value: highCriticalCount,
      sub: `${stats?.breakdowns?.bySeverity?.CRITICAL || 0} critical severity`,
      Icon: AlertOctagon,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
    },
    {
      title: t('analytics.statDomains', { defaultValue: 'Active Impacts' }),
      value: totals.activeImpacts,
      sub: 'evaluated ripple effects',
      Icon: TrendingUp,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      title: t('sources.title', { defaultValue: 'Monitored Sources' }),
      value: totals.sources,
      sub: 'live wire feeds',
      Icon: Newspaper,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
  ];

  return (
    <div className="space-y-4">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const { Icon } = card;
          return (
            <div
              key={card.title}
              className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs transition-all flex items-start justify-between"
            >
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-500 font-mono">
                  {card.title}
                </span>
                <div className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                  {card.value}
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  {card.sub}
                </span>
              </div>
              <div className={`p-2.5 rounded-xl ${card.bg} ${card.color} shrink-0`}>
                <Icon size={20} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Sync Pipeline Bar */}
      <div className="p-4 rounded-2xl border border-slate-200 bg-white flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-900 font-mono">
              REAL-TIME INGESTION & IMPACT PIPELINE
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Triggers multi-source RSS harvester, entity extractor, and causal assessment models.
          </p>
        </div>

        <button
          onClick={handleSyncNow}
          disabled={isSyncing}
          className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all cursor-pointer shadow-xs disabled:opacity-50"
        >
          <RefreshCw size={13} className={isSyncing ? 'animate-spin text-indigo-400' : ''} />
          <span>{isSyncing ? 'Syncing Pipeline...' : 'Run Pipeline Sync'}</span>
        </button>
      </div>

      {syncStatus && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center gap-2.5 border ${
            syncStatus.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {syncStatus.type === 'success' ? (
            <CheckCircle size={16} className="text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle size={16} className="text-rose-600 shrink-0" />
          )}
          <span className="font-medium">{syncStatus.message}</span>
        </div>
      )}
    </div>
  );
}
