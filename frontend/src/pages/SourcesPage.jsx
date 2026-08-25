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
      <div className="border-b pb-5" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center gap-2 mb-1">
          <div className="h-3 w-1 rounded-full" style={{ backgroundColor: 'var(--color-accent)' }} />
          <span className="text-[10px] font-mono-code font-bold uppercase tracking-widest" style={{ color: 'var(--color-accent)' }}>INGESTION DIRECTORY</span>
        </div>
        <h1 className="font-headline text-2xl sm:text-4xl font-bold flex items-center gap-3 mt-1" style={{ color: 'var(--color-text-primary)' }}>
          <Newspaper size={28} style={{ color: 'var(--color-accent)', flexShrink: 0 }} />
          {t('sources.title', { defaultValue: 'Monitored Wire Sources' })}
        </h1>
        <p className="text-xs sm:text-sm mt-1 max-w-3xl" style={{ color: 'var(--color-text-muted)' }}>
          {t('sources.subtitle', { defaultValue: 'Multi-source news harvesters and reliability ratings.' })}
        </p>
      </div>

      {isLoading ? (
        <div className="py-20 flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--color-accent) transparent transparent transparent' }} />
          <p className="text-xs font-mono-code" style={{ color: 'var(--color-text-dim)' }}>{t('sources.loading', { defaultValue: 'Loading sources directory...' })}</p>
        </div>
      ) : error ? (
        <div className="p-8 rounded-lg border text-center space-y-3" style={{ backgroundColor: 'var(--color-surface-1)', borderColor: 'var(--color-border)' }}>
          <AlertCircle size={28} style={{ color: 'var(--color-critical)', margin: '0 auto' }} />
          <p className="text-xs font-mono-code" style={{ color: 'var(--color-text-muted)' }}>{error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sources.map((source) => {
            const reliabilityPct = Math.round((source.reliabilityScore || 0.85) * 100);
            return (
              <div
                key={source._id}
                className="p-5 rounded-lg border flex flex-col justify-between transition-colors"
                style={{ backgroundColor: 'var(--color-surface-2)', borderColor: 'var(--color-border)' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-accent-border)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; }}
              >
                <div>
                  {/* Name + ACTIVE badge */}
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-bold font-headline flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
                      <Globe size={14} style={{ color: 'var(--color-accent)' }} />
                      {source.name}
                    </h3>
                    <span
                      className="text-[9px] font-mono-code font-bold uppercase px-2 py-0.5 rounded flex items-center gap-1"
                      style={{ backgroundColor: 'rgba(16,185,129,0.10)', border: '1px solid rgba(16,185,129,0.25)', color: '#10b981' }}
                    >
                      <CheckCircle2 size={9} /> ACTIVE
                    </span>
                  </div>

                  <p className="text-[10px] font-mono-code mb-4" style={{ color: 'var(--color-text-dim)' }}>{source.domain}</p>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span style={{ color: 'var(--color-text-dim)' }}>{t('sources.sourceType', { defaultValue: 'Type' })}:</span>
                      <span className="font-mono-code font-semibold" style={{ color: 'var(--color-text-muted)' }}>
                        {source.type ? source.type.replace(/_/g, ' ') : 'RSS Wire'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span style={{ color: 'var(--color-text-dim)' }}>{t('sources.reliabilityScore', { defaultValue: 'Reliability' })}:</span>
                      <span className="font-mono-code font-bold" style={{ color: 'var(--color-stable)' }}>{reliabilityPct}%</span>
                    </div>
                    {/* Reliability bar */}
                    <div className="w-full h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-surface-4)' }}>
                      <div className="h-full rounded-full" style={{ width: `${reliabilityPct}%`, backgroundColor: 'var(--color-stable)' }} />
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t flex items-center justify-between text-xs" style={{ borderColor: 'var(--color-border-subtle)' }}>
                  <span className="font-mono-code text-[10px]" style={{ color: 'var(--color-text-dim)' }}>Live Stream</span>
                  <a
                    href={`https://${source.domain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono-code font-bold inline-flex items-center gap-1 transition-colors"
                    style={{ color: 'var(--color-accent)' }}
                  >
                    {t('sources.visitWebsite', { defaultValue: 'Visit Wire' })}
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
