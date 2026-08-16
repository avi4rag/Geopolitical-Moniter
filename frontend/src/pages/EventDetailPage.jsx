import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ExternalLink,
  MapPin,
  Layers,
  Building2,
  AlertCircle,
  HelpCircle,
  Cpu,
  ShieldCheck,
} from 'lucide-react';
import apiClient from '../lib/apiClient.js';
import SeverityBadge from '../components/common/SeverityBadge.jsx';
import DirectionBadge from '../components/common/DirectionBadge.jsx';
import CredibilityBadge from '../components/common/CredibilityBadge.jsx';

// ─── Event Detail Page ────────────────────────────────────────────────────────
// Dedicated standalone page for a single geopolitical event dossier.
// ─────────────────────────────────────────────────────────────────────────────

export default function EventDetailPage() {
  const { id } = useParams();
  const [eventData, setEventData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    apiClient
      .get(`/events/${id}`)
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
  }, [id]);

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-slate-400 space-y-3">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs">Loading intelligence dossier...</p>
      </div>
    );
  }

  if (error || !eventData) {
    return (
      <div className="p-12 rounded-xl border border-rose-900/60 bg-rose-950/20 text-center text-rose-400 space-y-3">
        <AlertCircle size={36} className="mx-auto text-rose-400" />
        <h2 className="text-base font-bold">Event Dossier Not Found</h2>
        <p className="text-xs text-rose-300/80">{error || 'Event could not be found.'}</p>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-semibold hover:underline"
        >
          <ArrowLeft size={13} />
          <span>Back to Dashboard</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back button */}
      <div>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white transition"
        >
          <ArrowLeft size={13} />
          <span>Back to Global Feed</span>
        </Link>
      </div>

      {/* Main Card */}
      <div
        className="p-6 sm:p-8 rounded-2xl border shadow-xl space-y-6"
        style={{
          backgroundColor: 'var(--color-surface-1)',
          borderColor: 'var(--color-border)',
        }}
      >
        {/* Header Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-amber-400 bg-amber-950/40 border border-amber-800/60 px-2.5 py-1 rounded">
            {eventData.eventType?.replace(/_/g, ' ')}
          </span>
          <SeverityBadge severity={eventData.severity} />
          <CredibilityBadge
            label={eventData.credibilityLabel}
            score={eventData.credibilityScore}
          />
        </div>

        {/* Factual Summary */}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white leading-snug">
            {eventData.summary}
          </h1>

          {eventData.primaryArticleId && (
            <div className="mt-2 text-xs text-slate-400 flex items-center gap-2">
              <span>Primary Source:</span>
              <a
                href={eventData.primaryArticleId.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-400 hover:underline inline-flex items-center gap-1 font-medium"
              >
                {eventData.primaryArticleId.sourceId?.name || 'Original Reporting'}
                <ExternalLink size={11} />
              </a>
            </div>
          )}
        </div>

        {/* Entities Grid */}
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
                  className="px-2 py-0.5 rounded text-[11px] bg-slate-800 text-slate-200 border border-slate-700"
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
                  className="px-2 py-0.5 rounded text-[11px] bg-slate-800 text-slate-200 border border-slate-700"
                >
                  {sector}
                </span>
              ))}
            </div>
          </div>

          <div>
            <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 mb-1.5">
              <Building2 size={12} className="text-purple-400" />
              Key Entities
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

        {/* ─── DOMAIN IMPACT ASSESSMENTS ───────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck size={16} className="text-amber-400" />
              Domain Impact Assessments ({eventData.impacts?.length || 0})
            </h2>
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
                      <span className="text-xs font-mono font-bold text-slate-200">
                        {impact.domain}
                      </span>
                      <DirectionBadge direction={impact.direction} />
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

        {/* Facts vs Uncertainties */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        {/* LLM Audit Metadata */}
        {eventData.extractionMetadata && (
          <div className="p-3 rounded-lg border border-slate-800/80 bg-slate-950 text-[10px] text-slate-500 font-mono flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-1.5">
              <Cpu size={12} className="text-amber-500" />
              <span>Model: {eventData.extractionMetadata.modelName || 'gemini-2.0-flash'}</span>
              <span>• Version: {eventData.extractionMetadata.promptVersion || 'v1.1'}</span>
            </div>
            <div>
              <span>Tokens: {eventData.extractionMetadata.inputTokens || 0} in / {eventData.extractionMetadata.outputTokens || 0} out</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
