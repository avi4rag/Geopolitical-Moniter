import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Globe, Bookmark, User, LogIn, UserPlus, LogOut, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

// ─── Navbar ───────────────────────────────────────────────────────────────────
// Top news masthead with brand, search trigger, bookmarks, and user auth menu.
// ─────────────────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { href: '/', label: 'News Feed' },
  { href: '/search', label: 'Search' },
  { href: '/impacts', label: 'Domain Impacts' },
  { href: '/sources', label: 'Sources' },
  { href: '/stats', label: 'Analytics' },
];

export default function Navbar() {
  const location = useLocation();
  const { user, isAuthenticated, logout, bookmarks } = useAuth();

  return (
    <header
      className="sticky top-0 z-40 border-b shadow-md"
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
              className="w-7 h-7 rounded-lg flex items-center justify-center shadow-sm"
              style={{ background: 'var(--color-accent)' }}
            >
              <Globe size={14} color="#000" strokeWidth={2.5} />
            </div>
            <span className="text-base font-extrabold tracking-tight hidden sm:block text-white">
              GeoMonitor
            </span>
            <span
              className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded uppercase"
              style={{
                background: 'var(--color-surface-3)',
                color: 'var(--color-accent)',
                border: '1px solid var(--color-border)',
              }}
            >
              NEWS
            </span>
          </Link>

          {/* Main Navigation */}
          <nav className="flex items-center gap-1 sm:gap-2" role="navigation" aria-label="Main navigation">
            {NAV_LINKS.map((link) => {
              const isActive = location.pathname === link.href;
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150"
                  style={{
                    color: isActive ? '#fff' : 'var(--color-text-secondary)',
                    background: isActive ? 'var(--color-surface-3)' : 'transparent',
                    border: isActive ? '1px solid var(--color-border)' : '1px solid transparent',
                  }}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Auth / Profile & Bookmarks Menu */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/profile"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs font-semibold hover:border-amber-500/50 hover:text-white transition"
                  title="View Bookmarks & Profile"
                >
                  <Bookmark size={13} className="text-amber-400" />
                  <span className="hidden sm:inline font-mono">
                    Bookmarks ({bookmarks.length})
                  </span>
                </Link>

                <Link
                  to="/profile"
                  className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-mono font-bold text-xs hover:bg-amber-500/30 transition"
                  title={user.name}
                >
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white transition"
                >
                  Sign In
                </Link>

                <Link
                  to="/signup"
                  className="px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm"
                  style={{
                    backgroundColor: 'var(--color-accent)',
                    color: '#000',
                  }}
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
