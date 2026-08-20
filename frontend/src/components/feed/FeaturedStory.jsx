import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Globe } from 'lucide-react';
import { translateNewsText } from '../../i18n/newsContentTranslations.js';

// ─── Reference Design Featured Lead Hero ──────────────────────────────────────
// Replicates the left hero section from the reference image:
// - "BEST OF THE WEEK" / "LEAD INTELLIGENCE" tag with left indigo accent
// - Category • Time metadata
// - Large readable headline
// - Hashtags (#Semiconductors, #Trade, etc.)
// - "Read article ->" pill button
// - Ethereal floating holographic sphere graphic
// ─────────────────────────────────────────────────────────────────────────────

export default function FeaturedStory({ event, onSelect }) {
  const { t, i18n } = useTranslation();
  if (!event) return null;

  const lang = i18n.language || 'en';
  const localizedSummary = translateNewsText(event.summary, lang);

  const categoryName = event.sectors && event.sectors.length > 0
    ? event.sectors[0]
    : 'World Intelligence';

  // Hashtags from sectors & countries
  const tags = [
    ...(event.sectors || []),
    ...(event.countries || []),
  ].slice(0, 3);

  return (
    <section className="relative overflow-hidden py-4 sm:py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Typography & Content (7 cols) */}
        <div className="lg:col-span-7 space-y-4 sm:space-y-5">
          {/* "BEST OF THE WEEK" / "LEAD INTELLIGENCE" Kicker Badge */}
          <div className="flex items-center gap-2">
            <div className="h-4 w-1 bg-indigo-600 rounded-full" />
            <span className="text-[11px] font-bold tracking-widest text-slate-800 uppercase font-mono">
              {t('feed.bestOfWeek', { defaultValue: 'BEST OF THE WEEK' })}
            </span>
          </div>

          {/* Category & Timestamp */}
          <div className="text-xs font-semibold text-indigo-600 flex items-center gap-1.5">
            <span>{categoryName}</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-500 font-normal">
              {event.createdAt ? new Date(event.createdAt).toLocaleDateString() : 'Recent'}
            </span>
          </div>

          {/* Massive Headline Typography */}
          <h1
            onClick={() => onSelect && onSelect(event)}
            className="text-2xl sm:text-3xl lg:text-[36px] font-black text-slate-950 leading-[1.18] tracking-tight hover:text-indigo-600 transition-colors cursor-pointer"
          >
            {localizedSummary}
          </h1>

          {/* Hashtags */}
          {tags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap pt-1">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  #{tag.replace(/\s+/g, '')}
                </span>
              ))}
            </div>
          )}

          {/* "Read article →" Pill Button */}
          <div className="pt-2">
            <button
              onClick={() => onSelect && onSelect(event)}
              className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-900 font-bold text-xs sm:text-sm transition-all duration-200 cursor-pointer shadow-sm group hover:scale-[1.02]"
            >
              <span>{t('feed.readArticle', { defaultValue: 'Read article' })}</span>
              <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-slate-900 group-hover:translate-x-0.5 transition-transform shadow-xs">
                <ArrowRight size={13} />
              </span>
            </button>
          </div>
        </div>

        {/* Right Column: Central Glowing Holographic Sphere (5 cols) */}
        <div className="lg:col-span-5 flex items-center justify-center relative py-4 lg:py-0">
          <div className="relative flex items-center justify-center">
            {/* The Ethereal Floating Holographic Sphere */}
            <div className="holographic-sphere flex items-center justify-center">
              {/* Internal subtle continent outline */}
              <Globe
                size={140}
                className="text-indigo-500/20 stroke-1 pointer-events-none"
              />
            </div>

            {/* Ambient soft glow backdrop */}
            <div className="absolute inset-0 bg-indigo-400/15 blur-3xl rounded-full pointer-events-none -z-10" />
          </div>
        </div>
      </div>
    </section>
  );
}
