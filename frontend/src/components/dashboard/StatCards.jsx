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
      color: '#c3c0ff',
      bg: 'rgba(195, 192, 255, 0.12)',
      border: 'rgba(195, 192, 255, 0.25)',
    },
    {
      title: t('analytics.statCritical', { defaultValue: 'High / Critical Alerts' }),
      value: highCriticalCount,
      sub: `${stats?.breakdowns?.bySeverity?.CRITICAL || 0} critical severity`,
      Icon: AlertOctagon,
      color: '#f43f5e',
      bg: 'rgba(244, 63, 94, 0.12)',
      border: 'rgba(244, 63, 94, 0.25)',
    },
    {
      title: t('analytics.statDomains', { defaultValue: 'Active Impacts' }),
      value: totals.activeImpacts,
      sub: 'evaluated ripple effects',
      Icon: TrendingUp,
      color: '#f59e0b',
      bg: 'rgba(245, 158, 11, 0.12)',
      border: 'rgba(245, 158, 11, 0.25)',
    },
    {
      title: t('sources.title', { defaultValue: 'Monitored Sources' }),
      value: totals.sources,
      sub: 'live wire feeds',
      Icon: Newspaper,
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.12)',
      border: 'rgba(16, 185, 129, 0.25)',
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
              className="glass-card p-5 rounded-xl border flex items-start justify-between relative overflow-hidden"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <div className="space-y-1.5">
                <span className="text-xs font-mono-code font-bold uppercase tracking-wider text-[var(--color-text-dim)]">
                  {card.title}
                </span>
                <div className="text-3xl font-headline font-bold text-[var(--color-text-primary)] tracking-tight">
                  {card.value.toLocaleString()}
                </div>
                <span className="text-[11px] font-mono-code text-[var(--color-text-muted)]">
                  {card.sub}
                </span>
              </div>
              <div
                className="p-3 rounded-xl shrink-0 border"
                style={{
                  backgroundColor: card.bg,
                  borderColor: card.border,
                  color: card.color,
                }}
              >
                <Icon size={20} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Sync Pipeline Bar */}
      <div
        className="glass-panel p-4 rounded-xl border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 shadow-md"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-[var(--color-text-primary)] font-mono-code tracking-wider uppercase">
              REAL-TIME INGESTION & IMPACT PIPELINE
            </span>
          </div>
          <p className="text-xs font-mono-code text-[var(--color-text-dim)]">
            Triggers multi-source RSS harvester, entity extractor, and causal assessment models.
          </p>
        </div>

        <button
          onClick={handleSyncNow}
          disabled={isSyncing}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-xs font-mono-code font-bold transition-all duration-200 cursor-pointer disabled:opacity-50"
          style={{
            backgroundColor: 'var(--color-accent)',
            color: '#020617',
          }}
        >
          <RefreshCw size={13} className={isSyncing ? 'animate-spin' : ''} />
          <span>{isSyncing ? 'Syncing Pipeline...' : 'Run Pipeline Sync'}</span>
        </button>
      </div>

      {syncStatus && (
        <div
          className="p-4 rounded-xl text-xs font-mono-code flex items-center gap-2.5 border"
          style={
            syncStatus.type === 'success'
              ? {
                  backgroundColor: 'rgba(16, 185, 129, 0.10)',
                  borderColor: 'rgba(16, 185, 129, 0.30)',
                  color: '#34d399',
                }
              : {
                  backgroundColor: 'rgba(244, 63, 94, 0.10)',
                  borderColor: 'rgba(244, 63, 94, 0.30)',
                  color: '#f43f5e',
                }
          }
        >
          {syncStatus.type === 'success' ? (
            <CheckCircle size={16} className="text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle size={16} className="text-rose-400 shrink-0" />
          )}
          <span className="font-semibold">{syncStatus.message}</span>
        </div>
      )}
    </div>
  );
}
