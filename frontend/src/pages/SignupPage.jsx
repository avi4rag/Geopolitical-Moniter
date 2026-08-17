import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Globe, Lock, Mail, User as UserIcon, ArrowRight, AlertCircle, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

// ─── Signup Page ──────────────────────────────────────────────────────────────
// Registration page matching the GeoMonitor news aesthetic.
// Supports email/password registration and standard Google OAuth 2.0.
// ─────────────────────────────────────────────────────────────────────────────

export default function SignupPage() {
  const { t } = useTranslation();
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [oauthNotice, setOauthNotice] = useState(null);

  // Check URL query params for OAuth redirect errors/notices
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const errParam = params.get('error');

    if (errParam === 'GOOGLE_OAUTH_NOT_CONFIGURED') {
      setOauthNotice(
        'Google OAuth requires GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET configured in backend/.env. Please use email/password sign-up or configure Google Cloud credentials.'
      );
    } else if (errParam === 'OAUTH_CANCELLED') {
      setError(t('auth.googleAuthCancelled'));
    } else if (errParam === 'INVALID_OAUTH_STATE') {
      setError(t('auth.oauthFailed'));
    } else if (errParam) {
      setError(`Authentication error: ${errParam.replace(/_/g, ' ')}`);
    }
  }, [location.search, t]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError(t('auth.passwordMismatch'));
      return;
    }

    setIsLoading(true);

    try {
      await register(name, email, password, confirmPassword);
      navigate('/');
    } catch (err) {
      setError(err.message || t('auth.registrationFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleOAuthRedirect = () => {
    const apiUrl = import.meta.env.VITE_API_URL || '/api/v1';
    window.location.href = `${apiUrl}/auth/google`;
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div
        className="w-full max-w-md p-8 rounded-2xl border shadow-2xl space-y-6"
        style={{
          backgroundColor: 'var(--color-surface-1)',
          borderColor: 'var(--color-border)',
        }}
      >
        {/* Brand Masthead */}
        <div className="text-center space-y-2">
          <div
            className="w-10 h-10 rounded-xl mx-auto flex items-center justify-center shadow-lg mb-3"
            style={{ background: 'var(--color-accent)' }}
          >
            <Globe size={20} color="#000" strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {t('auth.createAccount')}
          </h1>
          <p className="text-xs text-slate-400">
            {t('auth.signupSubtitle')}
          </p>
        </div>

        {/* OAuth Notice Alert */}
        {oauthNotice && (
          <div className="p-3.5 rounded-xl border border-amber-900/80 bg-amber-950/30 text-xs text-amber-300 flex items-start gap-2.5 leading-relaxed">
            <Info size={16} className="shrink-0 text-amber-400 mt-0.5" />
            <span>{oauthNotice}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-lg border border-rose-900/80 bg-rose-950/40 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle size={14} className="shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {t('auth.fullName')}
            </label>
            <div className="relative">
              <UserIcon
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                className="w-full pl-9 pr-3 py-2.5 text-xs rounded-lg border bg-slate-950 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
                style={{ borderColor: 'var(--color-border)' }}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {t('auth.email')}
            </label>
            <div className="relative">
              <Mail
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full pl-9 pr-3 py-2.5 text-xs rounded-lg border bg-slate-950 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
                style={{ borderColor: 'var(--color-border)' }}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {t('auth.password')}
            </label>
            <div className="relative">
              <Lock
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 text-xs rounded-lg border bg-slate-950 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
                style={{ borderColor: 'var(--color-border)' }}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {t('auth.confirmPassword')}
            </label>
            <div className="relative">
              <Lock
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 text-xs rounded-lg border bg-slate-950 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
                style={{ borderColor: 'var(--color-border)' }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md disabled:opacity-50 mt-2"
            style={{
              backgroundColor: 'var(--color-accent)',
              color: '#000',
            }}
          >
            {isLoading ? t('auth.creatingAccount') : t('auth.createAccountBtn')}
            <ArrowRight size={14} />
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-800 w-full" />
          <span className="bg-slate-900 px-3 text-[11px] text-slate-500 font-mono uppercase shrink-0">
            {t('auth.orSignUpWith')}
          </span>
        </div>

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleOAuthRedirect}
          className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold border border-slate-700 bg-slate-900 text-slate-200 hover:text-white hover:bg-slate-800 transition cursor-pointer flex items-center justify-center gap-2.5 shadow-sm active:scale-[0.99]"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>{t('auth.signupWithGoogle')}</span>
        </button>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400">
          {t('auth.alreadyHaveAccount')}{' '}
          <Link to="/login" className="text-amber-400 font-semibold hover:underline">
            {t('auth.signInLink')}
          </Link>
        </p>
      </div>
    </div>
  );
}
