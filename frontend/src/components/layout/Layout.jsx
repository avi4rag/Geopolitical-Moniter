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

      {/* Dark editorial footer */}
      <footer
        className="w-full border-t py-8 px-4 sm:px-6 lg:px-8 mt-auto"
        style={{ backgroundColor: 'var(--color-surface-1)', borderColor: 'var(--color-border)' }}
      >
        <div
          className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}
        >
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div
              className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: 'var(--color-surface-4)' }}
            >
              <Globe size={13} style={{ color: 'var(--color-accent)' }} />
            </div>
            <div>
              <span className="font-bold font-mono-code tracking-tight" style={{ color: 'var(--color-text-secondary)' }}>
                GeoMonitor
              </span>
              <span className="ml-2" style={{ color: 'var(--color-text-dim)' }}>
                © {new Date().getFullYear()} Real-Time Geopolitical Intelligence
              </span>
            </div>
          </div>

          {/* Status + Nav links */}
          <div className="flex items-center gap-4 flex-wrap justify-center font-mono-code">
            <span
              className="inline-flex items-center gap-1.5 font-bold tracking-wider uppercase"
              style={{ color: 'var(--color-stable)', fontSize: '0.65rem' }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ backgroundColor: 'var(--color-stable)' }}
              />
              LIVE INGESTION ACTIVE
            </span>
            <span style={{ color: 'var(--color-border-muted)' }}>•</span>
            <Link to="/impacts" className="transition-colors hover:text-white" style={{ color: 'var(--color-text-muted)' }}>
              {t('nav.domainImpacts')}
            </Link>
            <span style={{ color: 'var(--color-border-muted)' }}>•</span>
            <Link to="/sources" className="transition-colors hover:text-white" style={{ color: 'var(--color-text-muted)' }}>
              {t('nav.sources')}
            </Link>
            <span style={{ color: 'var(--color-border-muted)' }}>•</span>
            <Link to="/stats" className="transition-colors hover:text-white" style={{ color: 'var(--color-text-muted)' }}>
              {t('nav.analytics')}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
