import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  X,
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
  Newspaper,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import apiClient from '../../lib/apiClient.js';
import SeverityBadge from '../common/SeverityBadge.jsx';
import DirectionBadge from '../common/DirectionBadge.jsx';
import CredibilityBadge from '../common/CredibilityBadge.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { translateNewsText, translateNewsArray } from '../../i18n/newsContentTranslations.js';
import { getNewsEditorialImage, DEFAULT_EDITORIAL_FALLBACK } from '../../lib/newsImages.js';

// ─── Premium Intelligence Dossier Modal ──────────────────────────────────────
// Translucent dark glass surface, deep blur, thin border, red/blue accents,
// verified claims vs uncertainties, systemic impacts, and full wire attribution.
// ─────────────────────────────────────────────────────────────────────────────

export default function EventDetailModal({ eventId, onClose }) {
  const { t, i18n } = useTranslation();
  const [eventData, setEventData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const lang = i18n.language || 'en';
  const { isAuthenticated, isBookmarked, toggleBookmark } = useAuth();
  const bookmarked = isBookmarked ? isBookmarked(eventId) : false;

  // Lock background scroll while modal is active
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  useEffect(() => {
    if (!eventId) return;

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    Promise.all([
      apiClient.get(`/events/${eventId}`),
      apiClient.get(`/events/${eventId}/impacts`).catch(() => ({ data: [] })),
    ])
      .then(([eventRes, impactsRes]) => {
        if (isMounted) {
          const ev = eventRes.data || {};
          const impacts = (ev.impacts && ev.impacts.length > 0)
            ? ev.impacts
            : (impactsRes.data || []);
          setEventData({ ...ev, impacts });
        }
      })
      .catch((err) => {
        if (isMounted) setError(err.message || t('errors.generic'));
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [eventId, t]);

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

  const eventTypeLabel = eventData?.eventType
    ? t(`eventTypes.${eventData.eventType}`, { defaultValue: eventData.eventType.replace(/_/g, ' ') })
    : t('eventDetail.headerBadge', { defaultValue: 'INTELLIGENCE DOSSIER' });

  const imageUrl = getNewsEditorialImage(eventData);
  const sourceName = eventData?.primaryArticleId?.sourceId?.name || 'World News Wire';

  const formattedDate = eventData?.createdAt
    ? new Date(eventData.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-200 ${
        isExpanded ? 'p-1 sm:p-2' : 'p-3 sm:p-6'
      } bg-[#020617]/85 backdrop-blur-md animate-fadeIn`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Intelligence Dossier"
    >
      <div
        className={`relative w-full flex flex-col glass-dossier overflow-hidden transition-all duration-200 animate-dossierOpen ${
          isExpanded
            ? 'max-w-[98vw] w-[98vw] h-[98vh] max-h-[98vh] rounded-2xl'
            : 'max-w-4xl max-h-[92vh] rounded-2xl'
        }`}
        onClick={(e) => e.stopPropagation()}
        style={{
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.85), 0 0 35px rgba(195, 192, 255, 0.08)',
        }}
      >
        {/* Top Sticky Bar */}
        <div
          className="px-5 py-3.5 border-b flex items-center justify-between shrink-0 bg-[#070d1f]/90 backdrop-blur-xl"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <div className="flex items-center gap-2.5 flex-wrap">
            <span
              className="text-[10px] font-mono-code font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border"
              style={{
                backgroundColor: 'var(--color-accent-bg)',
                borderColor: 'var(--color-accent-border)',
                color: 'var(--color-accent)',
              }}
            >
              {eventTypeLabel}
            </span>
            {eventData && (
              <>
                <SeverityBadge severity={eventData.severity} size="sm" />
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
              title={t('eventDetail.copyLink', { defaultValue: 'Copy Link' })}
              className="p-2 rounded-lg text-[var(--color-text-dim)] hover:text-white hover:bg-[var(--color-surface-4)] transition cursor-pointer"
              aria-label="Copy dossier link"
            >
              {copied ? <Check size={16} className="text-emerald-400" /> : <Share2 size={16} />}
            </button>

            {/* Bookmark button */}
            {isAuthenticated && (
              <button
                onClick={handleBookmarkToggle}
                className={`p-2 rounded-lg transition cursor-pointer ${
                  bookmarked
                    ? 'bg-[var(--color-accent-bg)] text-[var(--color-accent)] border border-[var(--color-accent-border)]'
                    : 'text-[var(--color-text-dim)] hover:text-white hover:bg-[var(--color-surface-4)]'
                }`}
                title={bookmarked ? t('eventDetail.removeBookmark') : t('eventDetail.bookmark')}
                aria-label="Bookmark dossier"
              >
                <Bookmark size={16} fill={bookmarked ? 'currentColor' : 'none'} />
              </button>
            )}

            {/* Zoom / Expand Toggle */}
            <button
              onClick={() => setIsExpanded((prev) => !prev)}
              className="p-2 rounded-lg text-[var(--color-text-dim)] hover:text-white hover:bg-[var(--color-surface-4)] transition cursor-pointer"
              title={isExpanded
                ? t('eventDetail.restoreSize', { defaultValue: 'Exit full screen' })
                : t('eventDetail.expandSize', { defaultValue: 'Expand view' })}
              aria-label={isExpanded ? 'Exit full screen view' : 'Expand full screen view'}
            >
              {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>

            {/* Close modal */}
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-[var(--color-text-dim)] hover:text-white hover:bg-[rgba(244,63,94,0.20)] transition cursor-pointer"
              aria-label={t('eventDetail.close', { defaultValue: 'Close' })}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Article Body */}
        <div className="overflow-y-auto p-5 sm:p-8 space-y-7 custom-scrollbar">
          {isLoading ? (
            <div className="py-24 flex flex-col items-center justify-center space-y-3">
              <div
                className="w-10 h-10 border-2 rounded-full animate-spin"
                style={{ borderColor: 'var(--color-accent) transparent transparent transparent' }}
              />
              <p className="text-xs font-mono-code tracking-wider text-[var(--color-text-dim)]">
                {t('eventDetail.loading', { defaultValue: 'DECRYPTING INTELLIGENCE DOSSIER...' })}
              </p>
            </div>
          ) : error ? (
            <div
              className="p-8 rounded-xl border text-center space-y-3"
              style={{ backgroundColor: 'var(--color-surface-1)', borderColor: 'var(--color-critical-border)' }}
            >
              <AlertCircle size={32} className="mx-auto text-[var(--color-critical)]" />
              <p className="text-xs font-mono-code text-[var(--color-text-secondary)]">{error}</p>
            </div>
          ) : eventData ? (
            <>
              {/* Article Header & Headline */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono-code text-[var(--color-text-dim)] flex-wrap">
                  <span className="font-semibold text-[var(--color-accent)]">{sourceName}</span>
                  <span>•</span>
                  <span>{formattedDate}</span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-headline font-bold text-[var(--color-text-primary)] leading-snug tracking-tight">
                  {translateNewsText(eventData.summary, lang)}
                </h1>
              </div>

              {/* Editorial Hero Photography Frame */}
              <div
                className="relative h-64 sm:h-84 w-full rounded-xl overflow-hidden border"
                style={{ backgroundColor: 'var(--color-surface-1)', borderColor: 'var(--color-border-subtle)' }}
              >
                <img
                  src={imageUrl}
                  alt={eventData.summary}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = DEFAULT_EDITORIAL_FALLBACK;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#020617]/80 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* Dedicated Article Summary Card */}
              <div
                className="p-5 rounded-xl border space-y-3"
                style={{
                  backgroundColor: 'rgba(195, 192, 255, 0.05)',
                  borderColor: 'rgba(195, 192, 255, 0.18)',
                }}
              >
                <div className="flex items-center justify-between gap-2 flex-wrap pb-2 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}>
                  <div className="flex items-center gap-2">
                    <Newspaper size={16} style={{ color: 'var(--color-accent)' }} />
                    <h3 className="text-xs font-mono-code font-bold uppercase tracking-wider text-[var(--color-accent)]">
                      {t('eventDetail.articleSummary', { defaultValue: 'Executive Intelligence Summary' })}
                    </h3>
                  </div>

                  {eventData.primaryArticleId?.url && (
                    <a
                      href={eventData.primaryArticleId.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-mono-code font-bold text-[var(--color-accent)] hover:underline inline-flex items-center gap-1 transition-colors"
                    >
                      <span>{t('eventDetail.readOriginal', { defaultValue: 'Read Original Wire' })}</span>
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>

                {eventData.primaryArticleId?.excerpt ? (
                  <p className="text-sm font-body text-[var(--color-text-secondary)] leading-relaxed">
                    {translateNewsText(eventData.primaryArticleId.excerpt, lang)}
                  </p>
                ) : (
                  <div className="text-xs font-mono-code text-[var(--color-text-dim)] italic">
                    {eventData.primaryArticleId?.url ? (
                      <a
                        href={eventData.primaryArticleId.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--color-accent)] hover:underline inline-flex items-center gap-1 not-italic font-medium"
                      >
                        {t('eventDetail.summaryUnavailable', { defaultValue: 'Full dispatch summary available on original wire →' })}
                      </a>
                    ) : (
                      <span>{t('eventDetail.summaryUnavailable', { defaultValue: 'Summary unavailable.' })}</span>
                    )}
                  </div>
                )}
              </div>

              {/* What Happened: Verified Facts vs Reported Uncertainties */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Verified Claims */}
                <div
                  className="p-5 rounded-xl border space-y-3"
                  style={{
                    backgroundColor: 'rgba(16, 185, 129, 0.06)',
                    borderColor: 'rgba(16, 185, 129, 0.25)',
                  }}
                >
                  <div className="flex items-center gap-2 text-xs font-mono-code font-bold uppercase tracking-wider text-emerald-400">
                    <ShieldCheck size={15} className="text-emerald-400" />
                    <span>{t('eventDetail.verifiedFacts', { defaultValue: 'Corroborated Facts' })}</span>
                  </div>
                  {eventData.facts && eventData.facts.length > 0 ? (
                    <ul className="space-y-2 text-xs sm:text-sm text-[var(--color-text-secondary)]">
                      {translateNewsArray(eventData.facts, lang).map((fact, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-emerald-400 font-bold mt-0.5">•</span>
                          <span className="leading-relaxed">{fact}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs font-mono-code text-[var(--color-text-dim)] italic">
                      {t('eventDetail.noFacts', { defaultValue: 'No specific corroborated claims recorded.' })}
                    </p>
                  )}
                </div>

                {/* Reported Uncertainties */}
                <div
                  className="p-5 rounded-xl border space-y-3"
                  style={{
                    backgroundColor: 'rgba(245, 158, 11, 0.06)',
                    borderColor: 'rgba(245, 158, 11, 0.25)',
                  }}
                >
                  <div className="flex items-center gap-2 text-xs font-mono-code font-bold uppercase tracking-wider text-amber-400">
                    <HelpCircle size={15} className="text-amber-400" />
                    <span>{t('eventDetail.reportedUncertainties', { defaultValue: 'Reported Uncertainties' })}</span>
                  </div>
                  {eventData.uncertainties && eventData.uncertainties.length > 0 ? (
                    <ul className="space-y-2 text-xs sm:text-sm text-[var(--color-text-secondary)]">
                      {translateNewsArray(eventData.uncertainties, lang).map((unc, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-amber-400 font-bold mt-0.5">•</span>
                          <span className="leading-relaxed">{unc}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs font-mono-code text-[var(--color-text-dim)] italic">
                      {t('eventDetail.noUncertainties', { defaultValue: 'No unverified claims or uncertainties logged.' })}
                    </p>
                  )}
                </div>
              </div>

              {/* Geographic & Sector Entities */}
              <div
                className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-xl border"
                style={{
                  backgroundColor: 'var(--color-surface-2)',
                  borderColor: 'var(--color-border)',
                }}
              >
                <div>
                  <div className="text-xs font-mono-code font-bold uppercase tracking-wider text-[var(--color-text-dim)] flex items-center gap-1.5 mb-2.5">
                    <MapPin size={13} style={{ color: 'var(--color-accent)' }} />
                    {t('eventDetail.countriesRegions', { defaultValue: 'Countries & Regions' })}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {[...(eventData.countries || []), ...(eventData.regions || [])].map((item, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-0.5 rounded-md text-xs font-mono-code font-semibold border"
                        style={{
                          backgroundColor: 'var(--color-surface-4)',
                          borderColor: 'rgba(255, 255, 255, 0.08)',
                          color: 'var(--color-text-primary)',
                        }}
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-mono-code font-bold uppercase tracking-wider text-[var(--color-text-dim)] flex items-center gap-1.5 mb-2.5">
                    <Layers size={13} style={{ color: 'var(--color-accent)' }} />
                    {t('eventDetail.affectedSectors', { defaultValue: 'Affected Sectors' })}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(eventData.sectors || []).map((sector, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-0.5 rounded-md text-xs font-mono-code font-semibold border"
                        style={{
                          backgroundColor: 'rgba(56, 189, 248, 0.10)',
                          borderColor: 'rgba(56, 189, 248, 0.25)',
                          color: '#38bdf8',
                        }}
                      >
                        {sector}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-mono-code font-bold uppercase tracking-wider text-[var(--color-text-dim)] flex items-center gap-1.5 mb-2.5">
                    <Building2 size={13} style={{ color: 'var(--color-accent)' }} />
                    {t('eventDetail.keyEntities', { defaultValue: 'Key Named Entities' })}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(eventData.entities || []).map((entity, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-0.5 rounded-md text-xs font-mono-code border"
                        style={{
                          backgroundColor: 'var(--color-surface-4)',
                          borderColor: 'rgba(255, 255, 255, 0.08)',
                          color: 'var(--color-text-secondary)',
                        }}
                      >
                        {entity}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Cross-Domain Impact Evaluations */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Cpu size={16} style={{ color: 'var(--color-accent)' }} />
                  <h3 className="text-sm font-mono-code font-bold uppercase tracking-wider text-[var(--color-text-primary)]">
                    {t('eventDetail.domainImpacts', { defaultValue: 'Systemic Sector Impact Evaluations' })}
                  </h3>
                </div>

                {eventData.impacts && eventData.impacts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {eventData.impacts.map((impact) => {
                      const domainLabel = t(`domains.${impact.domain}`, { defaultValue: impact.domain });
                      const localizedExp = translateNewsText(impact.explanation, lang);
                      return (
                        <div
                          key={impact._id || impact.domain}
                          className="p-4 rounded-xl border space-y-2.5 glass-card"
                          style={{ borderColor: 'var(--color-border)' }}
                        >
                          <div className="flex items-center justify-between gap-2 pb-2 border-b" style={{ borderColor: 'var(--color-border-subtle)' }}>
                            <span
                              className="text-xs font-mono-code font-bold uppercase px-2 py-0.5 rounded border"
                              style={{
                                backgroundColor: 'var(--color-accent-bg)',
                                borderColor: 'var(--color-accent-border)',
                                color: 'var(--color-accent)',
                              }}
                            >
                              {domainLabel}
                            </span>
                            <DirectionBadge direction={impact.direction} />
                          </div>
                          <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed">
                            {localizedExp}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs font-mono-code text-[var(--color-text-dim)] italic">
                    {t('eventDetail.noImpacts', { defaultValue: 'No qualitative domain impacts assessed for this event yet.' })}
                  </p>
                )}
              </div>

              {/* Source Attribution & Direct Wire Link */}
              {eventData.primaryArticleId?.url && (
                <div
                  className="p-4 rounded-xl border flex items-center justify-between flex-wrap gap-3 text-xs font-mono-code"
                  style={{
                    backgroundColor: 'var(--color-surface-2)',
                    borderColor: 'var(--color-border)',
                  }}
                >
                  <span className="text-[var(--color-text-dim)]">
                    Wire Harvester: <strong className="text-white">{sourceName}</strong>
                  </span>
                  <a
                    href={eventData.primaryArticleId.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg font-bold transition-all duration-200"
                    style={{
                      backgroundColor: 'var(--color-accent)',
                      color: '#020617',
                    }}
                  >
                    <span>{t('eventDetail.readOriginal', { defaultValue: 'Read Full Wire Dispatch' })}</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
