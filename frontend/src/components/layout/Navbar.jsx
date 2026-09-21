import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Search,
  Sparkles,
  Menu,
  X,
  ChevronDown,
  Bookmark,
  Radio,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import AskIntelModal from '../intel/AskIntelModal.jsx';

// ─── Subtle Radar Emblem Icon ────────────────────────────────────────────────
function RadarEmblem({ size = 18, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* Outer & inner radar rings */}
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.3" />
      <circle cx="12" cy="12" r="6" stroke="currentColor" strokeOpacity="0.5" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
      {/* Crosshairs */}
      <line x1="12" y1="2" x2="12" y2="22" stroke="currentColor" strokeOpacity="0.25" strokeDasharray="2 2" />
      <line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" strokeOpacity="0.25" strokeDasharray="2 2" />
      {/* Radar sweep vector */}
      <line x1="12" y1="12" x2="19" y2="5" stroke="var(--color-accent, #c3c0ff)" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

// ─── Premium Intelligence Masthead ───────────────────────────────────────────
// Controlled glass header with radar emblem, real-time monitoring pulse,
// scroll compaction, and preserved search, language, intel, and auth controls.
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
  const [isScrolled, setIsScrolled] = useState(false);

  const currentLang = i18n.language || 'en';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 24);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const handleIntelEventSelect = (id) => {
    setIsAskOpen(false);
    if (id) navigate(`/event/${id}`);
  };

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-250 ${
          isScrolled
            ? 'bg-[#040916]/95 backdrop-blur-md shadow-lg border-b border-white/[0.08]'
            : 'bg-[#070d1f]/85 backdrop-blur-md border-b border-white/[0.06]'
        }`}
      >
        {/* Top Intelligence Status Strip */}
        <div
          className="hidden sm:flex items-center justify-between text-[10px] font-mono-code px-4 sm:px-6 lg:px-8 py-1 border-b"
          style={{
            backgroundColor: 'rgba(2, 6, 23, 0.90)',
            borderColor: 'rgba(255, 255, 255, 0.05)',
            color: 'var(--color-text-dim)',
          }}
        >
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 font-bold tracking-wider" style={{ color: 'var(--color-stable)' }}>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-emerald-500" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              MONITORING ACTIVE
            </span>
            <span style={{ color: 'rgba(255,255,255,0.15)' }}>•</span>
            <span className="uppercase tracking-widest text-[9px]" style={{ color: 'var(--color-text-dim)' }}>
              Multi-Source Ingestion & Causal Transmission Engine
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="uppercase tracking-widest">{new Date().toUTCString().slice(0, 16)} UTC</span>
            <span style={{ color: 'rgba(255,255,255,0.15)' }}>•</span>
            {/* Subtle monitoring-status indicator: ● Monitoring is live */}
            <span className="inline-flex items-center gap-1.5 font-semibold tracking-wider text-[10px]" style={{ color: 'var(--color-text-primary)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-signalPulse" />
              Monitoring is live
            </span>
          </div>
        </div>

        {/* Main Navbar Bar */}
        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`flex items-center justify-between gap-4 transition-all duration-200 ${isScrolled ? 'h-13' : 'h-14 sm:h-15'}`}>

            {/* ── Brand with Subtle Target / Radar Emblem ───────────────────── */}
            <Link
              to="/"
              className="flex items-center gap-2.5 group shrink-0 focus:outline-hidden"
              aria-label="GeoMonitor Home"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-105"
                style={{
                  backgroundColor: 'rgba(244, 63, 94, 0.12)',
                  border: '1px solid rgba(244, 63, 94, 0.35)',
                }}
              >
                <RadarEmblem size={17} className="text-rose-400 group-hover:rotate-45 transition-transform duration-500" />
              </div>
              <div className="flex items-center gap-1.5 font-mono-code font-bold text-sm tracking-wider">
                <span className="text-white group-hover:text-rose-200 transition-colors">
                  GEOMONITOR
                </span>
                <span className="text-[10px] uppercase px-1.5 py-0.5 rounded text-rose-400 bg-rose-500/15 border border-rose-500/30 font-semibold tracking-widest">
                  [LIVE]
                </span>
              </div>
            </Link>

            {/* ── Center Nav Links — Reference-style Coral Active Pill ──────── */}
            <nav className="hidden md:flex items-center gap-1 bg-slate-950/40 p-1 rounded-full border border-white/[0.06]" role="navigation">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={`px-3.5 py-1 font-mono-code text-xs tracking-wider uppercase transition-all duration-200 whitespace-nowrap ${
                      isActive
                        ? 'bg-rose-500 text-slate-950 font-bold rounded-full shadow-md shadow-rose-500/30'
                        : 'text-slate-400 hover:text-white font-medium hover:bg-white/[0.05] rounded-full'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* ── Right Controls ───────────────────────────────────── */}
            <div className="flex items-center gap-2.5 shrink-0">

              {/* Live monitoring status readout */}
              <div className="hidden lg:flex items-center gap-2 text-[10px] font-mono-code px-2.5 py-1 rounded-full bg-slate-900/60 border border-white/[0.08] text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-slate-200 font-semibold tracking-wider">MONITORING IS LIVE</span>
              </div>

              {/* Search */}
              <form onSubmit={handleSearchSubmit} className="hidden sm:flex items-center relative w-32 xl:w-44">
                <Search size={12} className="absolute left-3 pointer-events-none text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('filters.searchPlaceholder', { defaultValue: 'Search intel...' })}
                  className="w-full pl-8 pr-3 py-1 text-xs font-mono-code rounded-full bg-slate-900/60 border border-white/[0.08] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500/50 transition-colors"
                />
              </form>

              {/* Language Switcher */}
              <div className="relative">
                <button
                  onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-mono-code text-xs transition-colors cursor-pointer border border-white/[0.08] bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:border-white/20"
                >
                  <span className="uppercase font-semibold">{currentLang.substring(0, 2)}</span>
                  <ChevronDown size={10} />
                </button>
                {isLangDropdownOpen && (
                  <div
                    className="absolute right-0 mt-1 w-36 rounded-xl py-1 z-50 animate-in fade-in duration-150 shadow-2xl bg-slate-900 border border-white/10"
                  >
                    {[
                      { code: 'en', label: 'English' },
                      { code: 'hi', label: 'हिंदी (Hindi)' },
                    ].map(({ code, label }) => (
                      <button
                        key={code}
                        onClick={() => handleLanguageChange(code)}
                        className="w-full px-3 py-1.5 text-xs text-left font-mono-code flex items-center justify-between transition-colors cursor-pointer hover:bg-white/[0.06]"
                        style={{
                          color: currentLang.startsWith(code)
                            ? '#f43f5e'
                            : '#94a3b8',
                        }}
                      >
                        <span>{label}</span>
                        {currentLang.startsWith(code) && <span>✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Ask Intel AI Modal Trigger */}
              <button
                onClick={() => setIsAskOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-mono-code text-xs font-semibold transition-all cursor-pointer bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20"
                title={t('intel.title', { defaultValue: 'Ask AI Intel' })}
              >
                <Sparkles size={12} />
                <span className="hidden xl:inline">{t('nav.askAiIntel', { defaultValue: 'Ask Intel' })}</span>
              </button>

              {/* Auth / Analyst Profile Avatar Button (Soft Coral Circle) */}
              {isAuthenticated ? (
                <div className="flex items-center gap-1.5">
                  <Link
                    to="/profile"
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full font-mono-code text-xs transition-colors border border-white/[0.08] bg-slate-900/60 text-slate-400 hover:border-white/20"
                    title={t('profile.accountProfile', { defaultValue: 'Profile' })}
                  >
                    <Bookmark size={11} />
                    <span>{bookmarks?.length || 0}</span>
                  </Link>
                  <Link
                    to="/profile"
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-mono-code transition-all bg-rose-300 text-slate-950 hover:bg-rose-200 shadow-md shadow-rose-500/20 hover:scale-105"
                    title={user?.name}
                  >
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                  </Link>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <Link
                    to="/login"
                    className="hidden sm:inline-flex px-3 py-1 text-xs font-mono-code font-semibold text-slate-400 hover:text-white transition-colors"
                  >
                    {t('nav.signIn', { defaultValue: 'Sign In' })}
                  </Link>
                  <Link
                    to="/signup"
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-mono-code transition-all bg-rose-300 text-slate-950 hover:bg-rose-200 shadow-md shadow-rose-500/20 hover:scale-105"
                    title={t('nav.createAccount', { defaultValue: 'Sign Up / Analyst Access' })}
                  >
                    +
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-1.5 rounded-lg transition-colors cursor-pointer border border-white/[0.08] bg-slate-900/60 text-slate-400 hover:border-white/20"
                aria-label="Toggle Navigation"
              >
                {isMobileMenuOpen ? <X size={17} /> : <Menu size={17} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav Drawer */}
        {isMobileMenuOpen && (
          <div
            className="md:hidden border-t px-4 py-4 space-y-3 animate-in slide-in-from-top duration-150 glass-panel"
          >
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <Search size={12} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--color-text-dim)' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('filters.searchPlaceholder', { defaultValue: 'Search intel...' })}
                className="w-full pl-9 pr-3 py-2 text-xs font-mono-code rounded-md"
                style={{
                  backgroundColor: 'rgba(21, 27, 45, 0.85)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
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
                  className="px-3 py-2 rounded-md text-xs font-mono-code font-semibold transition-colors tracking-wider uppercase"
                  style={{
                    color: location.pathname === link.href ? '#ffffff' : 'var(--color-text-muted)',
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

      {/* Ask Intel modal */}
      <AskIntelModal
        isOpen={isAskOpen}
        onClose={() => setIsAskOpen(false)}
        onSelectEvent={handleIntelEventSelect}
      />
    </>
  );
}
