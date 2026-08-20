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
} from 'lucide-react';
import apiClient from '../../lib/apiClient.js';
import SeverityBadge from '../common/SeverityBadge.jsx';
import DirectionBadge from '../common/DirectionBadge.jsx';
import CredibilityBadge from '../common/CredibilityBadge.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { translateNewsText, translateNewsArray } from '../../i18n/newsContentTranslations.js';
import { getNewsEditorialImage } from '../../lib/newsImages.js';

// ─── Editorial Article Dossier Modal ──────────────────────────────────────────
// Clean news article presentation matching modern publication standards.
// ─────────────────────────────────────────────────────────────────────────────

export default function EventDetailModal({ eventId, onClose }) {
  const { t, i18n } = useTranslation();
  const [eventData, setEventData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const lang = i18n.language || 'en';
  const { isAuthenticated, isBookmarked, toggleBookmark } = useAuth();
  const bookmarked = isBookmarked ? isBookmarked(eventId) : false;

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
    : t('eventDetail.headerBadge', { defaultValue: 'EVENT DOSSIER' });

  const imageUrl = getNewsEditorialImage(eventData);
  const sourceName = eventData?.primaryArticleId?.sourceId?.name || 'World News Wire';

  const formattedDate = eventData?.createdAt
    ? new Date(eventData.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Sticky Bar */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between shrink-0 bg-white/95 backdrop-blur-md">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full">
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
              className="p-2 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
            >
              {copied ? <Check size={16} className="text-emerald-600" /> : <Share2 size={16} />}
            </button>

            {/* Bookmark button */}
            {isAuthenticated && (
              <button
                onClick={handleBookmarkToggle}
                className={`p-2 rounded-full transition cursor-pointer ${
                  bookmarked
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
                title={bookmarked ? t('eventDetail.removeBookmark') : t('eventDetail.bookmark')}
              >
                <Bookmark size={16} fill={bookmarked ? 'currentColor' : 'none'} />
              </button>
            )}

            {/* Close modal */}
            <button
              onClick={onClose}
              className="p-2 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
              aria-label={t('eventDetail.close', { defaultValue: 'Close' })}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Article Body */}
        <div className="overflow-y-auto p-5 sm:p-8 space-y-7">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 space-y-3">
              <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-slate-500">{t('eventDetail.loading', { defaultValue: 'Loading article dossier...' })}</p>
            </div>
          ) : error ? (
            <div className="p-8 rounded-2xl border border-rose-200 bg-rose-50 text-center text-rose-700">
              <AlertCircle size={32} className="mx-auto mb-2 text-rose-600" />
              <p className="text-xs">{error}</p>
            </div>
          ) : eventData ? (
            <>
              {/* Article Header & Headline */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                  <span className="font-semibold text-slate-800">{sourceName}</span>
                  <span>•</span>
                  <span>{formattedDate}</span>
                </div>

                <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-black text-slate-950 leading-tight tracking-tight">
                  {translateNewsText(eventData.summary, lang)}
                </h1>
              </div>

              {/* Editorial Hero Photography Frame */}
              <div className="relative h-64 sm:h-80 w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-200">
                <img
                  src={imageUrl}
                  alt={eventData.summary}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Dedicated Article Summary Card */}
              <div className="p-5 rounded-2xl border border-indigo-100 bg-indigo-50/50 space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap pb-2 border-b border-indigo-100">
                  <div className="flex items-center gap-2">
                    <Newspaper size={16} className="text-indigo-600" />
                    <h3 className="text-xs font-bold font-mono tracking-wide text-slate-900 uppercase">
                      {t('eventDetail.articleSummary', { defaultValue: 'Article Summary' })}
                    </h3>
                  </div>

                  {eventData.primaryArticleId?.url && (
                    <a
                      href={eventData.primaryArticleId.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-indigo-700 hover:text-indigo-900 hover:underline inline-flex items-center gap-1 transition-colors"
                    >
                      <span>{t('eventDetail.readOriginal', { defaultValue: 'Read Original Article' })}</span>
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>

                {eventData.primaryArticleId?.excerpt ? (
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {translateNewsText(eventData.primaryArticleId.excerpt, lang)}
                  </p>
                ) : (
                  <div className="text-xs text-slate-500 italic">
                    {eventData.primaryArticleId?.url ? (
                      <a
                        href={eventData.primaryArticleId.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-700 hover:underline inline-flex items-center gap-1 font-medium not-italic"
                      >
                        {t('eventDetail.summaryUnavailable', { defaultValue: 'Summary unavailable. Read original article →' })}
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
                <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-emerald-700">
                    <ShieldCheck size={15} className="text-emerald-600" />
                    <span>{t('eventDetail.verifiedFacts', { defaultValue: 'Verified Claims & Facts' })}</span>
                  </div>
                  {eventData.facts && eventData.facts.length > 0 ? (
                    <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
                      {translateNewsArray(eventData.facts, lang).map((fact, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-emerald-600 font-bold mt-0.5">•</span>
                          <span className="leading-relaxed">{fact}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-400 italic">{t('eventDetail.noFacts', { defaultValue: 'No specific claims recorded.' })}</p>
                  )}
                </div>

                {/* Reported Uncertainties */}
                <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-amber-700">
                    <HelpCircle size={15} className="text-amber-600" />
                    <span>{t('eventDetail.reportedUncertainties', { defaultValue: 'Reported Uncertainties' })}</span>
                  </div>
                  {eventData.uncertainties && eventData.uncertainties.length > 0 ? (
                    <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
                      {translateNewsArray(eventData.uncertainties, lang).map((unc, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-amber-600 font-bold mt-0.5">•</span>
                          <span className="leading-relaxed">{unc}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-400 italic">{t('eventDetail.noUncertainties', { defaultValue: 'No uncertainties recorded.' })}</p>
                  )}
                </div>
              </div>

              {/* Geographic & Sector Entities */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <div className="text-xs font-semibold text-slate-600 flex items-center gap-1.5 mb-2">
                    <MapPin size={13} className="text-indigo-600" />
                    {t('eventDetail.countriesRegions', { defaultValue: 'Countries & Regions' })}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {[...(eventData.countries || []), ...(eventData.regions || [])].map((item, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-0.5 rounded-md bg-white border border-slate-200 text-slate-800 text-xs font-medium"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-slate-600 flex items-center gap-1.5 mb-2">
                    <Layers size={13} className="text-indigo-600" />
                    {t('eventDetail.affectedSectors', { defaultValue: 'Affected Sectors' })}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(eventData.sectors || []).map((sector, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 text-xs font-mono"
                      >
                        {sector}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-slate-600 flex items-center gap-1.5 mb-2">
                    <Building2 size={13} className="text-indigo-600" />
                    {t('eventDetail.keyEntities', { defaultValue: 'Key Named Entities' })}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(eventData.entities || []).map((entity, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 text-xs"
                      >
                        {entity}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Cross-Domain Impact Evaluations */}
              <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-950 flex items-center gap-2">
                  <Cpu size={16} className="text-indigo-600" />
                  <span>{t('eventDetail.domainImpacts', { defaultValue: 'Domain Impact Assessments' })}</span>
                </h3>

                {eventData.impacts && eventData.impacts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {eventData.impacts.map((impact) => {
                      const domainLabel = t(`domains.${impact.domain}`, { defaultValue: impact.domain });
                      const localizedExp = translateNewsText(impact.explanation, lang);
                      return (
                        <div
                          key={impact._id}
                          className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2.5"
                        >
                          <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100">
                            <span className="text-xs font-mono font-bold uppercase text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-100">
                              {domainLabel}
                            </span>
                            <DirectionBadge direction={impact.direction} />
                          </div>
                          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                            {localizedExp}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">
                    {t('eventDetail.noImpacts', { defaultValue: 'No domain impacts assessed for this event yet.' })}
                  </p>
                )}
              </div>

              {/* Source Attribution & Direct Wire Link */}
              {eventData.primaryArticleId?.url && (
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between flex-wrap gap-3 text-xs">
                  <span className="text-slate-600">
                    Source: <strong className="text-slate-900">{sourceName}</strong>
                  </span>
                  <a
                    href={eventData.primaryArticleId.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition"
                  >
                    <span>{t('eventDetail.readOriginal', { defaultValue: 'Read Full Wire Article' })}</span>
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
