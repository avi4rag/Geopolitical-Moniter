import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import SeverityBadge from '../common/SeverityBadge.jsx';
import CredibilityBadge from '../common/CredibilityBadge.jsx';
import { translateNewsText, translateNewsArray } from '../../i18n/newsContentTranslations.js';
import { getNewsEditorialImage } from '../../lib/newsImages.js';

// ─── Full-Scale Editorial Featured Lead Story ─────────────────────────────────
// True newspaper-style lead story hero:
// - Category & Publication Date with vertical indigo accent
// - Massive, bold, highly legible headline typography (32px–40px)
// - Factual summary and verified claims
// - Geographic & sector tags
// - Professional "Read Article →" primary action
// - High-definition editorial geopolitical image frame
// ─────────────────────────────────────────────────────────────────────────────

export default function FeaturedStory({ event, onSelect }) {
  const { t, i18n } = useTranslation();
  if (!event) return null;

  const lang = i18n.language || 'en';
  const localizedSummary = translateNewsText(event.summary, lang);
  const localizedFacts = translateNewsArray(event.facts || [], lang);
  const imageUrl = getNewsEditorialImage(event);
  const sourceName = event.primaryArticleId?.sourceId?.name || 'World News Wire';

  const categoryName = event.sectors && event.sectors.length > 0
    ? event.sectors[0]
    : 'World Intelligence';

  const formattedDate = event.createdAt
    ? new Date(event.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Recent';

  // Hashtags / Sector Pills
  const tags = [
    ...(event.sectors || []),
    ...(event.countries || []),
  ].slice(0, 3);

  return (
    <section className="w-full pb-8 border-b border-slate-200">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* Left / Content Column (7 cols on desktop) */}
        <div className="lg:col-span-7 space-y-4 sm:space-y-5">
          {/* Top Kicker Bar */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="h-3.5 w-1 bg-indigo-600 rounded-full" />
              <span className="text-[11px] font-mono font-bold tracking-widest text-indigo-700 uppercase">
                {t('feed.bestOfWeek', { defaultValue: 'LEAD INTELLIGENCE' })}
              </span>
            </div>

            <span className="text-slate-300">•</span>

            <span className="text-xs font-semibold text-slate-700">
              {categoryName}
            </span>

            <span className="text-slate-300">•</span>

            <span className="text-xs text-slate-500 font-mono">
              {formattedDate}
            </span>

            <div className="ml-auto hidden sm:flex items-center gap-2">
              <SeverityBadge severity={event.severity} size="sm" />
              <CredibilityBadge label={event.credibilityLabel} score={event.credibilityScore} />
            </div>
          </div>

          {/* Large Headline Typography */}
          <h1
            onClick={() => onSelect && onSelect(event)}
            className="text-2xl sm:text-3xl lg:text-[34px] xl:text-[38px] font-black text-slate-950 leading-[1.15] tracking-tight hover:text-indigo-600 transition-colors cursor-pointer"
          >
            {localizedSummary}
          </h1>

          {/* Factual Insights / Claims */}
          {localizedFacts && localizedFacts.length > 0 && (
            <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs sm:text-sm text-slate-700 leading-relaxed space-y-1.5">
              <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-emerald-700 font-bold">
                <ShieldCheck size={13} className="text-emerald-600" />
                <span>{t('eventDetail.verifiedFacts', { defaultValue: 'VERIFIED FINDINGS' })}</span>
              </div>
              <p className="line-clamp-2 sm:line-clamp-3">
                {localizedFacts.join(' • ')}
              </p>
            </div>
          )}

          {/* Tags & Key Entities */}
          {tags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap pt-1">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-600 text-xs font-medium"
                >
                  #{tag.replace(/\s+/g, '')}
                </span>
              ))}
            </div>
          )}

          {/* Bottom Action & Source Attribution */}
          <div className="pt-3 flex items-center justify-between flex-wrap gap-4">
            <button
              onClick={() => onSelect && onSelect(event)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm transition-all duration-150 cursor-pointer shadow-xs hover:gap-2.5"
            >
              <span>{t('feed.readArticle', { defaultValue: 'Read Article' })}</span>
              <ArrowRight size={14} />
            </button>

            <span className="text-xs text-slate-500 font-mono">
              Source: <span className="font-semibold text-slate-700">{sourceName}</span>
            </span>
          </div>
        </div>

        {/* Right / Hero Image Visual Column (5 cols on desktop) */}
        <div
          onClick={() => onSelect && onSelect(event)}
          className="lg:col-span-5 relative group cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 shadow-sm h-64 sm:h-80 lg:h-[360px]"
        >
          {/* High-Resolution Geopolitical Photography */}
          <img
            src={imageUrl}
            alt={event.summary}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
          />

          {/* Subtle bottom vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />

          {/* Bottom Floating Source Badge */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
            <span className="px-2.5 py-1 rounded-md bg-slate-900/80 backdrop-blur-sm border border-slate-700 text-[11px] font-mono font-medium">
              {sourceName}
            </span>

            <span className="text-[11px] text-amber-300 font-mono font-bold flex items-center gap-1 bg-slate-900/80 px-2.5 py-1 rounded-md backdrop-blur-sm">
              <span>EXPLORE</span>
              <ArrowRight size={11} />
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
