import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Globe, Lock, Mail, User as UserIcon, ArrowRight, AlertCircle, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

// ─── Editorial Signup Page ────────────────────────────────────────────────────
// Clean registration page matching the GeoMonitor news aesthetic.
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

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const errParam = params.get('error');

    if (errParam === 'GOOGLE_OAUTH_NOT_CONFIGURED') {
      setOauthNotice(
        'Google OAuth requires GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET configured in backend/.env. Please use email/password sign-up or configure Google Cloud credentials.'
      );
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

    if (password !== confirmPassword) {
      setError(t('auth.passwordsDoNotMatch', { defaultValue: 'Passwords do not match' }));
      return;
    }

    setIsLoading(true);

    try {
      await register(name, email, password, confirmPassword);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleOAuthRedirect = () => {
    const apiUrl = import.meta.env.VITE_API_URL || '/api/v1';
    window.location.href = `${apiUrl}/auth/google`;
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-8 px-4 w-full">
      <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl border border-slate-200 bg-white shadow-xl space-y-6">
        {/* Brand & Heading */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center mx-auto shadow-xs">
            <Globe size={24} />
          </div>
          <h1 className="text-2xl font-black text-slate-950 tracking-tight">
            {t('auth.createAccount', { defaultValue: 'Create your GeoMonitor account' })}
          </h1>
          <p className="text-xs text-slate-500">
            {t('auth.signupSubtitle', { defaultValue: 'Join the real-time global intelligence network' })}
          </p>
        </div>

        {/* OAuth Notice */}
        {oauthNotice && (
          <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50 text-xs text-amber-800 flex items-start gap-2.5 leading-relaxed">
            <Info size={16} className="shrink-0 text-amber-600 mt-0.5" />
            <span>{oauthNotice}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50 text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              {t('auth.fullName', { defaultValue: 'Full Name' })}
            </label>
            <div className="relative">
              <UserIcon
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-400 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              {t('auth.emailAddress', { defaultValue: 'Email address' })}
            </label>
            <div className="relative">
              <Mail
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="analyst@geomonitor.org"
                className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-400 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              {t('auth.password', { defaultValue: 'Password' })}
            </label>
            <div className="relative">
              <Lock
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-400 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              {t('auth.confirmPassword', { defaultValue: 'Confirm Password' })}
            </label>
            <div className="relative">
              <Lock
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-400 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-full text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
          >
            {isLoading
              ? t('auth.creatingAccount', { defaultValue: 'Creating Account...' })
              : t('auth.signUpButton', { defaultValue: 'Create Account' })}
            <ArrowRight size={14} />
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-200 w-full" />
          <span className="bg-white px-3 text-[11px] text-slate-400 font-mono uppercase shrink-0">
            {t('auth.continueGoogle', { defaultValue: 'Or continue with Google' })}
          </span>
        </div>

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleOAuthRedirect}
          className="w-full py-2.5 px-4 rounded-full text-xs font-semibold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-950 transition cursor-pointer flex items-center justify-center gap-2.5 shadow-2xs"
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
          <span>Continue with Google</span>
        </button>

        {/* Sign in link */}
        <div className="text-center text-xs text-slate-500">
          <span>{t('auth.alreadyHaveAccount', { defaultValue: 'Already have an account?' })} </span>
          <Link to="/login" className="text-indigo-700 font-bold hover:underline">
            {t('auth.signInLink', { defaultValue: 'Sign in' })}
          </Link>
        </div>
      </div>
    </div>
  );
}
