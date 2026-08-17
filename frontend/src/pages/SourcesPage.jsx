import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Newspaper, ShieldCheck, CheckCircle2, AlertCircle, ExternalLink, Globe } from 'lucide-react';
import apiClient from '../lib/apiClient.js';

// ─── Sources Page ─────────────────────────────────────────────────────────────
// News providers and source credibility transparency directory.
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
        setError(err.message || t('sources.errorLoading'));
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [t]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Newspaper size={20} className="text-amber-400" />
          <span>{t('sources.title')}</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          {t('sources.subtitle')}
        </p>
      </div>

      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 space-y-3">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs">{t('sources.loading')}</p>
        </div>
      ) : error ? (
        <div className="p-8 rounded-xl border border-rose-900/60 bg-rose-950/20 text-center text-rose-400">
          <AlertCircle size={32} className="mx-auto mb-2" />
          <p className="text-xs">{error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sources.map((source) => {
            const reliabilityPercent = Math.round((source.reliabilityScore || 0.5) * 100);

            return (
              <div
                key={source._id}
                className="p-5 rounded-xl border flex flex-col justify-between"
                style={{
                  backgroundColor: 'var(--color-surface-1)',
                  borderColor: 'var(--color-border)',
                }}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Globe size={16} className="text-amber-400" />
                      {source.name}
                    </h3>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-800/60 flex items-center gap-1">
                      <CheckCircle2 size={10} />
                      {t('sources.activeFeed')}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 font-mono mb-3">
                    {source.domain}
                  </p>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-500">{t('sources.sourceType')}:</span>
                      <span className="font-medium text-slate-200">
                        {source.type?.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-500">{t('sources.reliabilityScore')}:</span>
                      <span className="font-mono font-bold text-amber-400">
                        {reliabilityPercent}% ({source.reliabilityScore})
                      </span>
                    </div>

                    {/* Score Bar */}
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-400 h-full rounded-full transition-all"
                        style={{ width: `${reliabilityPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                  <span>{t('sources.apiIntegration')}</span>
                  <a
                    href={`https://${source.domain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-400 hover:underline inline-flex items-center gap-1"
                  >
                    {t('sources.visitWebsite')}
                    <ExternalLink size={10} />
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
