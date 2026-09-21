import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import Navbar from './Navbar.jsx';

// ─── Situation Room Layout ─────────────────────────────────────────────────────
// Full-viewport dark layout:
//  - Sticky dark top nav
//  - Edge-to-edge obsidian canvas
//  - Dark editorial footer with live status indicator
// ─────────────────────────────────────────────────────────────────────────────

export default function Layout() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen w-full flex flex-col" style={{ backgroundColor: 'var(--color-obsidian)', color: 'var(--color-text-primary)' }}>
      {/* Sticky dark navigation header */}
      <Navbar />

      {/* Main content canvas */}
      <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Outlet />
      </main>

      {/* Dark editorial footer with calm atmospheric gradient */}
      <footer className="atmosphere-footer border-t py-12 px-4 sm:px-6 lg:px-8 mt-auto" style={{ borderColor: 'rgba(255, 255, 255, 0.08)', backgroundColor: '#070a12' }}>
        <div className="max-w-[1400px] mx-auto space-y-8">
          {/* Top row: Brand + Mission + Status Telemetry */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start pb-8 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.06)' }}>
            {/* Brand & Mission Statement (6 cols) */}
            <div className="md:col-span-6 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-rose-950/40 border border-rose-500/30 flex items-center justify-center text-[var(--color-coral)]">
                  <Globe size={15} />
                </div>
                <span className="font-mono font-bold text-sm text-slate-100 tracking-wider uppercase">
                  GEOMONITOR <span className="text-[var(--color-coral)]">[LIVE]</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 max-w-md leading-relaxed font-sans">
                Automated, multi-source geopolitical signal aggregation, structured impact analysis, and systemic ripple intelligence for researchers, analysts, and decision-makers.
              </p>
            </div>

            {/* Quick Links (3 cols) */}
            <div className="md:col-span-3 space-y-2">
              <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300">
                Intelligence Consoles
              </div>
              <ul className="space-y-1.5 text-xs font-mono text-slate-400">
                <li>
                  <Link to="/" className="hover:text-[var(--color-coral)] transition-colors">
                    Live Situation Feed
                  </Link>
                </li>
                <li>
                  <Link to="/impacts" className="hover:text-[var(--color-cyan)] transition-colors">
                    {t('nav.domainImpacts', { defaultValue: 'Domain Impacts' })}
                  </Link>
                </li>
                <li>
                  <Link to="/sources" className="hover:text-[var(--color-cyan)] transition-colors">
                    {t('nav.sources', { defaultValue: 'Wirefeed Sources' })}
                  </Link>
                </li>
                <li>
                  <Link to="/stats" className="hover:text-[var(--color-cyan)] transition-colors">
                    {t('nav.analytics', { defaultValue: 'Risk Analytics' })}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Telemetry Status (3 cols) */}
            <div className="md:col-span-3 space-y-3">
              <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300">
                Network Status
              </div>
              <div
                className="p-3.5 rounded-xl border space-y-2"
                style={{ backgroundColor: 'rgba(11, 16, 32, 0.70)', borderColor: 'rgba(255, 255, 255, 0.08)' }}
              >
                <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-400 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>INGESTION PIPELINE ONLINE</span>
                </div>
                <div className="text-[10px] font-mono text-slate-400 space-y-0.5">
                  <div>Continuous multi-wire ingestion</div>
                  <div>Deterministic scoring active</div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom row: Legal & copyright */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono text-slate-500">
            <div>
              © {new Date().getFullYear()} GeoMonitor Platform. Unbiased, Automated Intelligence.
            </div>
            <div className="flex items-center gap-3">
              <span>MULTILATERAL TELEMETRY</span>
              <span>•</span>
              <span className="text-emerald-400">VERIFIED STREAM</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
