import { Link, useLocation } from 'react-router-dom';
import { Globe, Activity } from 'lucide-react';

// ─── Navbar ───────────────────────────────────────────────────────────────────
// Top navigation bar with brand and nav links.
// Active link is highlighted using route matching.
// ─────────────────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { href: '/', label: 'Dashboard' },
];

export default function Navbar() {
  const location = useLocation();

  return (
    <header
      className="sticky top-0 z-50 border-b"
      style={{
        background: 'color-mix(in srgb, var(--color-surface-1) 95%, transparent)',
        borderColor: 'var(--color-border)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">

          {/* Brand */}
          <Link
            to="/"
            className="flex items-center gap-2.5 group"
            aria-label="Geopolitical Monitor Home"
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--color-accent)' }}
            >
              <Globe size={14} color="#000" strokeWidth={2.5} />
            </div>
            <span
              className="text-sm font-semibold tracking-tight hidden sm:block"
              style={{ color: 'var(--color-text-primary)' }}
            >
              GeoMonitor
            </span>
            <span
              className="text-xs font-medium px-1.5 py-0.5 rounded"
              style={{
                background: 'var(--color-surface-3)',
                color: 'var(--color-text-muted)',
                border: '1px solid var(--color-border)',
              }}
            >
              BETA
            </span>
          </Link>

          {/* Nav Links */}
          <nav className="flex items-center gap-1" role="navigation" aria-label="Main navigation">
            {NAV_LINKS.map((link) => {
              const isActive = location.pathname === link.href;
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className="px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-150"
                  style={{
                    color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                    background: isActive ? 'var(--color-surface-3)' : 'transparent',
                  }}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Live indicator */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ background: 'var(--color-severity-low)' }}
                aria-hidden="true"
              />
              <span className="text-xs hidden sm:block" style={{ color: 'var(--color-text-muted)' }}>
                Live
              </span>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}
