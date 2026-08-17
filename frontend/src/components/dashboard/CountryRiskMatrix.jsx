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
        className="p-6 rounded-2xl border space-y-4"
        style={{
          backgroundColor: 'var(--color-surface-1)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div className="h-4 w-40 bg-slate-800 rounded animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 bg-slate-900 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (countryStats.length === 0) return null;

  return (
    <div
      className="p-6 rounded-2xl border space-y-5 shadow-lg"
      style={{
        backgroundColor: 'var(--color-surface-1)',
        borderColor: 'var(--color-border)',
      }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Globe size={18} className="text-amber-400" />
            <span>{t('analytics.countryRiskTitle')}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {t('analytics.countryRiskSubtitle')}
          </p>
        </div>
        <span className="text-[11px] font-mono text-slate-500">
          {t('analytics.topNations', { count: countryStats.length })}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
        {countryStats.map((item) => {
          const { country, eventCount, severityBreakdown } = item;

          return (
            <Link
              key={country}
              to={`/search?country=${encodeURIComponent(country)}`}
              className="p-4 rounded-xl border bg-slate-950/60 border-slate-800/80 hover:border-amber-500/50 hover:bg-slate-900/60 transition group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors flex items-center gap-1.5">
                    <span>{country}</span>
                    <ArrowUpRight size={13} className="text-slate-500 group-hover:text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>

                  <span className="text-xs font-mono font-bold text-slate-200 px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                    {t('analytics.eventCount', { count: eventCount })}
                  </span>
                </div>

                {/* Severity Pills */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  {severityBreakdown?.critical > 0 && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 flex items-center gap-1">
                      <ShieldAlert size={10} /> {severityBreakdown.critical} {t('badges.severity.CRITICAL')}
                    </span>
                  )}
                  {severityBreakdown?.high > 0 && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 flex items-center gap-1">
                      <AlertTriangle size={10} /> {severityBreakdown.high} {t('badges.severity.HIGH')}
                    </span>
                  )}
                  {severityBreakdown?.medium > 0 && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
                      {severityBreakdown.medium} {t('badges.severity.MEDIUM')}
                    </span>
                  )}
                  {severityBreakdown?.low > 0 && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      {severityBreakdown.low} {t('badges.severity.LOW')}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
