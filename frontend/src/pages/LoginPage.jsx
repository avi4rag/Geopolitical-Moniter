import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Globe, Lock, Mail, ArrowRight, AlertCircle, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

// ─── Situation Room Login Page ─────────────────────────────────────────────────
// All auth logic preserved. Light theme classes replaced with dark CSS variables.
// ─────────────────────────────────────────────────────────────────────────────

const inputStyle = {
  backgroundColor: 'var(--color-surface-2)',
  border: '1px solid var(--color-border)',
  color: 'var(--color-text-primary)',
};

export default function LoginPage() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [oauthNotice, setOauthNotice] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const errParam = params.get('error');
    if (errParam === 'GOOGLE_OAUTH_NOT_CONFIGURED') {
      setOauthNotice(
        'Google OAuth requires GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET configured in the environment. Please use email/password sign-in or provide credentials.'
      );
    } else if (errParam === 'OAUTH_CANCELLED') {
      setError('Google sign-in was cancelled.');
    } else if (errParam === 'INVALID_OAUTH_STATE') {
      setError('OAuth security state verification failed or timed out. Please try again.');
    } else if (errParam === 'TOKEN_EXCHANGE_FAILED' || errParam === 'OAUTH_PROCESSING_FAILED') {
      setError('Could not complete Google authentication. Please try again or sign in with email/password.');
    } else if (errParam) {
      setError(`Authentication notice: ${errParam.replace(/_/g, ' ')}`);
    }
  }, [location.search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleOAuthRedirect = () => {
    const base = (import.meta.env.VITE_API_URL || '/api/v1').replace(/\/+$/, '');
    window.location.href = `${base}/auth/google`;
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-8 px-4 w-full">
      <div className="w-full max-w-md p-6 sm:p-8 rounded-2xl glass-panel space-y-6 shadow-2xl">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400">
            <Globe size={22} />
          </div>
          <h1 className="font-headline text-2xl font-bold text-slate-100">
            {t('auth.welcomeBack', { defaultValue: 'Welcome back to GeoMonitor' })}
          </h1>
          <p className="text-xs font-mono text-slate-400">
            {t('auth.loginSubtitle', { defaultValue: 'Sign in to access your bookmarked intelligence dossiers' })}
          </p>
        </div>

        {/* OAuth notice */}
        {oauthNotice && (
          <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-950/30 text-amber-300 text-xs flex items-start gap-2.5 leading-relaxed font-mono">
            <Info size={14} className="shrink-0 mt-0.5 text-amber-400" />
            <span>{oauthNotice}</span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-950/40 text-rose-300 text-xs flex items-center gap-2 font-mono">
            <AlertCircle size={14} className="shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono font-semibold mb-1.5 text-slate-300">
              {t('auth.emailAddress', { defaultValue: 'Email address' })}
            </label>
            <div className="relative">
              <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="analyst@geomonitor.org"
                className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl font-mono glass-control text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400/60 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-semibold mb-1.5 text-slate-300">
              {t('auth.password', { defaultValue: 'Password' })}
            </label>
            <div className="relative">
              <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl font-mono glass-control text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400/60 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl text-xs font-mono font-bold cursor-pointer flex items-center justify-center gap-2 transition-all disabled:opacity-50 bg-cyan-500/20 text-cyan-200 border border-cyan-400/50 hover:bg-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.25)]"
          >
            {isLoading ? t('auth.signingIn', { defaultValue: 'Signing In...' }) : t('auth.signInButton', { defaultValue: 'Sign In to Account' })}
            <ArrowRight size={13} />
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-800/80 w-full" />
          <span className="px-3 text-[10px] font-mono uppercase shrink-0 bg-slate-950/80 text-slate-500">
            {t('auth.continueGoogle', { defaultValue: 'Or continue with Google' })}
          </span>
        </div>

        {/* Google OAuth */}
        <button
          type="button"
          onClick={handleGoogleOAuthRedirect}
          className="w-full py-2.5 px-4 rounded-xl text-xs font-mono font-semibold cursor-pointer flex items-center justify-center gap-2.5 transition glass-control text-slate-300 hover:text-white hover:bg-slate-800/60"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Sign up link */}
        <div className="text-center text-xs font-mono text-slate-400">
          {t('auth.dontHaveAccount', { defaultValue: "Don't have an account?" })}{' '}
          <Link to="/signup" className="font-bold text-cyan-400 hover:text-cyan-200 transition-colors">
            {t('auth.signUpLink', { defaultValue: 'Create account' })}
          </Link>
        </div>
      </div>
    </div>
  );
}
