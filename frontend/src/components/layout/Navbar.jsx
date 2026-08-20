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
import EventDetailModal from '../events/EventDetailModal.jsx';

// ─── Full-Width Editorial Navigation Masthead ─────────────────────────────────
// Professional editorial navigation bar spanning 100% viewport width:
// - Left: GeoMonitor logo & publication brand
// - Center: Text tabs with clean active underline indicators
// - Right: Language selector, quick search input, AI Assistant, and User Auth
// ─────────────────────────────────────────────────────────────────────────────

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, bookmarks } = useAuth();
  const [isAskOpen, setIsAskOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);

  const currentLang = i18n.language || 'en';

  const navLinks = [
    { href: '/', label: t('nav.newsFeed', { defaultValue: 'News Feed' }) },
    { href: '/search', label: t('nav.search', { defaultValue: 'Search' }) },
    { href: '/impacts', label: t('nav.domainImpacts', { defaultValue: 'Domain Impacts' }) },
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

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-xs transition-all">
        <div className="w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-6">
            {/* Left: Brand Identity */}
            <Link
              to="/"
              className="flex items-center gap-2.5 group shrink-0"
              aria-label="GeoMonitor Home"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform duration-200">
                <Globe size={17} strokeWidth={2.2} />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-black tracking-tight text-slate-950 group-hover:text-indigo-600 transition-colors">
                  {t('nav.brand', { defaultValue: 'GeoMonitor' })}
                </span>
                <span className="text-[9px] font-mono font-bold tracking-widest text-slate-400 uppercase -mt-1 hidden sm:inline">
                  GEOPOLITICAL INTELLIGENCE
                </span>
              </div>
            </Link>

            {/* Center: Editorial Text Navigation Links */}
            <nav className="hidden md:flex items-center gap-6 lg:gap-8" role="navigation">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={`text-xs lg:text-sm font-semibold tracking-tight py-5 border-b-2 transition-all duration-150 whitespace-nowrap ${
                      isActive
                        ? 'text-indigo-600 border-indigo-600 font-bold'
                        : 'text-slate-600 hover:text-slate-950 border-transparent'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right: Search, Language, Ask AI, Auth */}
            <div className="flex items-center gap-3 shrink-0">
              {/* Integrated Search Input */}
              <form onSubmit={handleSearchSubmit} className="hidden sm:flex items-center relative w-44 lg:w-56">
                <Search size={13} className="absolute left-3 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('filters.searchPlaceholder', { defaultValue: 'Search headlines...' })}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-full bg-slate-100/90 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-400 transition"
                />
              </form>

              {/* Language Switcher */}
              <div className="relative">
                <button
                  onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
                >
                  <span className="uppercase font-mono">{currentLang.substring(0, 2)}</span>
                  <ChevronDown size={11} className="text-slate-400" />
                </button>

                {isLangDropdownOpen && (
                  <div className="absolute right-0 mt-1 w-32 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-50 animate-in fade-in duration-150">
                    <button
                      onClick={() => handleLanguageChange('en')}
                      className={`w-full px-3 py-1.5 text-xs text-left font-medium hover:bg-slate-50 flex items-center justify-between ${
                        currentLang.startsWith('en') ? 'text-indigo-600 font-bold' : 'text-slate-700'
                      }`}
                    >
                      <span>English</span>
                      {currentLang.startsWith('en') && <span>✓</span>}
                    </button>
                    <button
                      onClick={() => handleLanguageChange('hi')}
                      className={`w-full px-3 py-1.5 text-xs text-left font-medium hover:bg-slate-50 flex items-center justify-between ${
                        currentLang.startsWith('hi') ? 'text-indigo-600 font-bold' : 'text-slate-700'
                      }`}
                    >
                      <span>हिंदी (Hindi)</span>
                      {currentLang.startsWith('hi') && <span>✓</span>}
                    </button>
                  </div>
                )}
              </div>

              {/* Ask AI Intel Trigger Button */}
              <button
                onClick={() => setIsAskOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-indigo-200 bg-indigo-50/80 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs transition-all cursor-pointer shadow-2xs"
                title={t('intel.title', { defaultValue: 'Ask AI Intel' })}
              >
                <Sparkles size={12} className="text-indigo-600" />
                <span className="hidden sm:inline">{t('nav.askAiIntel', { defaultValue: 'Ask Intel' })}</span>
              </button>

              {/* User Auth controls */}
              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <Link
                    to="/profile"
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
                    title={t('profile.accountProfile', { defaultValue: 'Account Profile' })}
                  >
                    <Bookmark size={12} className="text-slate-600" />
                    <span className="font-mono text-[11px]">{bookmarks?.length || 0}</span>
                  </Link>

                  <Link
                    to="/profile"
                    className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold transition shadow-xs"
                    title={user?.name}
                  >
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </Link>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="hidden sm:inline-flex px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
                  >
                    {t('nav.signIn', { defaultValue: 'Sign In' })}
                  </Link>
                  <Link
                    to="/signup"
                    className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition shadow-2xs"
                  >
                    {t('nav.createAccount', { defaultValue: 'Sign Up' })}
                  </Link>
                </div>
              )}

              {/* Mobile Hamburger Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                aria-label="Toggle Navigation"
              >
                {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3 animate-in slide-in-from-top duration-150 shadow-lg">
            {/* Quick Mobile Search */}
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('filters.searchPlaceholder', { defaultValue: 'Search headlines...' })}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-100 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none"
              />
            </form>

            {/* Links */}
            <div className="flex flex-col space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition ${
                    location.pathname === link.href
                      ? 'bg-indigo-50 text-indigo-700 font-bold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Modals */}
      <AskIntelModal
        isOpen={isAskOpen}
        onClose={() => setIsAskOpen(false)}
        onSelectEvent={(id) => setSelectedEventId(id)}
      />

      {selectedEventId && (
        <EventDetailModal
          eventId={selectedEventId}
          onClose={() => setSelectedEventId(null)}
        />
      )}
    </>
  );
}
