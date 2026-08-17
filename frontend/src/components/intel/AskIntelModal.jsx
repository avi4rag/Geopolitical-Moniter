import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, X, Send, ArrowRight, Bot, ShieldCheck, ExternalLink, RefreshCw } from 'lucide-react';
import apiClient from '../../lib/apiClient.js';
import SeverityBadge from '../common/SeverityBadge.jsx';

// ─── Ask Intel Modal ──────────────────────────────────────────────────────────
// AI-powered executive synthesis tool grounded in live geopolitical events.
// ─────────────────────────────────────────────────────────────────────────────

export default function AskIntelModal({ isOpen, onClose, onSelectEvent }) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const suggestions = [
    t('intel.suggestions.0'),
    t('intel.suggestions.1'),
    t('intel.suggestions.2'),
    t('intel.suggestions.3'),
  ];

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!query.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await apiClient.post('/events/ask', { query: query.trim() });
      setResponse(res.data);
    } catch (err) {
      setError(err.message || t('intel.error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (sug) => {
    setQuery(sug);
    setIsLoading(true);
    setError(null);
    setResponse(null);

    apiClient
      .post('/events/ask', { query: sug })
      .then((res) => setResponse(res.data))
      .catch((err) => setError(err.message || t('intel.error')))
      .finally(() => setIsLoading(false));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden"
        style={{
          backgroundColor: 'var(--color-surface-1)',
          borderColor: 'var(--color-border)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Sparkles size={15} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>{t('intel.title')}</span>
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-amber-400/10 text-amber-400 border border-amber-400/20 font-bold">
                  {t('intel.badge')}
                </span>
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            aria-label={t('eventDetail.close')}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Query Form */}
          <form onSubmit={handleSubmit} className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('intel.placeholder')}
              className="w-full pl-4 pr-12 py-3 text-xs rounded-xl border bg-slate-950 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition shadow-inner"
              style={{ borderColor: 'var(--color-border)' }}
            />
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400 disabled:opacity-40 transition cursor-pointer"
            >
              {isLoading ? <RefreshCw size={13} className="animate-spin" /> : <Send size={13} />}
            </button>
          </form>

          {/* Quick Suggestions */}
          {!response && !isLoading && (
            <div className="space-y-2">
              <span className="text-[11px] font-mono text-slate-400 uppercase">
                {t('intel.suggestedTitle')}:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {suggestions.map((sug, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestionClick(sug)}
                    className="p-2.5 rounded-xl border border-slate-800/80 bg-slate-950/60 hover:bg-slate-900 hover:border-slate-700 text-left text-xs text-slate-300 transition cursor-pointer flex items-center justify-between group"
                  >
                    <span className="line-clamp-1">{sug}</span>
                    <ArrowRight size={12} className="text-slate-500 group-hover:text-amber-400 shrink-0 ml-1" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="py-12 text-center text-slate-400 space-y-3">
              <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-mono">{t('intel.synthesizing')}</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="p-4 rounded-xl border border-rose-900/60 bg-rose-950/20 text-rose-400 text-xs">
              {error}
            </div>
          )}

          {/* Synthesized Response */}
          {response && (
            <div className="space-y-5">
              {/* Answer Card */}
              <div
                className="p-5 rounded-2xl border space-y-3"
                style={{
                  backgroundColor: 'var(--color-surface-2)',
                  borderColor: 'var(--color-border)',
                }}
              >
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400 uppercase">
                  <Bot size={14} />
                  <span>{t('intel.title')}</span>
                </div>

                <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-line font-normal">
                  {response.answer}
                </div>
              </div>

              {/* Cited Intelligence Dossiers */}
              {response.citedEvents && response.citedEvents.length > 0 && (
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold text-slate-400 font-mono uppercase flex items-center gap-1.5">
                    <ShieldCheck size={13} className="text-amber-400" />
                    {t('intel.referencedDossiers')} ({response.citedEvents.length})
                  </h4>

                  <div className="space-y-2">
                    {response.citedEvents.map((event, idx) => (
                      <div
                        key={event._id}
                        onClick={() => {
                          onClose();
                          onSelectEvent && onSelectEvent(event._id);
                        }}
                        className="p-3.5 rounded-xl border bg-slate-950/60 border-slate-800/80 hover:border-amber-500/50 hover:bg-slate-900 transition cursor-pointer flex items-center justify-between gap-3 group"
                      >
                        <div className="space-y-1 truncate">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-amber-400 font-bold">
                              [Event {idx + 1}]
                            </span>
                            <SeverityBadge severity={event.severity} size="sm" />
                            <span className="text-[10px] font-mono uppercase text-slate-400">
                              {t(`eventTypes.${event.eventType}`, { defaultValue: event.eventType?.replace(/_/g, ' ') })}
                            </span>
                          </div>
                          <p className="text-xs font-medium text-white group-hover:text-amber-300 transition-colors truncate">
                            {event.summary}
                          </p>
                        </div>

                        <span className="text-amber-400 text-xs font-semibold shrink-0 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                          <span>{t('intel.inspect')}</span>
                          <ArrowRight size={12} />
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
