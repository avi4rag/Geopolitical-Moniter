import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, AlertTriangle, ShieldAlert, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import apiClient from '../../lib/apiClient.js';

// ─── Country Risk Matrix ──────────────────────────────────────────────────────
// Interactive breakdown of geopolitical event frequency and severity by country.
// ─────────────────────────────────────────────────────────────────────────────

export default function CountryRiskMatrix() {
  const { t } = useTranslation();
  const [countryStats, setCountryStats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    apiClient
      .get('/stats/countries')
      .then((res) => {
        if (isMounted) setCountryStats(res.data || []);
      })
      .catch((err) => console.error('Failed to load country risk stats:', err))
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div
        className="glass-panel p-6 rounded-xl border space-y-4"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <div className="h-4 w-40 bg-[var(--color-surface-4)] rounded animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 bg-[var(--color-surface-2)] rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (countryStats.length === 0) return null;

  return (
    <div
      className="glass-panel p-6 rounded-xl border space-y-5 shadow-lg"
      style={{ borderColor: 'var(--color-border)' }}
    >
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-2.5 w-1 rounded-full" style={{ backgroundColor: 'var(--color-accent)' }} />
            <span className="text-[10px] font-mono-code font-bold uppercase tracking-widest text-[var(--color-accent)]">
              GEOPOLITICAL THEATER EXPOSURE
            </span>
          </div>
          <h2 className="text-base font-bold font-headline text-[var(--color-text-primary)] flex items-center gap-2">
            <Globe size={18} style={{ color: 'var(--color-accent)' }} />
            <span>{t('analytics.countryMatrix', { defaultValue: 'Country Risk Density Matrix' })}</span>
          </h2>
          <p className="text-xs font-mono-code text-[var(--color-text-dim)]">
            {t('analytics.countryMatrixSub', { defaultValue: 'Geopolitical activity and threat concentration by nation' })}
          </p>
        </div>
        <span className="text-xs font-mono-code px-2.5 py-1 rounded-md border text-[var(--color-text-secondary)]" style={{ backgroundColor: 'var(--color-surface-2)', borderColor: 'var(--color-border-subtle)' }}>
          {countryStats.length} Sovereign Entities Tracked
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {countryStats.slice(0, 8).map((stat) => {
          const hasCritical = (stat.criticalEvents || 0) > 0;
          const hasHigh = (stat.highEvents || 0) > 0;

          return (
            <Link
              key={stat.country}
              to={`/search?country=${encodeURIComponent(stat.country)}`}
              className="glass-card hover-lift p-4 rounded-xl border transition-all duration-200 flex items-center justify-between group cursor-pointer relative overflow-hidden"
              style={
                hasCritical
                  ? {
                      borderColor: 'rgba(244, 63, 94, 0.35)',
                      backgroundColor: 'rgba(244, 63, 94, 0.08)',
                    }
                  : hasHigh
                  ? {
                      borderColor: 'rgba(245, 158, 11, 0.30)',
                      backgroundColor: 'rgba(245, 158, 11, 0.06)',
                    }
                  : {
                      borderColor: 'rgba(255, 255, 255, 0.08)',
                      backgroundColor: 'rgba(11, 16, 32, 0.70)',
                    }
              }
            >
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-mono-code font-bold text-[var(--color-text-primary)] group-hover:text-white transition-colors">
                    {stat.country}
                  </span>
                  {hasCritical && (
                    <ShieldAlert size={13} className="text-rose-400" title="Critical Events Active" />
                  )}
                  {!hasCritical && hasHigh && (
                    <AlertTriangle size={13} className="text-amber-400" title="High Severity Events Active" />
                  )}
                </div>

                <div className="flex items-center gap-2 text-[11px] font-mono-code text-[var(--color-text-dim)]">
                  <span>{stat.totalEvents} dispatches</span>
                  {hasCritical && (
                    <span className="text-rose-400 font-bold">
                      ({stat.criticalEvents} critical)
                    </span>
                  )}
                </div>
              </div>

              <div
                className="p-1.5 rounded-lg border text-[var(--color-text-dim)] group-hover:text-white group-hover:border-[var(--color-accent)] transition-all"
                style={{
                  backgroundColor: 'var(--color-surface-4)',
                  borderColor: 'rgba(255, 255, 255, 0.08)',
                }}
              >
                <ArrowUpRight size={13} />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
