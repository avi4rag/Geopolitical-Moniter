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

// ─── Situation Room Horizontal Ingest Ticker ──────────────────────────────────
// Populated with real live events. Features the RAW INGEST terminal badge,
// domain-colored signal points, and '///' stream delimiters.
// ─────────────────────────────────────────────────────────────────────────────

const DOMAIN_COLOR = {
  ENERGY: '#fbbf24',
  DEFENSE: '#f43f5e',
  TRADE: '#38bdf8',
  TECHNOLOGY: '#c084fc',
  CLIMATE: '#34d399',
  FINANCE: '#38bdf8',
  DIPLOMACY: '#c084fc',
};

export default function ActiveEventsTicker({ events = [], onSelectEvent }) {
  const { i18n } = useTranslation();
  const scrollRef = useRef(null);
  const lang = i18n.language || 'en';

  if (!events || events.length === 0) return null;

  const handleScrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -360, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 360, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full glass-ticker py-2 px-3 sm:px-6 flex items-center gap-3 select-none overflow-hidden border-y border-white/[0.08] bg-slate-950/80">
      {/* RAW INGEST Terminal Badge */}
      <div className="flex items-center gap-2 shrink-0 pr-3 border-r border-white/10 font-mono-code text-[10px] font-bold tracking-widest">
        <span className="px-2 py-0.5 rounded bg-slate-900 border border-white/15 text-slate-200 uppercase">
          RAW INGEST
        </span>
      </div>

      {/* Left Scroll Button */}
      <button
        onClick={handleScrollLeft}
        className="hidden md:flex p-1 rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
        aria-label="Scroll left"
      >
        <ChevronLeft size={13} />
      </button>

      {/* Events Stream Horizontal Container */}
      <div
        ref={scrollRef}
        className="flex items-center gap-4 overflow-x-auto no-scrollbar py-0.5 scroll-smooth flex-1 text-xs font-mono-code"
      >
        {events.map((event, idx) => {
          const headline = translateNewsText(event.summary, lang);
          const domain = event.sectors?.[0]?.toUpperCase() || event.eventType?.toUpperCase() || 'INTEL';
          const dotColor = DOMAIN_COLOR[domain] || '#38bdf8';
          const tMinus = timeAgo(event.createdAt);

          return (
            <React.Fragment key={event._id}>
              <button
                onClick={() => onSelectEvent(event)}
                className="inline-flex items-center gap-2 hover:text-white transition-colors cursor-pointer shrink-0 text-left group"
              >
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: dotColor }} />
                <span className="text-slate-400 font-bold uppercase">[{domain}]</span>
                <span className="text-slate-300 group-hover:text-rose-200 transition-colors max-w-[280px] sm:max-w-[420px] truncate">
                  {headline}
                </span>
                <span className="text-[10px] text-slate-500">
                  ({tMinus})
                </span>
              </button>

              {idx < events.length - 1 && (
                <span className="text-slate-600 font-bold tracking-widest shrink-0">///</span>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Right Scroll Button */}
      <button
        onClick={handleScrollRight}
        className="hidden md:flex p-1 rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
        aria-label="Scroll right"
      >
        <ChevronRight size={13} />
      </button>
    </div>
  );
}
