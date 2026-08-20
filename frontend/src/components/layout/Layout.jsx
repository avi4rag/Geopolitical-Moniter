import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import Navbar from './Navbar.jsx';

// ─── Full-Width Editorial Layout ──────────────────────────────────────────────
// Replaces the boxed floating container with a true edge-to-edge layout:
// - 100% viewport width
// - Sticky full-width editorial navigation header
// - Generous, balanced content canvas
// - Clean editorial footer
// ─────────────────────────────────────────────────────────────────────────────

export default function Layout() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-900 flex flex-col justify-between">
      {/* Full-Width Fixed/Sticky Header */}
      <Navbar />

      {/* Main Full-Width Editorial Canvas */}
      <main className="flex-1 w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Outlet />
      </main>

      {/* Full-Width Professional Editorial Footer */}
      <footer className="w-full border-t border-slate-200 bg-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1360px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-md bg-slate-900 flex items-center justify-center text-white font-bold text-xs">
              <Globe size={13} />
            </div>
            <div>
              <span className="font-bold text-slate-900 tracking-tight">GeoMonitor</span>
              <span className="ml-2 text-slate-400">© {new Date().getFullYear()} Real-Time Geopolitical Intelligence & Macroeconomic Analysis</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-slate-600 font-medium flex-wrap justify-center">
            <span className="inline-flex items-center gap-1.5 text-emerald-600 font-semibold font-mono text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>LIVE INGESTION ACTIVE</span>
            </span>
            <span className="text-slate-300">•</span>
            <Link to="/impacts" className="hover:text-indigo-600 transition-colors">{t('nav.domainImpacts')}</Link>
            <span className="text-slate-300">•</span>
            <Link to="/sources" className="hover:text-indigo-600 transition-colors">{t('nav.sources')}</Link>
            <span className="text-slate-300">•</span>
            <Link to="/stats" className="hover:text-indigo-600 transition-colors">{t('nav.analytics')}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
