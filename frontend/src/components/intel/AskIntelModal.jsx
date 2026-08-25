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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 backdrop-blur-md"
      style={{ backgroundColor: 'rgba(2,6,23,0.85)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-lg overflow-hidden animate-fadeIn"
        style={{ backgroundColor: 'var(--color-surface-1)', border: '1px solid var(--color-border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b flex items-center justify-between shrink-0" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface-2)' }}>
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded flex items-center justify-center"
              style={{ backgroundColor: 'var(--color-accent-bg)', border: '1px solid var(--color-accent-border)' }}
            >
              <Sparkles size={15} style={{ color: 'var(--color-accent)' }} />
            </div>
            <div>
              <h2 className="text-sm font-bold font-mono-code flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
                {t('intel.title', { defaultValue: 'Ask GeoMonitor Intelligence' })}
                <span
                  className="text-[9px] font-mono-code uppercase px-2 py-0.5 rounded font-bold"
                  style={{ backgroundColor: 'var(--color-accent-bg)', color: 'var(--color-accent)', border: '1px solid var(--color-accent-border)' }}
                >
                  {t('intel.badge', { defaultValue: 'AI ASSISTANT' })}
                </span>
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded transition cursor-pointer"
            style={{ color: 'var(--color-text-dim)' }}
            aria-label="Close"
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-surface-4)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Query form */}
          <form onSubmit={handleSubmit} className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('intel.placeholder', { defaultValue: 'Ask about geopolitical risks, commodities, trade pacts...' })}
              className="w-full pl-4 pr-12 py-3 text-xs sm:text-sm rounded font-mono-code"
              style={{
                backgroundColor: 'var(--color-surface-2)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
              autoFocus
            />
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded disabled:opacity-40 transition cursor-pointer"
              style={{ backgroundColor: 'var(--color-accent-bg)', border: '1px solid var(--color-accent-border)', color: 'var(--color-accent)' }}
            >
              {isLoading ? <RefreshCw size={13} className="animate-spin" /> : <Send size={13} />}
            </button>
          </form>

          {/* Suggestions */}
          {!response && !isLoading && (
            <div className="space-y-2">
              <span className="text-[10px] font-mono-code font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-dim)' }}>
                {t('intel.suggestedTitle', { defaultValue: 'Suggested Inquiries' })}:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {suggestions.map((sug, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestionClick(sug)}
                    className="p-3 rounded border text-left text-xs transition cursor-pointer flex items-center justify-between gap-2 group"
                    style={{ backgroundColor: 'var(--color-surface-2)', borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-accent-border)'; e.currentTarget.style.backgroundColor = 'var(--color-accent-bg)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.backgroundColor = 'var(--color-surface-2)'; }}
                  >
                    <span className="line-clamp-2 leading-relaxed font-mono-code">{sug}</span>
                    <ArrowRight size={12} className="shrink-0" style={{ color: 'var(--color-accent)' }} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Loading */}
          {isLoading && (
            <div className="py-12 text-center space-y-3">
              <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto" style={{ borderColor: 'var(--color-accent) transparent transparent transparent' }} />
              <p className="text-xs font-mono-code" style={{ color: 'var(--color-text-dim)' }}>
                {t('intel.synthesizing', { defaultValue: 'Synthesizing intelligence inquiry...' })}
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-4 rounded border text-xs font-mono-code" style={{ backgroundColor: 'rgba(225,29,72,0.10)', borderColor: 'rgba(225,29,72,0.30)', color: '#e11d48' }}>
              {error}
            </div>
          )}

          {/* Response */}
          {response && (
            <div className="space-y-5">
              {/* Answer card */}
              <div className="p-5 rounded border space-y-3" style={{ backgroundColor: 'var(--color-surface-2)', borderColor: 'var(--color-border)' }}>
                <div className="flex items-center gap-2 text-xs font-mono-code font-bold" style={{ color: 'var(--color-accent)' }}>
                  <Bot size={14} />
                  <span>SYNTHESIZED INTELLIGENCE ASSESSMENT</span>
                </div>
                <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--color-text-muted)' }}>
                  {response.answer}
                </div>
              </div>

              {/* Referenced events */}
              {response.referencedEvents?.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-mono-code font-bold uppercase" style={{ color: 'var(--color-text-dim)' }}>
                    <ShieldCheck size={13} style={{ color: 'var(--color-stable)' }} />
                    {t('intel.referencedDossiers', { defaultValue: 'Referenced Intelligence Dossiers' })}
                  </div>
                  <div className="space-y-2">
                    {response.referencedEvents.map((ev) => (
                      <div
                        key={ev._id}
                        className="p-3.5 rounded border flex items-center justify-between gap-3 text-xs transition-colors"
                        style={{ backgroundColor: 'var(--color-surface-1)', borderColor: 'var(--color-border)' }}
                      >
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <SeverityBadge severity={ev.severity} size="sm" />
                            <span className="font-mono-code text-[10px]" style={{ color: 'var(--color-text-dim)' }}>
                              {ev.createdAt ? new Date(ev.createdAt).toLocaleDateString() : ''}
                            </span>
                          </div>
                          <p className="font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>
                            {translateNewsText(ev.summary, lang)}
                          </p>
                        </div>
                        <button
                          onClick={() => { onClose(); if (onSelectEvent) onSelectEvent(ev._id); }}
                          className="px-3 py-1.5 rounded text-xs font-mono-code font-bold shrink-0 cursor-pointer transition-colors"
                          style={{ backgroundColor: 'var(--color-accent-bg)', border: '1px solid var(--color-accent-border)', color: 'var(--color-accent)' }}
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
          className="px-5 py-3 border-t flex items-center justify-between text-[10px] font-mono-code"
          style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface-2)', color: 'var(--color-text-dim)' }}
        >
          <span>{t('intel.groundedNotice', { defaultValue: 'Responses are synthesized from live, verified event dossiers.' })}</span>
          <span>GeoMonitor AI v2.4</span>
        </div>
      </div>
    </div>
  );
}
