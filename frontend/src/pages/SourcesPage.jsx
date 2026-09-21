import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Newspaper, CheckCircle2, AlertCircle, ExternalLink, Globe } from 'lucide-react';
import apiClient from '../lib/apiClient.js';

export default function SourcesPage() {
  const { t } = useTranslation();
  const [sources, setSources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiClient.get('/sources')
      .then((res) => setSources(res.data || []))
      .catch((err) => setError(err.message || t('sources.errorLoading', { defaultValue: 'Failed to load sources' })))
      .finally(() => setIsLoading(false));
  }, [t]);

  return (
    <div className="space-y-8 w-full">
      {/* Header */}
      <div className="border-b border-slate-800/80 pb-5">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="h-3 w-1 rounded-full bg-cyan-400" />
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-cyan-400">
            INGESTION & CREDIBILITY DIRECTORY
          </span>
        </div>
        <h1 className="font-headline text-2xl sm:text-4xl font-bold flex items-center gap-3 mt-1 text-slate-100">
          <Newspaper size={30} className="text-cyan-400 shrink-0" />
          {t('sources.title', { defaultValue: 'Monitored Wire Sources' })}
        </h1>
        <p className="text-xs sm:text-sm mt-1 max-w-3xl text-slate-400 font-sans leading-relaxed">
          {t('sources.subtitle', { defaultValue: 'Multi-source news harvesters, accredited agency feeds, and deterministic reliability ratings.' })}
        </p>
      </div>

      {isLoading ? (
        <div className="py-20 flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-mono text-slate-400">{t('sources.loading', { defaultValue: 'Loading sources directory...' })}</p>
        </div>
      ) : error ? (
        <div className="glass-panel p-8 rounded-2xl text-center space-y-3">
          <AlertCircle size={32} className="mx-auto text-rose-400" />
          <p className="text-xs font-mono text-slate-300">{error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sources.map((source) => {
            const reliabilityPct = Math.round((source.reliabilityScore || 0.85) * 100);
            return (
              <div
                key={source._id}
                className="glass-card hover-lift p-5 rounded-2xl flex flex-col justify-between border transition-all duration-200 group"
                style={{
                  backgroundColor: 'rgba(11, 16, 32, 0.70)',
                  borderColor: 'rgba(255, 255, 255, 0.08)',
                }}
              >
                <div>
                  {/* Name + ACTIVE badge */}
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold font-headline flex items-center gap-2 text-slate-100 group-hover:text-cyan-300 transition-colors">
                      <Globe size={15} className="text-cyan-400 shrink-0" />
                      <span>{source.name}</span>
                    </h3>
                    <span
                      className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full flex items-center gap-1.5 bg-emerald-950/60 border border-emerald-500/30 text-emerald-300"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      ACTIVE
                    </span>
                  </div>

                  <p className="text-[11px] font-mono text-cyan-400/80 mb-4">{source.domain}</p>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-mono">{t('sources.sourceType', { defaultValue: 'Type' })}:</span>
                      <span className="font-mono font-semibold text-slate-200">
                        {source.type ? source.type.replace(/_/g, ' ') : 'RSS Wire'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-mono">{t('sources.reliabilityScore', { defaultValue: 'Reliability' })}:</span>
                      <span className="font-mono font-bold text-emerald-400">{reliabilityPct}%</span>
                    </div>
                    {/* Reliability bar */}
                    <div className="w-full h-1.5 rounded-full overflow-hidden bg-slate-800/80">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400"
                        style={{ width: `${reliabilityPct}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
                  <span className="font-mono text-[10px] text-slate-500">Continuous Ingestion</span>
                  <a
                    href={`https://${source.domain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono font-bold text-xs text-cyan-400 hover:text-cyan-200 inline-flex items-center gap-1 transition-colors"
                  >
                    <span>{t('sources.visitWebsite', { defaultValue: 'Visit Wire' })}</span>
                    <ExternalLink size={12} />
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
