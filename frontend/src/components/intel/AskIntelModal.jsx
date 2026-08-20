import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, X, Send, ArrowRight, Bot, ShieldCheck, RefreshCw } from 'lucide-react';
import apiClient from '../../lib/apiClient.js';
import SeverityBadge from '../common/SeverityBadge.jsx';
import { translateNewsText } from '../../i18n/newsContentTranslations.js';

// ─── Editorial Ask Intel Modal ────────────────────────────────────────────────
// AI-powered executive synthesis tool grounded in live geopolitical events.
// ─────────────────────────────────────────────────────────────────────────────

export default function AskIntelModal({ isOpen, onClose, onSelectEvent }) {
  const { t, i18n } = useTranslation();
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const lang = i18n.language || 'en';

  const suggestions = [
    t('intel.suggestions.0', { defaultValue: 'What are the latest energy & oil market risks?' }),
    t('intel.suggestions.1', { defaultValue: 'Summarize recent diplomatic agreements & trade accords' }),
    t('intel.suggestions.2', { defaultValue: 'What are the key military conflict developments in Eastern Europe?' }),
    t('intel.suggestions.3', { defaultValue: 'Are there any positive economic de-escalation opportunities?' }),
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
      setError(err.message || t('intel.error', { defaultValue: 'Failed to synthesize intelligence inquiry' }));
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
      .catch((err) => setError(err.message || t('intel.error', { defaultValue: 'Failed to synthesize intelligence inquiry' })))
      .finally(() => setIsLoading(false));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700">
              <Sparkles size={16} />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-950 flex items-center gap-2">
                <span>{t('intel.title', { defaultValue: 'Ask GeoMonitor Intelligence' })}</span>
                <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-bold">
                  {t('intel.badge', { defaultValue: 'AI ASSISTANT' })}
                </span>
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
            aria-label={t('eventDetail.close', { defaultValue: 'Close' })}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Query Form */}
          <form onSubmit={handleSubmit} className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('intel.placeholder', { defaultValue: 'Ask about geopolitical risks, commodities, trade pacts...' })}
              className="w-full pl-4 pr-12 py-3 text-xs sm:text-sm rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-400 transition shadow-inner"
            />
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-40 transition cursor-pointer"
            >
              {isLoading ? <RefreshCw size={13} className="animate-spin" /> : <Send size={13} />}
            </button>
          </form>

          {/* Quick Suggestions */}
          {!response && !isLoading && (
            <div className="space-y-2">
              <span className="text-[11px] font-mono font-bold text-slate-400 uppercase">
                {t('intel.suggestedTitle', { defaultValue: 'Suggested Inquiries' })}:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {suggestions.map((sug, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestionClick(sug)}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50/50 hover:border-indigo-200 text-left text-xs text-slate-700 hover:text-slate-950 transition cursor-pointer flex items-center justify-between group"
                  >
                    <span className="line-clamp-2 leading-relaxed">{sug}</span>
                    <ArrowRight size={12} className="text-slate-400 group-hover:text-indigo-600 shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="py-12 text-center text-slate-500 space-y-3">
              <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-mono">{t('intel.synthesizing', { defaultValue: 'Synthesizing intelligence inquiry...' })}</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="p-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-xs">
              {error}
            </div>
          )}

          {/* Synthesized Response */}
          {response && (
            <div className="space-y-5">
              {/* Answer Card */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/80 space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-indigo-700">
                  <Bot size={15} />
                  <span>SYNTHESIZED INTELLIGENCE ASSESSMENT</span>
                </div>
                <div className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                  {response.answer}
                </div>
              </div>

              {/* Grounded Event Sources */}
              {response.referencedEvents && response.referencedEvents.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-400 uppercase">
                    <ShieldCheck size={14} className="text-emerald-600" />
                    <span>{t('intel.referencedDossiers', { defaultValue: 'Referenced Intelligence Dossiers' })}</span>
                  </div>

                  <div className="space-y-2">
                    {response.referencedEvents.map((ev) => (
                      <div
                        key={ev._id}
                        className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <SeverityBadge severity={ev.severity} size="sm" />
                            <span className="text-slate-400 font-mono text-[10px]">
                              {ev.createdAt ? new Date(ev.createdAt).toLocaleDateString() : ''}
                            </span>
                          </div>
                          <p className="font-semibold text-slate-900 truncate">
                            {translateNewsText(ev.summary, lang)}
                          </p>
                        </div>

                        <button
                          onClick={() => {
                            onClose();
                            if (onSelectEvent) onSelectEvent(ev._id);
                          }}
                          className="px-3 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shrink-0 cursor-pointer transition"
                        >
                          {t('intel.inspect', { defaultValue: 'Inspect' })}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span>{t('intel.groundedNotice', { defaultValue: 'Responses are synthesized from live, verified event dossiers.' })}</span>
          <span>GeoMonitor AI v2.4</span>
        </div>
      </div>
    </div>
  );
}
