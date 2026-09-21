import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  Bookmark,
  Share2,
  Check,
  Clock,
  ChevronRight,
} from 'lucide-react';
import apiClient from '../lib/apiClient.js';
import SeverityBadge from '../components/common/SeverityBadge.jsx';
import DirectionBadge from '../components/common/DirectionBadge.jsx';
import CredibilityBadge from '../components/common/CredibilityBadge.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { translateNewsText, translateNewsArray } from '../i18n/newsContentTranslations.js';
import { getNewsEditorialImage, DEFAULT_EDITORIAL_FALLBACK } from '../lib/newsImages.js';

// ─── Event Intelligence Dossier — Full Viewport ────────────────────────────────
// The main event detail view. Replaces the old centered overlay modal.
// Structured as an intelligence dossier: headline → executive summary →
// what happened (facts) → sector impacts → source attribution.
// All data is sourced from real API calls — no hardcoded content.
// ─────────────────────────────────────────────────────────────────────────────

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

const SEVERITY_COLOR = {
  CRITICAL: 'var(--color-critical)',
  HIGH: 'var(--color-warning)',
  MEDIUM: 'var(--color-info)',
  LOW: 'var(--color-stable)',
};

export default function EventDetailPage() {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated, isBookmarked, toggleBookmark } = useAuth();

  const [eventData, setEventData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const lang = i18n.language || 'en';
  const bookmarked = isBookmarked ? isBookmarked(id) : false;

  const fetchEvent = useCallback(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    Promise.all([
      apiClient.get(`/events/${id}`),
      apiClient.get(`/events/${id}/impacts`).catch(() => ({ data: [] })),
    ])
      .then(([eventRes, impactsRes]) => {
        if (isMounted) {
          const event = eventRes.data || {};
          const impacts = (event.impacts && event.impacts.length > 0)
            ? event.impacts
            : (impactsRes.data || []);
          setEventData({ ...event, impacts });
        }
      })
      .catch((err) => { if (isMounted) setError(err.message || 'Failed to load event'); })
      .finally(() => { if (isMounted) setIsLoading(false); });

    return () => { isMounted = false; };
  }, [id]);

  useEffect(() => {
    const cleanup = fetchEvent();
    return cleanup;
  }, [fetchEvent]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/event/${id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBookmarkToggle = async () => {
    if (isAuthenticated) await toggleBookmark(id);
  };

  const imageUrl = getNewsEditorialImage(eventData);
  const sourceName = eventData?.primaryArticleId?.sourceId?.name || 'World News Wire';

  const formattedDate = eventData?.createdAt
    ? new Date(eventData.createdAt).toLocaleDateString('en-US', {
        month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
      })
    : '';

  const eventTypeLabel = eventData?.eventType
    ? t(`eventTypes.${eventData.eventType}`, { defaultValue: eventData.eventType.replace(/_/g, ' ') })
    : t('eventDetail.headerBadge', { defaultValue: 'EVENT DOSSIER' });

  const sevColor = SEVERITY_COLOR[eventData?.severity] || 'var(--color-text-dim)';

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <div className="w-10 h-10 rounded-full border-2 border-cyan-500/30 border-t-cyan-400 animate-spin shadow-lg shadow-cyan-500/20" />
        <p className="text-xs font-mono-code tracking-widest text-cyan-300">
          LOADING INTELLIGENCE DOSSIER...
        </p>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────────
  if (error || !eventData) {
    return (
      <div className="p-10 rounded-2xl glass-panel border border-rose-500/30 text-center space-y-4 max-w-xl mx-auto mt-16 shadow-xl">
        <AlertCircle size={32} className="mx-auto text-rose-400" />
        <h2 className="text-base font-bold font-headline text-slate-100">
          Dossier Not Found
        </h2>
        <p className="text-xs font-mono-code text-slate-400">
          {error || 'Event could not be retrieved.'}
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-mono-code font-semibold transition-colors text-cyan-400 hover:text-cyan-300"
        >
          <ArrowLeft size={13} />
          Back to Intelligence Feed
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn pb-20">

      {/* ── TOP BREADCRUMB BAR ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pb-5 border-b border-slate-800/80 flex-wrap gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-mono-code font-bold uppercase tracking-wider transition-colors text-cyan-400 hover:text-cyan-300 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20"
        >
          <ArrowLeft size={13} />
          Back to Intelligence Feed
        </Link>

        <div className="flex items-center gap-2">
          {/* Share */}
          <button
            onClick={handleCopyLink}
            className={`p-2 rounded-xl transition-all cursor-pointer glass-control border ${copied ? 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10' : 'border-slate-700/60 text-slate-300 hover:text-slate-100 hover:border-slate-600'}`}
            title={t('eventDetail.copyLink', { defaultValue: 'Copy Link' })}
          >
            {copied ? <Check size={15} /> : <Share2 size={15} />}
          </button>

          {/* Bookmark */}
          {isAuthenticated && (
            <button
              onClick={handleBookmarkToggle}
              className={`p-2 rounded-xl transition-all cursor-pointer glass-control border ${bookmarked ? 'border-cyan-500/50 text-cyan-400 bg-cyan-500/15 shadow-sm shadow-cyan-500/20' : 'border-slate-700/60 text-slate-300 hover:text-slate-100 hover:border-slate-600'}`}
              title={bookmarked ? t('eventDetail.removeBookmark') : t('eventDetail.bookmark')}
            >
              <Bookmark size={15} fill={bookmarked ? 'currentColor' : 'none'} />
            </button>
          )}

          {/* Source link */}
          {eventData.primaryArticleId?.url && (
            <a
              href={eventData.primaryArticleId.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-mono-code font-bold transition-all bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 shadow-sm"
            >
              {t('eventDetail.readOriginal', { defaultValue: 'Read Full Article' })}
              <ExternalLink size={11} />
            </a>
          )}
        </div>
      </div>

      {/* ── TITLE & METADATA ─────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2 font-mono-code text-xs">
          <span
            className="px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider text-[11px]"
            style={{
              backgroundColor: `${sevColor}15`,
              border: `1px solid ${sevColor}30`,
              color: sevColor,
            }}
          >
            {eventTypeLabel}
          </span>
          <SeverityBadge severity={eventData.severity} />
          <CredibilityBadge label={eventData.credibilityLabel} score={eventData.credibilityScore} />
          <span className="text-slate-600">|</span>
          <span className="flex items-center gap-1.5 text-slate-400">
            <Clock size={12} className="text-slate-500" />
            {formattedDate}
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">
            {timeAgo(eventData.createdAt)} • <span className="text-slate-200 font-semibold">{sourceName}</span>
          </span>
        </div>

        <h1 className="font-headline text-2xl sm:text-3xl md:text-4xl font-bold leading-tight max-w-5xl text-slate-100 tracking-tight">
          {translateNewsText(eventData.summary, lang)}
        </h1>
      </div>

      {/* ── 12-COLUMN DOSSIER CONTENT GRID ──────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* LEFT COLUMN — Main narrative + image + facts ──────────────────── */}
        <div className="lg:col-span-8 space-y-8">

          {/* Executive Summary callout */}
          <div className="p-5 sm:p-6 rounded-2xl glass-card border border-slate-700/60 border-l-4 border-l-cyan-500 shadow-lg">
            <p className="font-headline text-sm sm:text-base leading-relaxed italic text-slate-200">
              {translateNewsText(eventData.summary, lang)}
            </p>
          </div>

          {/* Hero image */}
          <figure className="space-y-2 rounded-2xl overflow-hidden glass-card border border-slate-700/60 shadow-xl">
            <div className="aspect-[16/9] w-full overflow-hidden bg-slate-900/60">
              <img
                src={imageUrl}
                alt={eventData.summary}
                className="w-full h-full object-cover opacity-95 transition-transform duration-700 hover:scale-105"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = DEFAULT_EDITORIAL_FALLBACK;
                }}
              />
            </div>
            <figcaption className="text-[11px] font-mono-code px-4 pb-3 pt-1 text-slate-400 flex items-center justify-between">
              <span>
                {eventData.imageUrl || eventData.primaryArticleId?.imageUrl
                  ? `SOURCE IMAGE — ${sourceName}`
                  : 'ILLUSTRATIVE IMAGE — Category fallback photography'}
              </span>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">GEOMONITOR WIRE FEED</span>
            </figcaption>
          </figure>

          {/* Article excerpt / source summary */}
          {eventData.primaryArticleId?.excerpt && (
            <div className="p-6 rounded-2xl glass-card border border-slate-700/60 space-y-3.5 shadow-lg">
              <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-800">
                <span className="text-xs font-mono-code font-bold uppercase tracking-wider text-slate-300">
                  {t('eventDetail.articleSummary', { defaultValue: 'Article Summary' })}
                </span>
                {eventData.primaryArticleId?.url && (
                  <a
                    href={eventData.primaryArticleId.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-mono-code font-bold inline-flex items-center gap-1 transition-colors text-cyan-400 hover:text-cyan-300"
                  >
                    {t('eventDetail.readOriginal', { defaultValue: 'Read Original' })}
                    <ExternalLink size={11} />
                  </a>
                )}
              </div>
              <p className="text-sm leading-relaxed text-slate-300 font-sans">
                {translateNewsText(eventData.primaryArticleId.excerpt, lang)}
              </p>
            </div>
          )}

          {/* WHAT HAPPENED: Facts */}
          <div className="space-y-4">
            <h2 className="font-headline text-xl font-bold border-b border-slate-800 pb-2.5 text-slate-200">
              {t('eventDetail.verifiedFacts', { defaultValue: 'What Happened' })}
            </h2>
            {eventData.facts && eventData.facts.length > 0 ? (
              <ul className="space-y-2.5">
                {translateNewsArray(eventData.facts, lang).map((fact, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm leading-relaxed text-slate-300 p-3.5 rounded-xl border border-slate-800/80 bg-slate-900/40">
                    <span className="mt-1.5 w-2 h-2 rounded-full flex-shrink-0 bg-emerald-400 shadow-sm shadow-emerald-500/30" />
                    <span>{fact}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs italic font-mono-code text-slate-500">
                {t('eventDetail.noFacts', { defaultValue: 'No specific facts recorded.' })}
              </p>
            )}
          </div>

          {/* WHY IT MATTERS: Uncertainties */}
          <div className="space-y-4">
            <h2 className="font-headline text-xl font-bold border-b border-slate-800 pb-2.5 text-slate-200">
              {t('eventDetail.reportedUncertainties', { defaultValue: 'Reported Uncertainties' })}
            </h2>
            {eventData.uncertainties && eventData.uncertainties.length > 0 ? (
              <ul className="space-y-2.5">
                {translateNewsArray(eventData.uncertainties, lang).map((unc, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm leading-relaxed text-slate-300 p-3.5 rounded-xl border border-slate-800/80 bg-slate-900/40">
                    <span className="mt-1.5 w-2 h-2 rounded-full flex-shrink-0 bg-amber-400 shadow-sm shadow-amber-500/30" />
                    <span>{unc}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs italic font-mono-code text-slate-500">
                {t('eventDetail.noUncertainties', { defaultValue: 'No uncertainties recorded.' })}
              </p>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN — Tactical assessment panel ───────────────────────── */}
        <div className="lg:col-span-4 space-y-5">

          {/* Geographic & sector entities */}
          <div className="rounded-2xl glass-card border border-slate-700/60 p-5 space-y-4 shadow-xl">
            {/* Countries */}
            {(eventData.countries?.length > 0 || eventData.regions?.length > 0) && (
              <div>
                <div className="flex items-center gap-1.5 text-xs font-mono-code font-bold uppercase tracking-wider mb-2.5 text-slate-400">
                  <MapPin size={13} className="text-cyan-400" />
                  {t('eventDetail.countriesRegions', { defaultValue: 'Countries & Regions' })}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[...(eventData.countries || []), ...(eventData.regions || [])].map((item, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-mono-code bg-slate-900/60 border border-slate-700/80 text-slate-300"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Sectors */}
            {eventData.sectors?.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 text-xs font-mono-code font-bold uppercase tracking-wider mb-2.5 text-slate-400">
                  <Layers size={13} className="text-cyan-400" />
                  {t('eventDetail.affectedSectors', { defaultValue: 'Affected Sectors' })}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(eventData.sectors || []).map((sector, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-mono-code bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-semibold"
                    >
                      {sector}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Entities */}
            {eventData.entities?.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 text-xs font-mono-code font-bold uppercase tracking-wider mb-2.5 text-slate-400">
                  <Building2 size={13} className="text-cyan-400" />
                  {t('eventDetail.keyEntities', { defaultValue: 'Key Entities' })}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(eventData.entities || []).map((entity, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-mono-code bg-slate-900/60 border border-slate-700/80 text-slate-300"
                    >
                      {entity}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Source confidence */}
          <div className="rounded-2xl glass-card border border-slate-700/60 p-5 space-y-3.5 shadow-xl">
            <h3 className="text-xs font-mono-code font-bold uppercase tracking-wider border-b border-slate-800 pb-2 text-slate-300">
              Source Confidence
            </h3>
            <div className="space-y-2">
              <div className="text-xs font-mono-code text-slate-400">
                CREDIBILITY STATUS:
              </div>
              <CredibilityBadge label={eventData.credibilityLabel} score={eventData.credibilityScore} />
              {eventData.credibilityLabel === 'UNVERIFIED' && (
                <p className="text-[11px] font-mono-code text-slate-500">
                  Credibility scoring not yet active for this event.
                </p>
              )}
              <div className="text-xs font-mono-code mt-3 text-slate-400">
                PRIMARY SOURCE: <span className="text-slate-200 font-semibold">{sourceName}</span>
              </div>
            </div>
            {eventData.primaryArticleId?.url && (
              <a
                href={eventData.primaryArticleId.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full mt-3 py-2.5 rounded-xl text-xs font-mono-code font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 shadow-sm cursor-pointer"
              >
                Read Full Article
                <ExternalLink size={12} />
              </a>
            )}
          </div>

          {/* Extraction metadata (audit info) */}
          {eventData.extractionMetadata && (
            <div className="rounded-2xl glass-card border border-slate-700/60 p-4 text-[10px] font-mono-code text-slate-400 shadow-lg space-y-1">
              <div className="flex items-center gap-1.5 mb-1 text-cyan-300 font-semibold">
                <Cpu size={12} className="text-cyan-400" />
                GeoMonitor AI Extraction
              </div>
              <div>v{eventData.extractionMetadata.promptVersion || '1.0'}</div>
              <div>{eventData.extractionMetadata.inputTokens || 0} in / {eventData.extractionMetadata.outputTokens || 0} out tokens</div>
            </div>
          )}
        </div>
      </div>

      {/* ── FULL-WIDTH SECTOR IMPACT ANALYSIS ────────────────────────────────── */}
      <div className="space-y-4 border-t border-slate-800/80 pt-8">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="font-headline text-xl font-bold flex items-center gap-2 text-slate-100">
            <ShieldCheck size={18} className="text-cyan-400" />
            {t('eventDetail.domainImpacts', { defaultValue: 'Sector Impact Analysis' })}
          </h2>
          <span className="text-[11px] font-mono-code text-slate-400">
            {(eventData.impacts?.length || 0)} EVALUATED SECTORS
          </span>
        </div>

        {eventData.impacts && eventData.impacts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {eventData.impacts.map((impact) => {
              const domainLabel = t(`domains.${impact.domain}`, { defaultValue: impact.domain });
              const localizedExp = translateNewsText(impact.explanation, lang);
              const confidencePct = Math.round((impact.confidenceScore || 0) * 100);
              return (
                <div
                  key={impact._id}
                  className="p-5 rounded-2xl glass-card border border-slate-700/60 space-y-3 shadow-lg"
                >
                  <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-800">
                    <span className="text-xs font-mono-code font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-300">
                      {domainLabel}
                    </span>
                    <div className="flex items-center gap-2">
                      <DirectionBadge direction={impact.direction} />
                      <SeverityBadge severity={impact.severity} />
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm leading-relaxed text-slate-300 font-sans">
                    {localizedExp}
                  </p>
                  {/* Confidence bar */}
                  <div>
                    <div className="flex justify-between text-[10px] font-mono-code mb-1 text-slate-400">
                      <span>CONFIDENCE</span>
                      <span className="text-slate-200 font-semibold">{confidencePct}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full overflow-hidden bg-slate-800">
                      <div
                        className="h-full rounded-full transition-all duration-700 bg-cyan-400"
                        style={{ width: `${confidencePct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 rounded-2xl glass-card border border-slate-700/60 text-center space-y-2 shadow-lg">
            <ShieldCheck size={28} className="mx-auto text-slate-500" />
            <p className="text-sm font-semibold text-slate-300">
              {t('eventDetail.noImpacts', { defaultValue: 'No domain impacts assessed for this event yet.' })}
            </p>
            <p className="text-xs font-mono-code max-w-md mx-auto text-slate-400">
              Causal transmission engine evaluates impact rules across Energy, Trade, Tech, and Macroeconomic sectors as new reports arrive.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
