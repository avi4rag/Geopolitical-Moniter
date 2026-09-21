import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, X, Send, ArrowRight, Bot, ShieldCheck, RefreshCw } from 'lucide-react';
import apiClient from '../../lib/apiClient.js';
import SeverityBadge from '../common/SeverityBadge.jsx';
import { translateNewsText } from '../../i18n/newsContentTranslations.js';

// ─── Ask Intel Modal — Situation Room Dark Theme ──────────────────────────────
// AI synthesis tool. All logic preserved; only visual classes replaced.
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
    setIsLoading(true); setError(null); setResponse(null);
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
    setQuery(sug); setIsLoading(true); setError(null); setResponse(null);
    apiClient.post('/events/ask', { query: sug })
      .then((res) => setResponse(res.data))
      .catch((err) => setError(err.message || t('intel.error', { defaultValue: 'Failed to synthesize intelligence inquiry' })))
      .finally(() => setIsLoading(false));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 backdrop-blur-xl bg-slate-950/80 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl overflow-hidden glass-panel border border-slate-700/60 shadow-2xl shadow-cyan-950/20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-700/60 flex items-center justify-between shrink-0 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-sm shadow-cyan-500/20">
              <Sparkles size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold font-mono-code flex items-center gap-2.5 text-slate-100 tracking-wide">
                {t('intel.title', { defaultValue: 'Ask GeoMonitor Intelligence' })}
                <span className="text-[9px] font-mono-code uppercase px-2 py-0.5 rounded-full font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 tracking-widest">
                  {t('intel.badge', { defaultValue: 'AI ASSISTANT' })}
                </span>
              </h2>
              <p className="text-[10px] font-mono-code text-slate-400 mt-0.5">
                Neural Geopolitical Synthesis Engine • Real-Time Grounded
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 transition cursor-pointer"
            aria-label="Close"
          >
            <X size={17} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
          {/* Query form */}
          <form onSubmit={handleSubmit} className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('intel.placeholder', { defaultValue: 'Ask about geopolitical risks, commodities, trade pacts...' })}
              className="w-full pl-4 pr-12 py-3.5 text-xs sm:text-sm rounded-xl font-mono-code glass-control text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20 transition-all shadow-inner"
              autoFocus
            />
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg disabled:opacity-40 transition cursor-pointer bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 shadow-sm"
            >
              {isLoading ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
            </button>
          </form>

          {/* Suggestions */}
          {!response && !isLoading && (
            <div className="space-y-2.5">
              <span className="text-[10px] font-mono-code font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                {t('intel.suggestedTitle', { defaultValue: 'Suggested Inquiries' })}:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {suggestions.map((sug, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestionClick(sug)}
                    className="p-3.5 rounded-xl border border-slate-700/60 bg-slate-900/40 hover:bg-cyan-950/20 hover:border-cyan-500/40 text-left text-xs transition-all cursor-pointer flex items-center justify-between gap-2.5 group shadow-sm"
                  >
                    <span className="line-clamp-2 leading-relaxed font-mono-code text-slate-300 group-hover:text-cyan-200 transition-colors">{sug}</span>
                    <ArrowRight size={13} className="shrink-0 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Loading */}
          {isLoading && (
            <div className="py-14 text-center space-y-3.5">
              <div className="w-9 h-9 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin mx-auto shadow-sm shadow-cyan-500/20" />
              <p className="text-xs font-mono-code text-cyan-300 tracking-wider">
                {t('intel.synthesizing', { defaultValue: 'Synthesizing intelligence inquiry...' })}
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-4 rounded-xl border text-xs font-mono-code bg-rose-950/30 border-rose-500/40 text-rose-300">
              {error}
            </div>
          )}

          {/* Response */}
          {response && (
            <div className="space-y-5 animate-fadeIn">
              {/* Answer card */}
              <div className="p-5 rounded-xl border border-slate-700/70 bg-slate-900/60 space-y-3 shadow-lg shadow-black/30">
                <div className="flex items-center gap-2 text-xs font-mono-code font-bold text-cyan-400 tracking-wider">
                  <Bot size={15} />
                  <span>SYNTHESIZED INTELLIGENCE ASSESSMENT</span>
                </div>
                <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap text-slate-200 font-sans">
                  {response.answer}
                </div>
              </div>

              {/* Referenced events */}
              {response.referencedEvents?.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-mono-code font-bold uppercase text-slate-400">
                    <ShieldCheck size={14} className="text-emerald-400" />
                    {t('intel.referencedDossiers', { defaultValue: 'Referenced Intelligence Dossiers' })}
                  </div>
                  <div className="space-y-2">
                    {response.referencedEvents.map((ev) => (
                      <div
                        key={ev._id}
                        className="p-4 rounded-xl border border-slate-700/60 bg-slate-900/40 hover:border-slate-600 flex items-center justify-between gap-3 text-xs transition-all shadow-sm"
                      >
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <SeverityBadge severity={ev.severity} size="sm" />
                            <span className="font-mono-code text-[10px] text-slate-400">
                              {ev.createdAt ? new Date(ev.createdAt).toLocaleDateString() : ''}
                            </span>
                          </div>
                          <p className="font-semibold truncate text-slate-200">
                            {translateNewsText(ev.summary, lang)}
                          </p>
                        </div>
                        <button
                          onClick={() => { onClose(); if (onSelectEvent) onSelectEvent(ev._id); }}
                          className="px-3.5 py-1.5 rounded-lg text-xs font-mono-code font-bold shrink-0 cursor-pointer transition-all bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300"
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

        {/* Footer */}
        <div
          className="px-6 py-3.5 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono-code bg-slate-950/70 text-slate-400"
        >
          <span>{t('intel.groundedNotice', { defaultValue: 'Responses are synthesized from live, verified event dossiers.' })}</span>
          <span className="text-cyan-400/80 font-semibold">GeoMonitor AI v2.4</span>
        </div>
      </div>
    </div>
  );
}
