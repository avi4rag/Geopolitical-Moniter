import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  X,
  ExternalLink,
  MapPin,
  Layers,
  Building2,
  AlertCircle,
  HelpCircle,
  Cpu,
  Clock,
  ShieldCheck,
  Bookmark,
  Share2,
  Check,
  Maximize2,
} from 'lucide-react';
import apiClient from '../../lib/apiClient.js';
import SeverityBadge from '../common/SeverityBadge.jsx';
import DirectionBadge from '../common/DirectionBadge.jsx';
import CredibilityBadge from '../common/CredibilityBadge.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

// ─── Event Detail Modal ───────────────────────────────────────────────────────
// Modal for in-depth inspection of an event and its cross-domain impacts.
// ─────────────────────────────────────────────────────────────────────────────

export default function EventDetailModal({ eventId, onClose }) {
  const [eventData, setEventData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const { isAuthenticated, isBookmarked, toggleBookmark } = useAuth();
  const bookmarked = isBookmarked(eventId);

  useEffect(() => {
    if (!eventId) return;

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    apiClient
      .get(`/events/${eventId}`)
      .then((res) => {
        if (isMounted) setEventData(res.data);
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Failed to load event details');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [eventId]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleCopyLink = () => {
    const url = `${window.location.origin}/event/${eventId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBookmarkToggle = async () => {
    if (isAuthenticated) {
      await toggleBookmark(eventId);
    }
  };

  if (!eventId) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden"
        style={{
          backgroundColor: 'var(--color-surface-1)',
          borderColor: 'var(--color-border)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-950/60">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-amber-400 bg-amber-950/40 border border-amber-800/60 px-2.5 py-1 rounded">
              {eventData?.eventType?.replace(/_/g, ' ') || 'EVENT DETAILS'}
            </span>
            {eventData && (
              <>
                <SeverityBadge severity={eventData.severity} />
                <CredibilityBadge
                  label={eventData.credibilityLabel}
                  score={eventData.credibilityScore}
                />
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Share / Copy link */}
            <button
              onClick={handleCopyLink}
              title="Copy dossier link"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer flex items-center gap-1 text-xs"
            >
              {copied ? (
                <>
                  <Check size={14} className="text-emerald-400" />
                  <span className="text-[10px] text-emerald-400 font-mono">Copied</span>
                </>
              ) : (
                <Share2 size={15} />
              )}
            </button>

            {/* Bookmark */}
            {isAuthenticated && (
              <button
                onClick={handleBookmarkToggle}
                title={bookmarked ? 'Remove bookmark' : 'Bookmark dossier'}
                className={`p-1.5 rounded-lg border transition cursor-pointer ${
                  bookmarked
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Bookmark size={15} fill={bookmarked ? 'currentColor' : 'none'} />
              </button>
            )}

            {/* Full page link */}
            <Link
              to={`/event/${eventId}`}
              title="Open standalone dossier page"
              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition cursor-pointer"
            >
              <Maximize2 size={15} />
            </Link>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer ml-1"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 space-y-3">
              <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-mono">Loading intelligence dossier...</p>
            </div>
          ) : error ? (
            <div className="py-12 text-center text-rose-400 text-sm">
              <AlertCircle size={32} className="mx-auto mb-2 opacity-80" />
              <p>{error}</p>
            </div>
          ) : eventData ? (
            <>
              {/* Event Summary */}
              <div>
                <h3 className="text-lg font-bold text-white leading-relaxed">
                  {eventData.summary}
                </h3>

                {/* Primary Source Attribution */}
                {eventData.primaryArticleId && (
                  <div className="mt-2 text-xs text-slate-400 flex items-center gap-2">
                    <span>Source:</span>
                    <a
                      href={eventData.primaryArticleId.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-400 hover:underline inline-flex items-center gap-1 font-medium"
                    >
                      {eventData.primaryArticleId.sourceId?.name || 'Original Article'}
                      <ExternalLink size={11} />
                    </a>
                  </div>
                )}
              </div>

              {/* Geographic & Sector Entities */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <div>
                  <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 mb-1.5">
                    <MapPin size={12} className="text-amber-400" />
                    Countries & Regions
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {[...(eventData.countries || []), ...(eventData.regions || [])].map((item, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded text-[11px] bg-slate-800 text-slate-200 border border-slate-700 font-medium"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 mb-1.5">
                    <Layers size={12} className="text-sky-400" />
                    Affected Sectors
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {(eventData.sectors || []).map((sector, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded text-[11px] bg-slate-800 text-slate-200 border border-slate-700 font-mono"
                      >
                        {sector}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 mb-1.5">
                    <Building2 size={12} className="text-purple-400" />
                    Key Named Entities
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {(eventData.entities || []).map((entity, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded text-[11px] bg-slate-800 text-slate-200 border border-slate-700"
                      >
                        {entity}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* DOMAIN IMPACT ASSESSMENTS */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <ShieldCheck size={16} className="text-amber-400" />
                    Domain Impact Assessments ({eventData.impacts?.length || 0})
                  </h4>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Qualitative Causal Rules
                  </span>
                </div>

                {eventData.impacts && eventData.impacts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {eventData.impacts.map((impact) => (
                      <div
                        key={impact._id}
                        className="p-4 rounded-xl border bg-slate-900/40 border-slate-800/90 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-900/60">
                              {impact.domain}
                            </span>
                            <DirectionBadge direction={impact.direction} size="sm" />
                          </div>

                          <p className="text-xs text-slate-300 leading-relaxed">
                            {impact.explanation}
                          </p>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                          <span>Rule: {impact.ruleId}</span>
                          <span className="text-amber-400 font-semibold">
                            {Math.round(impact.confidenceScore * 100)}% Confidence
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/30 text-xs text-slate-400 text-center">
                    No domain impacts assessed for this event yet.
                  </div>
                )}
              </div>

              {/* Extracted Facts vs Uncertainties */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Facts */}
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/30">
                  <div className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                    <AlertCircle size={13} className="text-emerald-400" />
                    Verified Claims & Facts
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {eventData.facts && eventData.facts.length > 0 ? (
                      eventData.facts.map((fact, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-emerald-400">•</span>
                          <span>{fact}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-slate-500 italic">No specific facts extracted.</li>
                    )}
                  </ul>
                </div>

                {/* Uncertainties */}
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/30">
                  <div className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                    <HelpCircle size={13} className="text-amber-400" />
                    Reported Uncertainties
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {eventData.uncertainties && eventData.uncertainties.length > 0 ? (
                      eventData.uncertainties.map((unc, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-amber-400">•</span>
                          <span>{unc}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-slate-500 italic">No reported uncertainties.</li>
                    )}
                  </ul>
                </div>
              </div>

              {/* AI Extraction Audit Metadata */}
              {eventData.extractionMetadata && (
                <div className="p-3 rounded-lg border border-slate-800/80 bg-slate-950 text-[10px] text-slate-500 font-mono flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-1.5">
                    <Cpu size={12} className="text-amber-500" />
                    <span>Engine: GeoMonitor AI</span>
                  </div>
                  <div>
                    <span>Tokens: {eventData.extractionMetadata.inputTokens || 0} in / {eventData.extractionMetadata.outputTokens || 0} out</span>
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
