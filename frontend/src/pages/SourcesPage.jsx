import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Newspaper, CheckCircle2, AlertCircle, ExternalLink, Globe } from 'lucide-react';
import apiClient from '../lib/apiClient.js';

// ─── Full-Width Sources Directory ─────────────────────────────────────────────
// News providers and wire sources credibility directory.
// ─────────────────────────────────────────────────────────────────────────────

export default function SourcesPage() {
  const { t } = useTranslation();
  const [sources, setSources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiClient
      .get('/sources')
      .then((res) => {
        setSources(res.data || []);
      })
      .catch((err) => {
        setError(err.message || t('sources.errorLoading', { defaultValue: 'Failed to load sources' }));
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [t]);

  return (
    <div className="space-y-8 w-full">
      {/* Header Banner */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2">
          <div className="h-3 w-1 bg-indigo-600 rounded-full" />
          <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-indigo-700">
            INGESTION DIRECTORY
          </span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight mt-1.5 flex items-center gap-3">
          <Newspaper size={32} className="text-indigo-600 shrink-0" />
          <span>{t('sources.title', { defaultValue: 'Monitored Wire Sources' })}</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">
          {t('sources.subtitle', { defaultValue: 'Multi-source news harvesters and reliability ratings.' })}
        </p>
      </div>

      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 space-y-3">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500">{t('sources.loading', { defaultValue: 'Loading sources directory...' })}</p>
        </div>
      ) : error ? (
        <div className="p-8 rounded-2xl border border-rose-200 bg-rose-50 text-center text-rose-700">
          <AlertCircle size={32} className="mx-auto mb-2 text-rose-600" />
          <p className="text-xs">{error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sources.map((source) => {
            const reliabilityPercent = Math.round((source.reliabilityScore || 0.85) * 100);

            return (
              <div
                key={source._id}
                className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-base font-bold text-slate-950 flex items-center gap-2">
                      <Globe size={16} className="text-indigo-600" />
                      {source.name}
                    </h3>
                    <span className="text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 size={10} />
                      {t('sources.activeFeed', { defaultValue: 'ACTIVE' })}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 font-mono mb-4">
                    {source.domain}
                  </p>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-slate-500">{t('sources.sourceType', { defaultValue: 'Source Type' })}:</span>
                      <span className="font-semibold text-slate-800">
                        {source.type ? source.type.replace(/_/g, ' ') : 'RSS Wire'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-slate-500">{t('sources.reliabilityScore', { defaultValue: 'Reliability Score' })}:</span>
                      <span className="font-mono font-bold text-slate-900">
                        {reliabilityPercent}%
                      </span>
                    </div>

                    {/* Score Bar */}
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full transition-all"
                        style={{ width: `${reliabilityPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="font-mono text-[11px]">{t('sources.apiIntegration', { defaultValue: 'Live Stream' })}</span>
                  <a
                    href={`https://${source.domain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-700 hover:text-indigo-900 font-semibold inline-flex items-center gap-1"
                  >
                    <span>{t('sources.visitWebsite', { defaultValue: 'Visit Wire' })}</span>
                    <ExternalLink size={11} />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
