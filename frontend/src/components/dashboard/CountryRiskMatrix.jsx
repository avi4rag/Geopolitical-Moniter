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
      <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4">
        <div className="h-4 w-40 bg-slate-100 rounded animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (countryStats.length === 0) return null;

  return (
    <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-5 shadow-xs">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-950 flex items-center gap-2">
            <Globe size={18} className="text-indigo-600" />
            <span>{t('analytics.countryMatrix', { defaultValue: 'Country Risk Matrix' })}</span>
          </h2>
          <p className="text-xs text-slate-500">
            {t('analytics.countryMatrixSub', { defaultValue: 'Geopolitical activity and risk density by nation' })}
          </p>
        </div>
        <span className="text-xs font-mono text-slate-400">
          {countryStats.length} Nations Tracked
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
              className={`p-4 rounded-xl border transition-all flex items-center justify-between group cursor-pointer ${
                hasCritical
                  ? 'border-rose-200 bg-rose-50/50 hover:bg-rose-50'
                  : hasHigh
                  ? 'border-amber-200 bg-amber-50/50 hover:bg-amber-50'
                  : 'border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-950 group-hover:text-indigo-600 transition-colors">
                    {stat.country}
                  </span>
                  {hasCritical && (
                    <ShieldAlert size={12} className="text-rose-600" title="Critical Events Active" />
                  )}
                  {!hasCritical && hasHigh && (
                    <AlertTriangle size={12} className="text-amber-600" title="High Severity Events Active" />
                  )}
                </div>

                <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500">
                  <span>{stat.totalEvents} events</span>
                  {hasCritical && (
                    <span className="text-rose-600 font-bold">
                      ({stat.criticalEvents} critical)
                    </span>
                  )}
                </div>
              </div>

              <div className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-400 group-hover:text-indigo-600 group-hover:border-indigo-300 transition-all">
                <ArrowUpRight size={13} />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
