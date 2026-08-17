import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check, ChevronDown } from 'lucide-react';

// ─── Language Switcher ────────────────────────────────────────────────────────
// Dropdown and toggle selector for English / हिन्दी with persistence.
// ─────────────────────────────────────────────────────────────────────────────

const LANGUAGES = [
  { code: 'en', label: 'English', nativeName: 'English', short: 'EN' },
  { code: 'hi', label: 'Hindi', nativeName: 'हिन्दी', short: 'हिं' },
];

export default function LanguageSwitcher({ variant = 'dropdown', className = '' }) {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentLangCode = i18n.language?.startsWith('hi') ? 'hi' : 'en';
  const currentLang = LANGUAGES.find((l) => l.code === currentLangCode) || LANGUAGES[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelectLanguage = (code) => {
    i18n.changeLanguage(code);
    setIsOpen(false);
  };

  // Mobile segmented pill variant
  if (variant === 'segmented') {
    return (
      <div
        className={`flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 ${className}`}
        role="group"
        aria-label={t('nav.switchLanguage')}
      >
        {LANGUAGES.map((lang) => {
          const isActive = currentLangCode === lang.code;
          return (
            <button
              key={lang.code}
              onClick={() => handleSelectLanguage(lang.code)}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                isActive
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <span>{lang.nativeName}</span>
              {isActive && <Check size={12} strokeWidth={3} />}
            </button>
          );
        })}
      </div>
    );
  }

  // Desktop dropdown variant
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={t('nav.switchLanguage')}
        aria-expanded={isOpen}
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-800 bg-slate-900/80 hover:bg-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition cursor-pointer shadow-sm"
      >
        <Globe size={13} className="text-amber-400 shrink-0" />
        <span className="font-medium">{currentLang.nativeName}</span>
        <ChevronDown
          size={12}
          className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-1.5 w-36 rounded-xl border border-slate-800 bg-slate-950 p-1.5 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150"
          style={{ backgroundColor: 'var(--color-surface-1)' }}
        >
          <div className="text-[10px] font-mono font-bold text-slate-500 px-2 py-1 uppercase tracking-wider">
            {t('nav.switchLanguage')}
          </div>
          {LANGUAGES.map((lang) => {
            const isActive = currentLangCode === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => handleSelectLanguage(lang.code)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                  isActive
                    ? 'bg-amber-500/15 text-amber-300 font-bold'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{lang.nativeName}</span>
                  <span className="text-[10px] text-slate-500 font-mono">({lang.short})</span>
                </div>
                {isActive && <Check size={13} className="text-amber-400" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
