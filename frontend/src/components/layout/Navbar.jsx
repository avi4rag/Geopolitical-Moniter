import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Globe,
  Search,
  Sparkles,
  Menu,
  X,
  ChevronDown,
  Bookmark,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import AskIntelModal from '../intel/AskIntelModal.jsx';

// ─── Situation Room Top Navigation ────────────────────────────────────────────
// Dark intelligence-platform masthead:
//  - Brand mark with globe icon
//  - Center text tabs with periwinkle active underline
//  - Right: language selector, search, Ask Intel, auth
// ─────────────────────────────────────────────────────────────────────────────

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, bookmarks } = useAuth();

  const [isAskOpen, setIsAskOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);

  const currentLang = i18n.language || 'en';

  const navLinks = [
    { href: '/', label: t('nav.newsFeed', { defaultValue: 'Intel Feed' }) },
    { href: '/search', label: t('nav.search', { defaultValue: 'Search' }) },
    { href: '/impacts', label: t('nav.domainImpacts', { defaultValue: 'Impacts' }) },
    { href: '/sources', label: t('nav.sources', { defaultValue: 'Sources' }) },
    { href: '/stats', label: t('nav.analytics', { defaultValue: 'Analytics' }) },
  ];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsMobileMenuOpen(false);
    }
  };

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
    setIsLangDropdownOpen(false);
  };

  // When AskIntel selects an event, navigate to the dossier page
  const handleIntelEventSelect = (id) => {
    setIsAskOpen(false);
    if (id) navigate(`/event/${id}`);
  };

  return (
    <>
      <header
        className="sticky top-0 z-50 w-full backdrop-blur-md"
        style={{
          backgroundColor: 'rgba(7, 13, 31, 0.95)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 gap-4">

            {/* ── Brand ───────────────────────────────────────────── */}
            <Link
              to="/"
              className="flex items-center gap-2.5 group shrink-0"
              aria-label="GeoMonitor Home"
            >
              <div
                className="w-8 h-8 rounded flex items-center justify-center transition-colors group-hover:bg-[var(--color-surface-4)]"
                style={{ backgroundColor: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}
              >
                <Globe size={16} style={{ color: 'var(--color-accent)' }} strokeWidth={2} />
              </div>
              <div className="flex flex-col">
                <span
                  className="text-sm font-bold font-mono-code tracking-tight leading-none transition-colors group-hover:text-white"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  GeoMonitor
                </span>
                <span
                  className="hidden sm:inline text-[9px] font-mono-code font-medium tracking-widest uppercase mt-0.5"
                  style={{ color: 'var(--color-text-dim)' }}
                >
                  INTEL PLATFORM
                </span>
              </div>
            </Link>

            {/* ── Center Nav ──────────────────────────────────────── */}
            <nav className="hidden md:flex items-center gap-1" role="navigation">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="px-3 py-4 font-mono-code text-xs tracking-widest uppercase border-b-2 transition-all duration-150 whitespace-nowrap"
                    style={{
                      color: isActive ? 'var(--color-accent)' : 'var(--color-text-muted)',
                      borderBottomColor: isActive ? 'var(--color-accent)' : 'transparent',
                    }}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* ── Right Controls ───────────────────────────────────── */}
            <div className="flex items-center gap-2 shrink-0">

              {/* Search */}
              <form onSubmit={handleSearchSubmit} className="hidden sm:flex items-center relative w-40 lg:w-52">
                <Search size={12} className="absolute left-3 pointer-events-none" style={{ color: 'var(--color-text-dim)' }} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('filters.searchPlaceholder', { defaultValue: 'Search intel...' })}
                  className="w-full pl-8 pr-3 py-1.5 text-xs font-mono-code rounded transition-colors"
                  style={{
                    backgroundColor: 'var(--color-surface-2)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text-secondary)',
                  }}
                />
              </form>

              {/* Language */}
              <div className="relative">
                <button
                  onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                  className="inline-flex items-center gap-1 px-2 py-1.5 rounded font-mono-code text-xs transition-colors cursor-pointer"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  <span className="uppercase">{currentLang.substring(0, 2)}</span>
                  <ChevronDown size={10} />
                </button>
                {isLangDropdownOpen && (
                  <div
                    className="absolute right-0 mt-1 w-36 rounded py-1 z-50 animate-in fade-in duration-150"
                    style={{
                      backgroundColor: 'var(--color-surface-3)',
                      border: '1px solid var(--color-border)',
                    }}
                  >
                    {[
                      { code: 'en', label: 'English' },
                      { code: 'hi', label: 'हिंदी (Hindi)' },
                    ].map(({ code, label }) => (
                      <button
                        key={code}
                        onClick={() => handleLanguageChange(code)}
                        className="w-full px-3 py-1.5 text-xs text-left font-mono-code flex items-center justify-between transition-colors cursor-pointer hover:bg-[var(--color-surface-4)]"
                        style={{
                          color: currentLang.startsWith(code)
                            ? 'var(--color-accent)'
                            : 'var(--color-text-muted)',
                        }}
                      >
                        <span>{label}</span>
                        {currentLang.startsWith(code) && <span>✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Ask Intel */}
              <button
                onClick={() => setIsAskOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded font-mono-code text-xs font-semibold transition-all cursor-pointer"
                style={{
                  backgroundColor: 'var(--color-accent-bg)',
                  border: '1px solid var(--color-accent-border)',
                  color: 'var(--color-accent)',
                }}
                title={t('intel.title', { defaultValue: 'Ask AI Intel' })}
              >
                <Sparkles size={11} />
                <span className="hidden sm:inline">{t('nav.askAiIntel', { defaultValue: 'Ask Intel' })}</span>
              </button>

              {/* Auth */}
              {isAuthenticated ? (
                <div className="flex items-center gap-1.5">
                  <Link
                    to="/profile"
                    className="flex items-center gap-1 px-2 py-1.5 rounded font-mono-code text-xs transition-colors"
                    style={{
                      backgroundColor: 'var(--color-surface-2)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text-muted)',
                    }}
                    title={t('profile.accountProfile', { defaultValue: 'Profile' })}
                  >
                    <Bookmark size={11} />
                    <span>{bookmarks?.length || 0}</span>
                  </Link>
                  <Link
                    to="/profile"
                    className="w-7 h-7 rounded flex items-center justify-center text-xs font-bold font-mono-code transition-colors"
                    style={{
                      backgroundColor: 'var(--color-surface-4)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-accent)',
                    }}
                    title={user?.name}
                  >
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </Link>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <Link
                    to="/login"
                    className="hidden sm:inline-flex px-3 py-1.5 text-xs font-mono-code font-semibold transition-colors"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    {t('nav.signIn', { defaultValue: 'Sign In' })}
                  </Link>
                  <Link
                    to="/signup"
                    className="px-3 py-1.5 rounded text-xs font-mono-code font-bold transition-colors"
                    style={{
                      backgroundColor: 'var(--color-accent-bg)',
                      border: '1px solid var(--color-accent-border)',
                      color: 'var(--color-accent)',
                    }}
                  >
                    {t('nav.createAccount', { defaultValue: 'Sign Up' })}
                  </Link>
                </div>
              )}

              {/* Mobile hamburger */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded transition-colors cursor-pointer"
                style={{ color: 'var(--color-text-muted)' }}
                aria-label="Toggle Navigation"
              >
                {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile nav drawer */}
        {isMobileMenuOpen && (
          <div
            className="md:hidden border-t px-4 py-4 space-y-3 animate-in slide-in-from-top duration-150"
            style={{
              backgroundColor: 'var(--color-surface-1)',
              borderColor: 'var(--color-border)',
            }}
          >
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <Search size={12} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--color-text-dim)' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('filters.searchPlaceholder', { defaultValue: 'Search intel...' })}
                className="w-full pl-9 pr-3 py-2 text-xs font-mono-code rounded"
                style={{
                  backgroundColor: 'var(--color-surface-2)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-secondary)',
                }}
              />
            </form>
            <div className="flex flex-col space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-2 rounded text-xs font-mono-code font-semibold transition-colors tracking-wider uppercase"
                  style={{
                    color: location.pathname === link.href ? 'var(--color-accent)' : 'var(--color-text-muted)',
                    backgroundColor: location.pathname === link.href ? 'var(--color-accent-bg)' : 'transparent',
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Ask Intel modal — navigates to dossier on event selection */}
      <AskIntelModal
        isOpen={isAskOpen}
        onClose={() => setIsAskOpen(false)}
        onSelectEvent={handleIntelEventSelect}
      />
    </>
  );
}
