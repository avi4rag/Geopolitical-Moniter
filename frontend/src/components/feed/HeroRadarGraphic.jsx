import React from 'react';

// ─── Abstract Geopolitical Radar / Signal Detection Visualization ────────────
// Subtle, restrained SVG radar graphic representing global signal propagation.
// Features concentric coordinate rings, slow rotating sweep beam, and geo-nodes.
// ─────────────────────────────────────────────────────────────────────────────

export default function HeroRadarGraphic({ activeSector = 'GLOBAL', className = '' }) {
  return (
    <div className={`relative flex items-center justify-center select-none pointer-events-none overflow-hidden ${className}`}>
      {/* Ambient background glow */}
      <div
        className="absolute w-72 h-72 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(225,29,72,0.3) 0%, rgba(99,102,241,0.15) 60%, transparent 80%)' }}
      />

      <svg
        viewBox="0 0 400 400"
        className="w-full h-full max-w-[380px] max-h-[380px]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          {/* Radar sweep gradient */}
          <linearGradient id="radarSweepGrad" x1="200" y1="200" x2="380" y2="200" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#c3c0ff" stopOpacity="0" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.45" />
          </linearGradient>

          {/* Core pulse gradient */}
          <radialGradient id="corePulseGrad" cx="200" cy="200" r="160" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#e11d48" stopOpacity="0.12" />
            <stop offset="60%" stopColor="#38bdf8" stopOpacity="0.04" />
            <stop offset="100%" stopColor="#020617" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient background disc */}
        <circle cx="200" cy="200" r="175" fill="url(#corePulseGrad)" />

        {/* Outer and inner concentric radar range rings */}
        <circle cx="200" cy="200" r="175" stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="4 4" />
        <circle cx="200" cy="200" r="130" stroke="rgba(255,255,255,0.10)" strokeWidth="1" />
        <circle cx="200" cy="200" r="85" stroke="rgba(195,192,255,0.15)" strokeWidth="1" strokeDasharray="3 3" />
        <circle cx="200" cy="200" r="40" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
        <circle cx="200" cy="200" r="6" fill="var(--color-accent, #c3c0ff)" />

        {/* Dynamic expanding wavefront rings */}
        <circle cx="200" cy="200" r="110" stroke="rgba(56,189,248,0.25)" strokeWidth="1" className="animate-radarPing" style={{ transformOrigin: 'center' }} />
        <circle cx="200" cy="200" r="150" stroke="rgba(225,29,72,0.15)" strokeWidth="1" className="animate-radarPing" style={{ transformOrigin: 'center', animationDelay: '1.2s' }} />

        {/* Technical Coordinate Axes & Crosshairs */}
        <line x1="200" y1="15" x2="200" y2="385" stroke="rgba(255,255,255,0.12)" strokeWidth="0.8" strokeDasharray="2 4" />
        <line x1="15" y1="200" x2="385" y2="200" stroke="rgba(255,255,255,0.12)" strokeWidth="0.8" strokeDasharray="2 4" />

        {/* Diagonal Bearing Ticks */}
        <line x1="80" y1="80" x2="320" y2="320" stroke="rgba(255,255,255,0.05)" strokeWidth="0.6" />
        <line x1="320" y1="80" x2="80" y2="320" stroke="rgba(255,255,255,0.05)" strokeWidth="0.6" />

        {/* Rotating Radar Sweep Cone */}
        <g className="animate-radarSweep" style={{ transformOrigin: '200px 200px' }}>
          {/* Faint wedge path */}
          <path
            d="M 200 200 L 375 200 A 175 175 0 0 0 324 76 Z"
            fill="url(#radarSweepGrad)"
            opacity="0.35"
          />
          {/* Leading beam edge */}
          <line x1="200" y1="200" x2="375" y2="200" stroke="#38bdf8" strokeWidth="1.5" opacity="0.75" />
        </g>

        {/* Active Geopolitical Signal Nodes / Hotspot Blips */}
        {/* Node 1: Red tension hotspot (Middle East / Straits / Conflict corridor) */}
        <g transform="translate(265, 155)">
          <circle cx="0" cy="0" r="4" fill="#e11d48" className="animate-pulse" />
          <circle cx="0" cy="0" r="9" stroke="#e11d48" strokeWidth="1" opacity="0.4" className="animate-ping" />
          <text x="8" y="3" fill="#bec6e0" fontSize="9" fontFamily="monospace" letterSpacing="0.05em">SIG.01 [TENSION]</text>
        </g>

        {/* Node 2: Cyan maritime trade corridor */}
        <g transform="translate(130, 260)">
          <circle cx="0" cy="0" r="3.5" fill="#38bdf8" />
          <circle cx="0" cy="0" r="7" stroke="#38bdf8" strokeWidth="0.8" opacity="0.3" />
          <text x="8" y="3" fill="#909097" fontSize="8" fontFamily="monospace">CORRIDOR A-4</text>
        </g>

        {/* Node 3: Amber energy hub */}
        <g transform="translate(145, 125)">
          <circle cx="0" cy="0" r="3" fill="#f59e0b" />
          <text x="-70" y="3" fill="#909097" fontSize="8" fontFamily="monospace">ENERGY FLOW</text>
        </g>

        {/* Node 4: Tech & Semiconductor cluster */}
        <g transform="translate(290, 245)">
          <circle cx="0" cy="0" r="3" fill="#c3c0ff" />
          <text x="8" y="3" fill="#909097" fontSize="8" fontFamily="monospace">CHIP SUPPLY</text>
        </g>

        {/* Tactical Perimeter Markings */}
        <text x="204" y="28" fill="rgba(255,255,255,0.3)" fontSize="8" fontFamily="monospace">000° N</text>
        <text x="360" y="196" fill="rgba(255,255,255,0.3)" fontSize="8" fontFamily="monospace">090° E</text>
        <text x="204" y="380" fill="rgba(255,255,255,0.3)" fontSize="8" fontFamily="monospace">180° S</text>
        <text x="22" y="196" fill="rgba(255,255,255,0.3)" fontSize="8" fontFamily="monospace">270° W</text>
      </svg>
    </div>
  );
}
