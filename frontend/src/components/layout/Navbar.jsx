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
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import AskIntelModal from '../intel/AskIntelModal.jsx';
import EventDetailModal from '../events/EventDetailModal.jsx';

// ─── Reference Design Navigation Masthead ─────────────────────────────────────
// Features rounded pill category tags with '+' suffix, brand pill button,
// clean language toggle, and dedicated rounded search input.
// ─────────────────────────────────────────────────────────────────────────────

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [isAskOpen, setIsAskOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);

  const currentLang = i18n.language || 'en';

  const navPills = [
    { href: '/', label: 'All', activeKey: '/' },
    { href: '/', label: 'News', activeKey: '/news' },
    { href: '/impacts', label: 'Impacts', activeKey: '/impacts' },
    { href: '/sources', label: 'Sources', activeKey: '/sources' },
    { href: '/stats', label: 'Analytics', activeKey: '/stats' },
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
      <header className="w-full px-4 sm:px-6 lg:px-8 py-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Section: Brand Pill + Category Pills */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
          {/* Brand Pill */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-900 font-bold text-xs sm:text-sm transition-all shrink-0"
          >
            <div className="w-4 h-4 rounded-full bg-slate-900 flex items-center justify-center text-white">
              <Globe size={11} />
            </div>
            <span>{t('nav.brand', { defaultValue: 'GeoMonitor' })}</span>
          </Link>

          {/* Navigation Category Pills with '+' */}
          <nav className="hidden sm:flex items-center gap-1.5 flex-wrap" role="navigation">
            {navPills.map((pill) => {
              const isActive = location.pathname === pill.activeKey || (pill.activeKey === '/' && location.pathname === '/');
              return (
                <Link
                  key={pill.label}
                  to={pill.href}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1 ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100/90 text-slate-700 hover:bg-slate-200/80 hover:text-slate-900 border border-transparent'
                  }`}
                >
                  <span>{pill.label}</span>
                  <span className="text-[11px] opacity-60 font-mono">+</span>
                </Link>
              );
            })}

            {/* Ask AI Intel Pill Button */}
            <button
              onClick={() => setIsAskOpen(true)}
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/60 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles size={12} className="text-indigo-600" />
              <span>{t('nav.askAiIntel', { defaultValue: 'Ask Intel' })}</span>
              <span className="text-[11px] opacity-60 font-mono">+</span>
            </button>
          </nav>
        </div>

        {/* Right Section: Language Toggle + Rounded Search Bar + Auth */}
        <div className="flex items-center gap-3 justify-between sm:justify-end shrink-0">
          {/* Language Toggle Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
            >
              <span className="uppercase">{currentLang.substring(0, 2)}</span>
              <ChevronDown size={12} className="text-slate-400" />
            </button>

            {isLangDropdownOpen && (
              <div className="absolute right-0 mt-1 w-28 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-50 animate-in fade-in duration-150">
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

          {/* Sleek Rounded Search Bar (matches reference top-right input) */}
          <form onSubmit={handleSearchSubmit} className="relative w-48 sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Article name, tag, category..."
              className="w-full pl-4 pr-9 py-2 rounded-2xl bg-slate-100/90 border border-slate-200/80 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-400 transition shadow-inner"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <Search size={14} />
            </button>
          </form>

          {/* User Auth controls */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link
                to="/profile"
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold transition"
                title={user?.name}
              >
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </Link>
            </div>
          ) : (
            <Link
              to="/login"
              className="hidden lg:inline-flex px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-700 hover:text-slate-950 hover:bg-slate-100 transition"
            >
              {t('nav.signIn', { defaultValue: 'Sign In' })}
            </Link>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="sm:hidden p-2 rounded-full bg-slate-100 text-slate-700"
          >
            {isMobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="sm:hidden px-4 py-3 border-b border-slate-100 bg-slate-50 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            {navPills.map((pill) => (
              <Link
                key={pill.label}
                to={pill.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800"
              >
                {pill.label}
              </Link>
            ))}
          </div>
        </div>
      )}

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
