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
  UploadCloud,
  Layers,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useSocket } from '../../context/SocketContext.jsx';
import AskIntelModal from '../intel/AskIntelModal.jsx';
import { FileUploadModal } from '../common/FileUploadModal.jsx';
import { ConceptsDemonstrationModal } from '../common/ConceptsDemonstrationModal.jsx';

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
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isConceptsOpen, setIsConceptsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const { isConnected: isWsConnected } = useSocket();

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
            {/* Real-time WebSocket connection state */}
            <span className="inline-flex items-center gap-1.5 font-semibold tracking-wider text-[10px]" style={{ color: 'var(--color-text-primary)' }}>
              <span className={`w-1.5 h-1.5 rounded-full ${isWsConnected ? 'bg-emerald-400 animate-signalPulse' : 'bg-amber-400'}`} />
              {isWsConnected ? 'WS LIVE' : 'WS STANDBY'}
            </span>
          </div>
        </div>

        {/* Main Navbar Bar */}
        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`flex items-center justify-between gap-4 transition-all duration-200 ${isScrolled ? 'h-13' : 'h-14 sm:h-15'}`}>

            {/* ── Brand with Subtle Radar Emblem ───────────────────── */}
            <Link
              to="/"
              className="flex items-center gap-3 group shrink-0 focus:outline-hidden"
              aria-label="GeoMonitor Home"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 group-hover:border-indigo-400/40"
                style={{
                  backgroundColor: 'rgba(21, 27, 45, 0.75)',
                  border: '1px solid rgba(255, 255, 255, 0.10)',
                }}
              >
                <RadarEmblem size={17} className="text-[var(--color-accent)] group-hover:rotate-45 transition-transform duration-500" />
              </div>
              <div className="flex flex-col">
                <span
                  className="text-sm sm:text-base font-bold font-mono-code tracking-tight leading-none text-white group-hover:text-indigo-200 transition-colors"
                >
                  GeoMonitor
                </span>
                <span
                  className="hidden sm:inline text-[9px] font-mono-code font-medium tracking-widest uppercase mt-0.5"
                  style={{ color: 'var(--color-text-dim)' }}
                >
                  GEOPOLITICAL INTELLIGENCE
                </span>
              </div>
            </Link>

            {/* ── Center Nav Links ─────────────────────────────────── */}
            <nav className="hidden md:flex items-center gap-1" role="navigation">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="px-3.5 py-3 font-mono-code text-xs tracking-wider uppercase border-b-2 transition-all duration-150 whitespace-nowrap"
                    style={{
                      color: isActive ? '#ffffff' : 'var(--color-text-muted)',
                      borderBottomColor: isActive ? 'var(--color-accent)' : 'transparent',
                      fontWeight: isActive ? '700' : '500',
                    }}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* ── Right Controls ───────────────────────────────────── */}
            <div className="flex items-center gap-2 shrink-0">

              {/* Live monitoring badge on small screens */}
              <div className="sm:hidden flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-mono-code" style={{ backgroundColor: 'rgba(16,185,129,0.12)', color: '#10b981' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>LIVE</span>
              </div>

              {/* Search */}
              <form onSubmit={handleSearchSubmit} className="hidden sm:flex items-center relative w-36 lg:w-48">
                <Search size={12} className="absolute left-3 pointer-events-none" style={{ color: 'var(--color-text-dim)' }} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('filters.searchPlaceholder', { defaultValue: 'Search intel...' })}
                  className="w-full pl-8 pr-3 py-1.5 text-xs font-mono-code rounded-md transition-colors"
                  style={{
                    backgroundColor: 'rgba(21, 27, 45, 0.65)',
                    border: '1px solid rgba(255, 255, 255, 0.09)',
                    color: 'var(--color-text-secondary)',
                  }}
                />
              </form>

              {/* Language Switcher */}
              <div className="relative">
                <button
                  onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md font-mono-code text-xs transition-colors cursor-pointer border hover:border-white/20"
                  style={{
                    backgroundColor: 'rgba(21, 27, 45, 0.50)',
                    borderColor: 'rgba(255, 255, 255, 0.08)',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  <span className="uppercase font-semibold">{currentLang.substring(0, 2)}</span>
                  <ChevronDown size={10} />
                </button>
                {isLangDropdownOpen && (
                  <div
                    className="absolute right-0 mt-1 w-36 rounded-md py-1 z-50 animate-in fade-in duration-150 shadow-xl"
                    style={{
                      backgroundColor: 'rgba(15, 23, 42, 0.96)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                    }}
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

              {/* Concepts Suite Trigger */}
              <button
                onClick={() => setIsConceptsOpen(true)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md font-mono-code text-xs font-semibold transition-all cursor-pointer shadow-sm hover:brightness-110"
                style={{
                  backgroundColor: 'rgba(255, 107, 74, 0.12)',
                  border: '1px solid rgba(255, 107, 74, 0.35)',
                  color: '#ff8a70',
                }}
                title="12 Concepts Verification & Live Testing Suite"
              >
                <Layers size={12} />
                <span className="hidden sm:inline">12 Concepts</span>
              </button>

              {/* Upload Dossier Attachment Trigger */}
              <button
                onClick={() => setIsUploadOpen(true)}
                className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md font-mono-code text-xs font-semibold transition-all cursor-pointer shadow-sm hover:brightness-110"
                style={{
                  backgroundColor: 'rgba(34, 211, 238, 0.10)',
                  border: '1px solid rgba(34, 211, 238, 0.25)',
                  color: '#38bdf8',
                }}
                title="Upload Intelligence File (Multer Handling)"
              >
                <UploadCloud size={12} />
                <span>Upload</span>
              </button>

              {/* Ask Intel AI Modal Trigger */}
              <button
                onClick={() => setIsAskOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-mono-code text-xs font-semibold transition-all cursor-pointer shadow-sm hover:brightness-110"
                style={{
                  backgroundColor: 'rgba(195, 192, 255, 0.12)',
                  border: '1px solid rgba(195, 192, 255, 0.25)',
                  color: 'var(--color-accent)',
                }}
                title={t('intel.title', { defaultValue: 'Ask AI Intel' })}
              >
                <Sparkles size={12} />
                <span className="hidden sm:inline">{t('nav.askAiIntel', { defaultValue: 'Ask Intel' })}</span>
              </button>

              {/* Auth */}
              {isAuthenticated ? (
                <div className="flex items-center gap-1.5">
                  <Link
                    to="/profile"
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-md font-mono-code text-xs transition-colors border hover:border-white/20"
                    style={{
                      backgroundColor: 'rgba(21, 27, 45, 0.50)',
                      borderColor: 'rgba(255, 255, 255, 0.08)',
                      color: 'var(--color-text-muted)',
                    }}
                    title={t('profile.accountProfile', { defaultValue: 'Profile' })}
                  >
                    <Bookmark size={11} />
                    <span>{bookmarks?.length || 0}</span>
                  </Link>
                  <Link
                    to="/profile"
                    className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold font-mono-code transition-colors border hover:border-indigo-400/50"
                    style={{
                      backgroundColor: 'var(--color-surface-4)',
                      borderColor: 'rgba(255, 255, 255, 0.12)',
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
                    className="hidden sm:inline-flex px-3 py-1.5 text-xs font-mono-code font-semibold transition-colors hover:text-white"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    {t('nav.signIn', { defaultValue: 'Sign In' })}
                  </Link>
                  <Link
                    to="/signup"
                    className="px-3 py-1.5 rounded-md text-xs font-mono-code font-bold transition-colors shadow-sm hover:brightness-110"
                    style={{
                      backgroundColor: 'rgba(195, 192, 255, 0.15)',
                      border: '1px solid rgba(195, 192, 255, 0.30)',
                      color: 'var(--color-accent)',
                    }}
                  >
                    {t('nav.createAccount', { defaultValue: 'Sign Up' })}
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-1.5 rounded-md transition-colors cursor-pointer border hover:border-white/20"
                style={{
                  backgroundColor: 'rgba(21, 27, 45, 0.50)',
                  borderColor: 'rgba(255, 255, 255, 0.08)',
                  color: 'var(--color-text-muted)',
                }}
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

      {/* Intelligence Attachment Upload Modal (Multer Handling) */}
      <FileUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
      />

      {/* 12 Core Concepts Suite Modal */}
      <ConceptsDemonstrationModal
        isOpen={isConceptsOpen}
        onClose={() => setIsConceptsOpen(false)}
      />
    </>
  );
}
