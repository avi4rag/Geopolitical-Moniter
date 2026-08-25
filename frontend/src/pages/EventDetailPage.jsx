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
import { getNewsEditorialImage } from '../lib/newsImages.js';

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

    apiClient
      .get(`/events/${id}`)
      .then((res) => { if (isMounted) setEventData(res.data); })
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
        <div
          className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: `var(--color-accent) transparent transparent transparent` }}
        />
        <p className="text-xs font-mono-code tracking-wider" style={{ color: 'var(--color-text-dim)' }}>
          LOADING INTELLIGENCE DOSSIER...
        </p>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────────
  if (error || !eventData) {
    return (
      <div
        className="p-10 rounded-lg border text-center space-y-4 max-w-xl mx-auto mt-16"
        style={{ backgroundColor: 'var(--color-surface-1)', borderColor: 'var(--color-border)' }}
      >
        <AlertCircle size={32} className="mx-auto" style={{ color: 'var(--color-critical)' }} />
        <h2 className="text-base font-bold font-headline" style={{ color: 'var(--color-text-primary)' }}>
          Dossier Not Found
        </h2>
        <p className="text-xs font-mono-code" style={{ color: 'var(--color-text-muted)' }}>
          {error || 'Event could not be retrieved.'}
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-mono-code font-semibold transition-colors"
          style={{ color: 'var(--color-accent)' }}
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
      <div
        className="flex items-center justify-between pb-5 border-b flex-wrap gap-3"
        style={{ borderColor: 'var(--color-border-subtle)' }}
      >
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-mono-code font-semibold uppercase tracking-wider transition-colors"
          style={{ color: 'var(--color-accent)' }}
        >
          <ArrowLeft size={13} />
          Back to Intelligence Feed
        </Link>

        <div className="flex items-center gap-2">
          {/* Share */}
          <button
            onClick={handleCopyLink}
            className="p-2 rounded transition-colors cursor-pointer"
            style={{ color: copied ? 'var(--color-stable)' : 'var(--color-text-dim)' }}
            title={t('eventDetail.copyLink', { defaultValue: 'Copy Link' })}
          >
            {copied ? <Check size={15} /> : <Share2 size={15} />}
          </button>

          {/* Bookmark */}
          {isAuthenticated && (
            <button
              onClick={handleBookmarkToggle}
              className="p-2 rounded transition-colors cursor-pointer"
              style={{ color: bookmarked ? 'var(--color-accent)' : 'var(--color-text-dim)' }}
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
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono-code font-bold transition-all"
              style={{
                backgroundColor: 'var(--color-accent-bg)',
                border: '1px solid var(--color-accent-border)',
                color: 'var(--color-accent)',
              }}
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
            className="px-2 py-0.5 rounded font-bold uppercase tracking-wider"
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
          <span style={{ color: 'var(--color-text-dim)' }}>|</span>
          <span className="flex items-center gap-1" style={{ color: 'var(--color-text-dim)' }}>
            <Clock size={11} />
            {formattedDate}
          </span>
          <span style={{ color: 'var(--color-text-dim)' }}>|</span>
          <span style={{ color: 'var(--color-text-dim)' }}>
            {timeAgo(eventData.createdAt)} • {sourceName}
          </span>
        </div>

        <h1
          className="font-headline text-2xl sm:text-3xl md:text-4xl font-bold leading-tight max-w-5xl"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {translateNewsText(eventData.summary, lang)}
        </h1>
      </div>

      {/* ── 12-COLUMN DOSSIER CONTENT GRID ──────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* LEFT COLUMN — Main narrative + image + facts ──────────────────── */}
        <div className="lg:col-span-8 space-y-8">

          {/* Executive Summary callout */}
          <div
            className="p-5 rounded-r-lg border-l-4"
            style={{
              backgroundColor: 'var(--color-surface-2)',
              borderLeftColor: 'var(--color-text-secondary)',
            }}
          >
            <p
              className="font-headline text-sm sm:text-base leading-relaxed italic"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {translateNewsText(eventData.summary, lang)}
            </p>
          </div>

          {/* Hero image */}
          <figure
            className="space-y-2 rounded-lg overflow-hidden border"
            style={{ backgroundColor: 'var(--color-surface-1)', borderColor: 'var(--color-border)' }}
          >
            <div className="aspect-[16/9] w-full overflow-hidden">
              <img
                src={imageUrl}
                alt={eventData.summary}
                className="w-full h-full object-cover opacity-80"
              />
            </div>
            <figcaption
              className="text-[11px] font-mono-code px-3 pb-2"
              style={{ color: 'var(--color-text-dim)' }}
            >
              {eventData.imageUrl
                ? `SOURCE IMAGE — ${sourceName}`
                : 'ILLUSTRATIVE IMAGE — No direct image available for this event'}
            </figcaption>
          </figure>

          {/* Article excerpt / source summary */}
          {eventData.primaryArticleId?.excerpt && (
            <div
              className="p-5 rounded-lg border space-y-3"
              style={{
                backgroundColor: 'var(--color-surface-2)',
                borderColor: 'var(--color-border)',
              }}
            >
              <div className="flex items-center justify-between gap-2 pb-2 border-b" style={{ borderColor: 'var(--color-border-subtle)' }}>
                <span className="text-xs font-mono-code font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                  {t('eventDetail.articleSummary', { defaultValue: 'Article Summary' })}
                </span>
                {eventData.primaryArticleId?.url && (
                  <a
                    href={eventData.primaryArticleId.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-mono-code font-bold inline-flex items-center gap-1 transition-colors"
                    style={{ color: 'var(--color-accent)' }}
                  >
                    {t('eventDetail.readOriginal', { defaultValue: 'Read Original' })}
                    <ExternalLink size={11} />
                  </a>
                )}
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                {translateNewsText(eventData.primaryArticleId.excerpt, lang)}
              </p>
            </div>
          )}

          {/* WHAT HAPPENED: Facts */}
          <div className="space-y-3">
            <h2
              className="font-headline text-xl font-bold border-b pb-2"
              style={{ color: 'var(--color-text-secondary)', borderColor: 'var(--color-border-subtle)' }}
            >
              {t('eventDetail.verifiedFacts', { defaultValue: 'What Happened' })}
            </h2>
            {eventData.facts && eventData.facts.length > 0 ? (
              <ul className="space-y-2">
                {translateNewsArray(eventData.facts, lang).map((fact, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: 'var(--color-stable)' }} />
                    {fact}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs italic font-mono-code" style={{ color: 'var(--color-text-dim)' }}>
                {t('eventDetail.noFacts', { defaultValue: 'No specific facts recorded.' })}
              </p>
            )}
          </div>

          {/* WHY IT MATTERS: Uncertainties */}
          <div className="space-y-3">
            <h2
              className="font-headline text-xl font-bold border-b pb-2"
              style={{ color: 'var(--color-text-secondary)', borderColor: 'var(--color-border-subtle)' }}
            >
              {t('eventDetail.reportedUncertainties', { defaultValue: 'Reported Uncertainties' })}
            </h2>
            {eventData.uncertainties && eventData.uncertainties.length > 0 ? (
              <ul className="space-y-2">
                {translateNewsArray(eventData.uncertainties, lang).map((unc, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: 'var(--color-warning)' }} />
                    {unc}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs italic font-mono-code" style={{ color: 'var(--color-text-dim)' }}>
                {t('eventDetail.noUncertainties', { defaultValue: 'No uncertainties recorded.' })}
              </p>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN — Tactical assessment panel ───────────────────────── */}
        <div className="lg:col-span-4 space-y-5">

          {/* Geographic & sector entities */}
          <div
            className="rounded-lg border p-5 space-y-4"
            style={{ backgroundColor: 'var(--color-surface-2)', borderColor: 'var(--color-border)' }}
          >
            {/* Countries */}
            {(eventData.countries?.length > 0 || eventData.regions?.length > 0) && (
              <div>
                <div className="flex items-center gap-1.5 text-xs font-mono-code font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-dim)' }}>
                  <MapPin size={12} style={{ color: 'var(--color-accent)' }} />
                  {t('eventDetail.countriesRegions', { defaultValue: 'Countries & Regions' })}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[...(eventData.countries || []), ...(eventData.regions || [])].map((item, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded text-[11px] font-mono-code"
                      style={{ backgroundColor: 'var(--color-surface-4)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}
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
                <div className="flex items-center gap-1.5 text-xs font-mono-code font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-dim)' }}>
                  <Layers size={12} style={{ color: 'var(--color-accent)' }} />
                  {t('eventDetail.affectedSectors', { defaultValue: 'Affected Sectors' })}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(eventData.sectors || []).map((sector, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded text-[11px] font-mono-code"
                      style={{ backgroundColor: 'var(--color-accent-bg)', border: '1px solid var(--color-accent-border)', color: 'var(--color-accent)' }}
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
                <div className="flex items-center gap-1.5 text-xs font-mono-code font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-dim)' }}>
                  <Building2 size={12} style={{ color: 'var(--color-accent)' }} />
                  {t('eventDetail.keyEntities', { defaultValue: 'Key Entities' })}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(eventData.entities || []).map((entity, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded text-[11px] font-mono-code"
                      style={{ backgroundColor: 'var(--color-surface-4)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}
                    >
                      {entity}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Source confidence */}
          <div
            className="rounded-lg border p-5 space-y-3"
            style={{ backgroundColor: 'var(--color-surface-1)', borderColor: 'var(--color-border)' }}
          >
            <h3 className="text-xs font-mono-code font-bold uppercase tracking-wider border-b pb-2" style={{ color: 'var(--color-text-dim)', borderColor: 'var(--color-border-subtle)' }}>
              Source Confidence
            </h3>
            <div className="space-y-1.5">
              <div className="text-xs font-mono-code" style={{ color: 'var(--color-text-dim)' }}>
                CREDIBILITY STATUS:
              </div>
              <CredibilityBadge label={eventData.credibilityLabel} score={eventData.credibilityScore} />
              {eventData.credibilityLabel === 'UNVERIFIED' && (
                <p className="text-[11px] font-mono-code" style={{ color: 'var(--color-text-dim)' }}>
                  Credibility scoring not yet active for this event.
                </p>
              )}
              <div className="text-xs font-mono-code mt-2" style={{ color: 'var(--color-text-dim)' }}>
                PRIMARY SOURCE: <span style={{ color: 'var(--color-text-muted)' }}>{sourceName}</span>
              </div>
            </div>
            {eventData.primaryArticleId?.url && (
              <a
                href={eventData.primaryArticleId.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full mt-2 py-2.5 rounded text-xs font-mono-code font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
                style={{
                  backgroundColor: 'var(--color-accent-bg)',
                  border: '1px solid var(--color-accent-border)',
                  color: 'var(--color-accent)',
                }}
              >
                Read Full Article
                <ExternalLink size={12} />
              </a>
            )}
          </div>

          {/* Extraction metadata (audit info) */}
          {eventData.extractionMetadata && (
            <div
              className="rounded-lg border p-4 text-[10px] font-mono-code"
              style={{
                backgroundColor: 'var(--color-surface-1)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-dim)',
              }}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <Cpu size={11} style={{ color: 'var(--color-accent)' }} />
                GeoMonitor AI Extraction
              </div>
              <div>v{eventData.extractionMetadata.promptVersion || '1.0'}</div>
              <div>{eventData.extractionMetadata.inputTokens || 0} in / {eventData.extractionMetadata.outputTokens || 0} out tokens</div>
            </div>
          )}
        </div>
      </div>

      {/* ── FULL-WIDTH SECTOR IMPACT ANALYSIS ────────────────────────────────── */}
      {eventData.impacts && eventData.impacts.length > 0 && (
        <div className="space-y-4 border-t pt-8" style={{ borderColor: 'var(--color-border-subtle)' }}>
          <h2 className="font-headline text-xl font-bold flex items-center gap-2" style={{ color: 'var(--color-text-secondary)' }}>
            <ShieldCheck size={18} style={{ color: 'var(--color-accent)' }} />
            {t('eventDetail.domainImpacts', { defaultValue: 'Sector Impact Analysis' })}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {eventData.impacts.map((impact) => {
              const domainLabel = t(`domains.${impact.domain}`, { defaultValue: impact.domain });
              const localizedExp = translateNewsText(impact.explanation, lang);
              const confidencePct = Math.round((impact.confidenceScore || 0) * 100);
              return (
                <div
                  key={impact._id}
                  className="p-4 rounded-lg border space-y-2.5"
                  style={{ backgroundColor: 'var(--color-surface-2)', borderColor: 'var(--color-border)' }}
                >
                  <div className="flex items-center justify-between gap-2 pb-2 border-b" style={{ borderColor: 'var(--color-border-subtle)' }}>
                    <span
                      className="text-xs font-mono-code font-bold uppercase tracking-wider px-2 py-0.5 rounded"
                      style={{
                        backgroundColor: 'var(--color-accent-bg)',
                        border: '1px solid var(--color-accent-border)',
                        color: 'var(--color-accent)',
                      }}
                    >
                      {domainLabel}
                    </span>
                    <div className="flex items-center gap-2">
                      <DirectionBadge direction={impact.direction} />
                      <SeverityBadge severity={impact.severity} />
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                    {localizedExp}
                  </p>
                  {/* Confidence bar */}
                  <div>
                    <div className="flex justify-between text-[10px] font-mono-code mb-1" style={{ color: 'var(--color-text-dim)' }}>
                      <span>CONFIDENCE</span>
                      <span>{confidencePct}%</span>
                    </div>
                    <div className="w-full h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-surface-4)' }}>
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${confidencePct}%`, backgroundColor: 'var(--color-accent)' }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
