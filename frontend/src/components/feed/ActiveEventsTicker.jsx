import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, Radio } from 'lucide-react';
import { translateNewsText } from '../../i18n/newsContentTranslations.js';

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'JUST NOW';
  if (m < 60) return `${m}M AGO`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}H AGO`;
  return `${Math.floor(h / 24)}D AGO`;
}

const SEV_COLOR = {
  CRITICAL: '#e11d48',
  HIGH: '#f59e0b',
  MEDIUM: '#38bdf8',
  LOW: '#10b981',
};

// ─── Horizontal Active Events Ticker ──────────────────────────────────────────
// Controlled horizontal ticker populated with real live events.
// Supports manual horizontal drag/scroll and left/right button control.
// ─────────────────────────────────────────────────────────────────────────────

export default function ActiveEventsTicker({ events = [], onSelectEvent }) {
  const { i18n } = useTranslation();
  const scrollRef = useRef(null);
  const lang = i18n.language || 'en';

  if (!events || events.length === 0) return null;

  const handleScrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full glass-ticker py-2 px-2 sm:px-4 flex items-center gap-2 select-none overflow-hidden">
      {/* Ticker Header Tag */}
      <div className="flex items-center gap-1.5 shrink-0 pr-3 border-r border-white/10 font-mono-code text-[10px] font-bold tracking-wider">
        <Radio size={12} className="text-rose-500 animate-pulse" />
        <span className="text-white hidden sm:inline">LIVE WIRE</span>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
      </div>

      {/* Left Scroll Button */}
      <button
        onClick={handleScrollLeft}
        className="hidden md:flex p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
        aria-label="Scroll left"
      >
        <ChevronLeft size={14} />
      </button>

      {/* Events Carousel Container */}
      <div
        ref={scrollRef}
        className="flex items-center gap-3 overflow-x-auto no-scrollbar py-0.5 scroll-smooth"
      >
        {events.map((event) => {
          const headline = translateNewsText(event.summary, lang);
          const sector = event.eventType?.replace(/_/g, ' ') || 'INTEL';
          const sevColor = SEV_COLOR[event.severity] || '#38bdf8';
          const tMinus = timeAgo(event.createdAt);

          return (
            <button
              key={event._id}
              onClick={() => onSelectEvent(event)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-md border border-white/5 hover:border-white/20 bg-slate-900/60 hover:bg-slate-800/80 transition-all cursor-pointer shrink-0 text-left group"
            >
              {/* Sector indicator badge */}
              <span
                className="text-[9px] font-mono-code font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                style={{
                  backgroundColor: `${sevColor}20`,
                  color: sevColor,
                  border: `1px solid ${sevColor}40`,
                }}
              >
                {sector}
              </span>

              {/* Headline snippet */}
              <span className="text-xs text-slate-300 group-hover:text-white transition-colors max-w-[240px] sm:max-w-[320px] truncate font-medium">
                {headline}
              </span>

              {/* Time */}
              <span className="text-[10px] font-mono-code text-slate-500 shrink-0">
                {tMinus}
              </span>
            </button>
          );
        })}
      </div>

      {/* Right Scroll Button */}
      <button
        onClick={handleScrollRight}
        className="hidden md:flex p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
        aria-label="Scroll right"
      >
        <ChevronRight size={14} />
      </button>
    </div>
  );
}
