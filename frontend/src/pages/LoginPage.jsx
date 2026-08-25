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
      setOauthNotice('Google OAuth requires GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET configured in backend/.env. Please use email/password sign-in.');
    } else if (errParam === 'OAUTH_CANCELLED') {
      setError('Google sign-in was cancelled.');
    } else if (errParam === 'INVALID_OAUTH_STATE') {
      setError('Invalid OAuth state. Please try again.');
    } else if (errParam) {
      setError(`Authentication error: ${errParam.replace(/_/g, ' ')}`);
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
    const apiUrl = import.meta.env.VITE_API_URL || '/api/v1';
    window.location.href = `${apiUrl}/auth/google`;
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-8 px-4 w-full">
      <div
        className="w-full max-w-md p-6 sm:p-8 rounded-lg border space-y-6"
        style={{ backgroundColor: 'var(--color-surface-1)', borderColor: 'var(--color-border)' }}
      >
        {/* Brand */}
        <div className="text-center space-y-2">
          <div
            className="w-12 h-12 rounded flex items-center justify-center mx-auto"
            style={{ backgroundColor: 'var(--color-surface-4)', border: '1px solid var(--color-border)' }}
          >
            <Globe size={22} style={{ color: 'var(--color-accent)' }} />
          </div>
          <h1 className="font-headline text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            {t('auth.welcomeBack', { defaultValue: 'Welcome back to GeoMonitor' })}
          </h1>
          <p className="text-xs font-mono-code" style={{ color: 'var(--color-text-muted)' }}>
            {t('auth.loginSubtitle', { defaultValue: 'Sign in to access your bookmarked intelligence dossiers' })}
          </p>
        </div>

        {/* OAuth notice */}
        {oauthNotice && (
          <div className="p-3.5 rounded border text-xs flex items-start gap-2.5 leading-relaxed" style={{ backgroundColor: 'rgba(245,158,11,0.10)', borderColor: 'rgba(245,158,11,0.30)', color: '#f59e0b' }}>
            <Info size={14} className="shrink-0 mt-0.5" />
            <span>{oauthNotice}</span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-3.5 rounded border text-xs flex items-center gap-2" style={{ backgroundColor: 'rgba(225,29,72,0.10)', borderColor: 'rgba(225,29,72,0.30)', color: '#e11d48' }}>
            <AlertCircle size={14} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono-code font-semibold mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
              {t('auth.emailAddress', { defaultValue: 'Email address' })}
            </label>
            <div className="relative">
              <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--color-text-dim)' }} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="analyst@geomonitor.org"
                className="w-full pl-9 pr-3 py-2.5 text-xs rounded font-mono-code"
                style={inputStyle}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono-code font-semibold mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
              {t('auth.password', { defaultValue: 'Password' })}
            </label>
            <div className="relative">
              <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--color-text-dim)' }} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 text-xs rounded font-mono-code"
                style={inputStyle}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded text-xs font-mono-code font-bold cursor-pointer flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            style={{ backgroundColor: 'var(--color-accent-bg)', border: '1px solid var(--color-accent-border)', color: 'var(--color-accent)' }}
          >
            {isLoading ? t('auth.signingIn', { defaultValue: 'Signing In...' }) : t('auth.signInButton', { defaultValue: 'Sign In to Account' })}
            <ArrowRight size={13} />
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t w-full" style={{ borderColor: 'var(--color-border)' }} />
          <span className="px-3 text-[10px] font-mono-code uppercase shrink-0" style={{ backgroundColor: 'var(--color-surface-1)', color: 'var(--color-text-dim)' }}>
            {t('auth.continueGoogle', { defaultValue: 'Or continue with Google' })}
          </span>
        </div>

        {/* Google OAuth */}
        <button
          type="button"
          onClick={handleGoogleOAuthRedirect}
          className="w-full py-2.5 px-4 rounded text-xs font-mono-code font-semibold cursor-pointer flex items-center justify-center gap-2.5 transition-colors"
          style={{ backgroundColor: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}
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
        <div className="text-center text-xs font-mono-code" style={{ color: 'var(--color-text-muted)' }}>
          {t('auth.dontHaveAccount', { defaultValue: "Don't have an account?" })}{' '}
          <Link to="/signup" className="font-bold transition-colors" style={{ color: 'var(--color-accent)' }}>
            {t('auth.signUpLink', { defaultValue: 'Create account' })}
          </Link>
        </div>
      </div>
    </div>
  );
}
