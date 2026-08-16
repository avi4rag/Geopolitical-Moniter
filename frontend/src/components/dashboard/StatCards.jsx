import React, { useState } from 'react';
import { Globe, AlertOctagon, TrendingUp, Newspaper, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';
import apiClient from '../../lib/apiClient.js';

// ─── Stat Cards & Sync Controller ─────────────────────────────────────────────
// Displays top-level KPI metrics and provides a 1-click full pipeline trigger.
// ─────────────────────────────────────────────────────────────────────────────

export default function StatCards({ stats, onRefresh }) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null); // { type: 'success' | 'error', message: string }

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
          timeout: 180_000, // 3 minutes for full cycle
        }
      );

      if (response.success) {
        const stored = response.data?.stages?.ingestion?.totalStored || 0;
        const analyzed = response.data?.stages?.extraction?.analyzed || 0;
        const impacts = response.data?.stages?.impact?.assessmentsCreated || 0;

        setSyncStatus({
          type: 'success',
          message: `Cycle complete: ${stored} ingested, ${analyzed} extracted, ${impacts} impacts assessed`,
        });
        if (onRefresh) onRefresh();
      } else {
        setSyncStatus({
          type: 'error',
          message: response.data?.message || 'Pipeline execution completed with warnings',
        });
      }
    } catch (err) {
      setSyncStatus({
        type: 'error',
        message: err.message || 'Failed to trigger intelligence cycle',
      });
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncStatus(null), 8000);
    }
  };

  return (
    <div className="space-y-4">
      {/* ── Metric Cards Grid ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Events */}
        <div
          className="p-5 rounded-xl border transition-all duration-200"
          style={{
            backgroundColor: 'var(--color-surface-1)',
            borderColor: 'var(--color-border)',
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Tracked Events
            </span>
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}
            >
              <Globe size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-white font-mono">
              {totals.events}
            </span>
            {highCriticalCount > 0 && (
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.15)',
                  color: '#f87171',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                }}
              >
                {highCriticalCount} High / Critical
              </span>
            )}
          </div>
          <p className="mt-1.5 text-xs text-slate-400">
            Real-time geopolitical intelligence
          </p>
        </div>

        {/* Card 2: Cross-Domain Impacts */}
        <div
          className="p-5 rounded-xl border transition-all duration-200"
          style={{
            backgroundColor: 'var(--color-surface-1)',
            borderColor: 'var(--color-border)',
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Domain Assessments
            </span>
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}
            >
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-white font-mono">
              {totals.activeImpacts}
            </span>
            <span className="text-xs text-emerald-400">Active Rules</span>
          </div>
          <p className="mt-1.5 text-xs text-slate-400">
            Cross-sector impact evaluations
          </p>
        </div>

        {/* Card 3: Articles Analyzed */}
        <div
          className="p-5 rounded-xl border transition-all duration-200"
          style={{
            backgroundColor: 'var(--color-surface-1)',
            borderColor: 'var(--color-border)',
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Ingested Articles
            </span>
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: 'rgba(168, 85, 247, 0.15)', color: '#c084fc' }}
            >
              <Newspaper size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-white font-mono">
              {totals.articles}
            </span>
            <span className="text-xs text-slate-400">Deduplicated</span>
          </div>
          <p className="mt-1.5 text-xs text-slate-400">
            From Guardian & NewsAPI feeds
          </p>
        </div>

        {/* Card 4: Intelligence Pipeline & Sync Button */}
        <div
          className="p-5 rounded-xl border flex flex-col justify-between"
          style={{
            backgroundColor: 'var(--color-surface-1)',
            borderColor: 'var(--color-border)',
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Intelligence Cycle
            </span>
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: 'rgba(34, 197, 94, 0.15)', color: '#4ade80' }}
            >
              <AlertOctagon size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between gap-2">
            <button
              onClick={handleSyncNow}
              disabled={isSyncing}
              className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                backgroundColor: 'var(--color-accent)',
                color: '#000',
              }}
            >
              <RefreshCw size={13} className={isSyncing ? 'animate-spin' : ''} />
              {isSyncing ? 'Running Cycle...' : 'Run Pipeline Sync'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Status Toast / Banner ────────────────────────────────────────────── */}
      {syncStatus && (
        <div
          className={`p-3 rounded-lg border text-xs flex items-center gap-2 transition-all ${
            syncStatus.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
              : 'bg-rose-950/40 border-rose-800/60 text-rose-300'
          }`}
        >
          {syncStatus.type === 'success' ? (
            <CheckCircle size={14} className="shrink-0 text-emerald-400" />
          ) : (
            <AlertTriangle size={14} className="shrink-0 text-rose-400" />
          )}
          <span>{syncStatus.message}</span>
        </div>
      )}
    </div>
  );
}
