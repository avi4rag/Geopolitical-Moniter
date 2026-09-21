import React from 'react';

// ─── Situation Room Radar Scope Terminal ─────────────────────────────────────
// Dedicated intelligence terminal with coordinate readouts, rotating sweep cone,
// real event telemetry binding, and labeled signal nodes.
// ─────────────────────────────────────────────────────────────────────────────

export default function HeroRadarGraphic({ event, className = '' }) {
  const eventSector = event?.sectors?.[0] || 'CRITICAL';
  const eventCountry = event?.countries?.[0] || 'THEATER';
  const eventType = event?.eventType ? event.eventType.replace(/_/g, '-') : 'SIGNAL-HOT';

  return (
    <div
      className={`terminal-panel rounded-2xl p-4 sm:p-5 flex flex-col justify-between border border-white/10 relative overflow-hidden select-none shadow-2xl ${className}`}
      style={{
        background: 'rgba(11, 16, 32, 0.85)',
      }}
    >
      {/* Top Telemetry Header */}
      <div className="flex items-start justify-between text-[10px] font-mono-code text-slate-400 pb-2 border-b border-white/[0.06] z-10">
        <div>
          <div className="text-rose-400 font-bold tracking-wider">T-AZM 048°</div>
          <div className="text-[9px] text-slate-400 mt-0.5 uppercase tracking-widest">
            GEO: {eventCountry}
          </div>
        </div>
        <div className="text-right text-[10px] font-mono-code">
          <span className="text-slate-400 uppercase tracking-wider">
            REF: {eventType}
          </span>
          <span className="text-rose-400 ml-1">┐</span>
        </div>
      </div>

      {/* Center Radar Scope */}
      <div className="relative w-full aspect-square max-w-[240px] mx-auto my-2 flex items-center justify-center">
        {/* Subtle ambient red/navy glow behind scope */}
        <div
          className="absolute inset-0 rounded-full opacity-30 blur-2xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(244,63,94,0.3) 0%, rgba(56,189,248,0.15) 60%, transparent 80%)' }}
        />

        <svg
          viewBox="0 0 300 300"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            {/* Radar sweep cone gradient in coral */}
            <linearGradient id="coralRadarSweep" x1="150" y1="150" x2="280" y2="150" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.40" />
            </linearGradient>

            {/* Core glow */}
            <radialGradient id="scopeCenterGlow" cx="150" cy="150" r="130" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.08" />
              <stop offset="70%" stopColor="#0b1020" stopOpacity="0.80" />
              <stop offset="100%" stopColor="#070a12" stopOpacity="1" />
            </radialGradient>
          </defs>

          {/* Scope Disc Background */}
          <circle cx="150" cy="150" r="135" fill="url(#scopeCenterGlow)" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1" />

          {/* Concentric Range Rings */}
          <circle cx="150" cy="150" r="130" stroke="rgba(255, 255, 255, 0.07)" strokeWidth="1" strokeDasharray="3 3" />
          <circle cx="150" cy="150" r="95" stroke="rgba(255, 255, 255, 0.09)" strokeWidth="1" />
          <circle cx="150" cy="150" r="60" stroke="rgba(244, 63, 94, 0.20)" strokeWidth="1" strokeDasharray="2 2" />
          <circle cx="150" cy="150" r="25" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="1" />
          <circle cx="150" cy="150" r="4" fill="#f43f5e" />

          {/* Expanding Wavefront Ring */}
          <circle cx="150" cy="150" r="80" stroke="rgba(244, 63, 94, 0.35)" strokeWidth="1" className="animate-radarPing" style={{ transformOrigin: 'center' }} />

          {/* Coordinate Crosshairs */}
          <line x1="150" y1="15" x2="150" y2="285" stroke="rgba(255, 255, 255, 0.10)" strokeWidth="0.8" strokeDasharray="2 3" />
          <line x1="15" y1="150" x2="285" y2="150" stroke="rgba(255, 255, 255, 0.10)" strokeWidth="0.8" strokeDasharray="2 3" />

          {/* Rotating Radar Sweep Beam */}
          <g className="animate-radarSweep" style={{ transformOrigin: '150px 150px' }}>
            <path
              d="M 150 150 L 280 150 A 130 130 0 0 0 242 58 Z"
              fill="url(#coralRadarSweep)"
              opacity="0.65"
            />
            <line x1="150" y1="150" x2="280" y2="150" stroke="#f43f5e" strokeWidth="1.5" opacity="0.85" />
          </g>

          {/* Active Hotspot Blip 1: Event Target */}
          <g transform="translate(195, 115)">
            <circle cx="0" cy="0" r="3.5" fill="#f43f5e" className="animate-pulse" />
            <circle cx="0" cy="0" r="8" stroke="#f43f5e" strokeWidth="1" opacity="0.5" className="animate-ping" />
            <line x1="0" y1="0" x2="12" y2="-10" stroke="#f43f5e" strokeWidth="0.8" opacity="0.6" />
            <text x="14" y="-12" fill="#f43f5e" fontSize="8" fontFamily="monospace" fontWeight="bold">
              [{eventSector.slice(0, 8)}] HOT
            </text>
          </g>

          {/* Blip 2: Cyan maritime/corridor node */}
          <g transform="translate(95, 195)">
            <circle cx="0" cy="0" r="3" fill="#38bdf8" />
            <circle cx="0" cy="0" r="6" stroke="#38bdf8" strokeWidth="0.7" opacity="0.3" />
          </g>

          {/* Blip 3: Amber energy hub */}
          <g transform="translate(110, 95)">
            <circle cx="0" cy="0" r="2.5" fill="#fbbf24" />
          </g>
        </svg>
      </div>

      {/* Bottom Telemetry Footer */}
      <div className="flex items-center justify-between text-[9px] font-mono-code text-slate-400 pt-2 border-t border-white/[0.06] z-10">
        <span className="uppercase tracking-widest text-slate-400">
          SWEEP: 12.8GHZ
        </span>
        <span className="text-rose-400 font-bold uppercase tracking-wider flex items-center gap-1">
          <span>RADAR LOCK</span>
          <span>┘</span>
        </span>
      </div>
    </div>
  );
}
