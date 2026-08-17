import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Globe, Bookmark, User, LogIn, UserPlus, LogOut, Search, Sparkles, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import AskIntelModal from '../intel/AskIntelModal.jsx';
import EventDetailModal from '../events/EventDetailModal.jsx';
import LanguageSwitcher from '../common/LanguageSwitcher.jsx';

// ─── Navbar ───────────────────────────────────────────────────────────────────
// Fully responsive news masthead with desktop navigation, mobile drawer menu,
// Ask AI Intel assistant trigger, language switcher, bookmarks, and user auth.
// ─────────────────────────────────────────────────────────────────────────────

export default function Navbar() {
  const { t } = useTranslation();
  const location = useLocation();
  const { user, isAuthenticated, logout, bookmarks } = useAuth();
  const [isAskOpen, setIsAskOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const navLinks = [
    { href: '/', label: t('nav.newsFeed') },
    { href: '/search', label: t('nav.search') },
    { href: '/impacts', label: t('nav.domainImpacts') },
    { href: '/sources', label: t('nav.sources') },
    { href: '/stats', label: t('nav.analytics') },
  ];

  return (
    <>
      <header
        className="sticky top-0 z-40 border-b shadow-md"
        style={{
          background: 'color-mix(in srgb, var(--color-surface-1) 95%, transparent)',
          borderColor: 'var(--color-border)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Brand */}
            <Link
              to="/"
              onClick={closeMobileMenu}
              className="flex items-center gap-2 group shrink-0"
              aria-label="Geopolitical Monitor Home"
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center shadow-sm"
                style={{ background: 'var(--color-accent)' }}
              >
                <Globe size={14} color="#000" strokeWidth={2.5} />
              </div>
              <span className="text-base font-extrabold tracking-tight text-white">
                {t('nav.brand')}
              </span>
              <span
                className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase"
                style={{
                  background: 'var(--color-surface-3)',
                  color: 'var(--color-accent)',
                  border: '1px solid var(--color-border)',
                }}
              >
                {t('nav.newsBadge')}
              </span>
            </Link>

            {/* Desktop Navigation (Hidden on Mobile) */}
            <nav className="hidden md:flex items-center gap-1 lg:gap-2" role="navigation" aria-label="Main navigation">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150"
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

            {/* Right Tools: Language Switcher + Ask AI Intel + Auth Menu + Mobile Hamburger */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Language Switcher (Desktop) */}
              <div className="hidden sm:block">
                <LanguageSwitcher variant="dropdown" />
              </div>

              {/* Ask AI Intel trigger button */}
              <button
                onClick={() => {
                  closeMobileMenu();
                  setIsAskOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 hover:text-amber-300 text-xs font-bold transition cursor-pointer shadow-sm"
                title={t('intel.title')}
              >
                <Sparkles size={13} />
                <span className="hidden sm:inline font-mono">{t('nav.askAiIntel')}</span>
              </button>

              {/* Desktop Auth Controls */}
              {isAuthenticated ? (
                <div className="hidden sm:flex items-center gap-2">
                  <Link
                    to="/profile"
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs font-semibold hover:border-amber-500/50 hover:text-white transition"
                    title={t('profile.accountProfile')}
                  >
                    <Bookmark size={13} className="text-amber-400" />
                    <span className="font-mono">
                      ({bookmarks?.length || 0})
                    </span>
                  </Link>

                  <Link
                    to="/profile"
                    className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-mono font-bold text-xs hover:bg-amber-500/30 transition"
                    title={user?.name}
                  >
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </Link>
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white transition"
                  >
                    {t('nav.signIn')}
                  </Link>

                  <Link
                    to="/signup"
                    className="px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm"
                    style={{
                      backgroundColor: 'var(--color-accent)',
                      color: '#000',
                    }}
                  >
                    {t('nav.createAccount')}
                  </Link>
                </div>
              )}

              {/* Mobile Hamburger Toggle Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-1.5 rounded-lg border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800/80 transition cursor-pointer"
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Slide-Down Menu Drawer */}
        {isMobileMenuOpen && (
          <div
            className="md:hidden border-t border-slate-800 px-4 py-4 space-y-3 animate-in slide-in-from-top duration-200"
            style={{
              backgroundColor: 'var(--color-surface-1)',
            }}
          >
            {/* Mobile Language Switcher */}
            <div className="pb-1">
              <LanguageSwitcher variant="segmented" />
            </div>

            {/* Mobile Navigation Links */}
            <div className="grid grid-cols-2 gap-1.5">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={closeMobileMenu}
                    className="px-3 py-2 rounded-lg text-xs font-semibold transition"
                    style={{
                      color: isActive ? '#fff' : 'var(--color-text-secondary)',
                      background: isActive ? 'var(--color-surface-3)' : 'var(--color-surface-2)',
                      border: isActive ? '1px solid var(--color-border)' : '1px solid transparent',
                    }}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            {/* Mobile Auth / Profile Section */}
            <div className="pt-3 border-t border-slate-800/80 flex flex-col gap-2">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/profile"
                    onClick={closeMobileMenu}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-white"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold font-mono">
                        {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <div className="font-bold text-white">{user?.name || 'Reader'}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{user?.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-amber-400 font-mono text-xs">
                      <Bookmark size={12} />
                      <span>{bookmarks?.length || 0}</span>
                    </div>
                  </Link>

                  <button
                    onClick={() => {
                      logout();
                      closeMobileMenu();
                    }}
                    className="w-full py-2 px-3 rounded-lg border border-slate-800 text-xs font-semibold text-slate-400 hover:text-rose-400 hover:bg-slate-900 flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <LogOut size={13} />
                    <span>{t('nav.signOut')}</span>
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/login"
                    onClick={closeMobileMenu}
                    className="py-2.5 px-3 rounded-xl border border-slate-700 bg-slate-900 text-xs font-semibold text-center text-slate-200 hover:text-white"
                  >
                    {t('nav.signIn')}
                  </Link>
                  <Link
                    to="/signup"
                    onClick={closeMobileMenu}
                    className="py-2.5 px-3 rounded-xl text-xs font-bold text-center text-slate-950 shadow-sm"
                    style={{ backgroundColor: 'var(--color-accent)' }}
                  >
                    {t('nav.createAccount')}
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Ask AI Intel Modal */}
      <AskIntelModal
        isOpen={isAskOpen}
        onClose={() => setIsAskOpen(false)}
        onSelectEvent={(eventId) => setSelectedEventId(eventId)}
      />

      {/* Selected Event Detail Modal */}
      {selectedEventId && (
        <EventDetailModal
          eventId={selectedEventId}
          onClose={() => setSelectedEventId(null)}
        />
      )}
    </>
  );
}
