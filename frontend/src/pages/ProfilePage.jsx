import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Bookmark,
  LogOut,
  Shield,
  Mail,
  Trash2,
  Camera,
  Loader2,
  CheckCircle2,
  AlertCircle,
  User as UserIcon,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import apiClient from '../lib/apiClient.js';
import NewsCard from '../components/feed/NewsCard.jsx';

// ─── Situation Room Profile & Bookmarks Page ───────────────────────────────────
// User account info + interactive profile picture upload + bookmarked dossiers.
// Supports file validation, preview, loading state, backend persistence, and reset.
// ─────────────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, logout, toggleBookmark, updateAvatar } = useAuth();
  const [bookmarkedEvents, setBookmarkedEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Avatar upload state
  const fileInputRef = useRef(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);

  useEffect(() => {
    let isMounted = true;
    apiClient
      .get('/users/bookmarks')
      .then((res) => {
        if (isMounted) setBookmarkedEvents(res.data || []);
      })
      .catch((err) => console.error('Failed to load user bookmarks:', err))
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleRemoveBookmark = async (eventId, e) => {
    e.stopPropagation();
    await toggleBookmark(eventId);
    setBookmarkedEvents((prev) => prev.filter((ev) => ev._id !== eventId));
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError('');
    setUploadSuccess(false);

    // 1. Validate file type (strictly JPEG, PNG, WEBP)
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setUploadError('Please select a valid image file (JPEG, PNG, or WEBP).');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // 2. Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size exceeds the 5MB limit. Please choose a smaller file.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // 3. Show preview immediately
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('avatar', file);

      // 4. Upload to Multer endpoint
      const uploadRes = await apiClient.post('/uploads/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const uploadedUrl = uploadRes.data?.data?.files?.[0]?.url;
      if (!uploadedUrl) {
        throw new Error('Failed to retrieve uploaded image URL');
      }

      // 5. Persist avatar URL to User document in MongoDB
      await updateAvatar(uploadedUrl);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 4000);
    } catch (err) {
      console.error('Avatar upload failed:', err);
      setUploadError(err.response?.data?.message || err.message || 'Failed to upload profile picture.');
      setAvatarPreview(null);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      setIsUploading(true);
      setUploadError('');
      setUploadSuccess(false);
      await updateAvatar('');
      setAvatarPreview(null);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (err) {
      console.error('Avatar removal failed:', err);
      setUploadError('Failed to remove profile picture.');
    } finally {
      setIsUploading(false);
    }
  };

  if (!user) return null;

  const currentDisplayAvatar = avatarPreview || user.avatar;

  return (
    <div className="space-y-8 max-w-5xl mx-auto w-full">
      {/* ── SITUATION ROOM PROFILE DOSSIER HEADER ─────────────────────────── */}
      <div className="flex items-center justify-between gap-4 border-b border-white/[0.08] pb-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <h1 className="font-headline text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>OFFICER PROFILE</span>
            <span className="text-xs font-mono-code font-normal text-slate-500">//</span>
            <span className="text-xs font-mono-code font-medium text-cyan-400/90 tracking-widest uppercase">
              SITUATION ROOM INTEL
            </span>
          </h1>
        </div>

        <button
          onClick={logout}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono-code font-semibold cursor-pointer transition-all hover:brightness-110"
          style={{
            color: '#f43f5e',
            border: '1px solid rgba(244,63,94,0.30)',
            backgroundColor: 'rgba(244,63,94,0.08)',
          }}
          title={t('nav.signOut', { defaultValue: 'Sign Out' })}
        >
          <LogOut size={13} />
          <span>{t('nav.signOut', { defaultValue: 'Sign Out' })}</span>
        </button>
      </div>

      {/* ── PROFILE & PHOTO MANAGEMENT CARD ───────────────────────────────── */}
      <div
        className="p-6 sm:p-8 rounded-2xl border border-white/[0.08] shadow-2xl relative overflow-hidden"
        style={{
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(16px)',
        }}
      >
        {/* Subtle decorative background telemetry grid */}
        <div
          className="absolute inset-0 pointer-events-none opacity-5"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }}
        />

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
          {/* ── Profile Photo Section (Centered column on left/top) ─────────── */}
          <div className="flex flex-col items-center text-center shrink-0 w-full sm:w-auto">
            {/* Avatar Frame with hover overlay & click trigger */}
            <div className="relative group">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-2 border-cyan-500/40 bg-slate-950 flex items-center justify-center shadow-2xl relative cursor-pointer transition-all duration-300 group-hover:scale-[1.03] group-hover:border-cyan-400 group-hover:shadow-[0_0_25px_rgba(34,211,238,0.25)]"
                title="Click to select new profile photo"
              >
                {currentDisplayAvatar ? (
                  <img
                    src={currentDisplayAvatar}
                    alt={user.name || 'Profile'}
                    className="w-full h-full object-cover"
                    onError={() => setAvatarPreview(null)}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center gap-1">
                    <UserIcon size={44} className="text-cyan-400/70" />
                    <span className="text-[10px] font-mono-code font-bold text-slate-400 uppercase tracking-widest">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'USER'}
                    </span>
                  </div>
                )}

                {/* Uploading loading spinner overlay */}
                {isUploading && (
                  <div className="absolute inset-0 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center gap-2 z-20">
                    <Loader2 size={24} className="animate-spin text-cyan-400" />
                    <span className="text-[9px] font-mono-code text-cyan-200 font-bold tracking-widest uppercase">
                      SAVING...
                    </span>
                  </div>
                )}

                {/* Hover overlay hint */}
                {!isUploading && (
                  <div className="absolute inset-0 bg-slate-950/75 opacity-0 group-hover:opacity-100 transition-all duration-200 flex flex-col items-center justify-center gap-1.5 text-white z-10 backdrop-blur-[2px]">
                    <Camera size={22} className="text-cyan-400" />
                    <span className="text-[10px] font-mono-code uppercase font-bold tracking-wider text-slate-200">
                      Change Photo
                    </span>
                  </div>
                )}
              </div>

              {/* Online/Active security pulse badge */}
              <span
                className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-950 shadow-md"
                title="Officer Active"
              />
            </div>

            {/* Hidden native file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isUploading}
            />

            {/* Action buttons directly below photo */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono-code font-semibold tracking-wider transition-all cursor-pointer shadow-sm disabled:opacity-50"
                style={{
                  backgroundColor: 'rgba(34, 211, 238, 0.12)',
                  border: '1px solid rgba(34, 211, 238, 0.35)',
                  color: '#38bdf8',
                }}
              >
                <Camera size={13} />
                <span>{user.avatar ? 'Change Photo' : 'Upload Photo'}</span>
              </button>

              {user.avatar && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  disabled={isUploading}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono-code font-semibold tracking-wider text-rose-400 hover:text-rose-300 transition-colors cursor-pointer disabled:opacity-50"
                  style={{
                    backgroundColor: 'rgba(244, 63, 94, 0.10)',
                    border: '1px solid rgba(244, 63, 94, 0.25)',
                  }}
                  title="Remove custom profile picture"
                >
                  <Trash2 size={13} />
                  <span>Remove</span>
                </button>
              )}
            </div>

            <p className="text-[10px] font-mono-code text-slate-500 mt-2 tracking-wide">
              JPG, PNG, WEBP (MAX 5MB)
            </p>

            {/* Upload Feedback Messages */}
            {uploadError && (
              <div className="mt-3 flex items-center gap-1.5 text-xs font-mono-code text-rose-400 bg-rose-500/10 border border-rose-500/25 px-3 py-1.5 rounded-lg">
                <AlertCircle size={14} className="shrink-0" />
                <span className="text-left">{uploadError}</span>
              </div>
            )}
            {uploadSuccess && (
              <div className="mt-3 flex items-center gap-1.5 text-xs font-mono-code text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-3 py-1.5 rounded-lg">
                <CheckCircle2 size={14} className="shrink-0" />
                <span>Profile picture updated successfully</span>
              </div>
            )}
          </div>

          {/* ── User & Account Dossier Information ───────────────────────────── */}
          <div className="flex-1 w-full space-y-5 border-t md:border-t-0 md:border-l border-white/[0.08] pt-6 md:pt-0 md:pl-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono-code uppercase tracking-widest text-slate-500 font-semibold">
                  IDENTIFIER // AGENT NAME
                </span>
                <h2 className="text-2xl font-bold font-headline text-white tracking-tight">
                  {user.name}
                </h2>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-1 rounded text-[11px] font-mono-code font-bold uppercase tracking-wider bg-cyan-500/10 border border-cyan-400/30 text-cyan-300">
                  {user.role ? user.role.toUpperCase() : 'ANALYST'}
                </span>
                <span className="px-2.5 py-1 rounded text-[11px] font-mono-code font-bold uppercase tracking-wider bg-purple-500/10 border border-purple-400/30 text-purple-300">
                  AUTH: {user.authProvider || 'LOCAL'}
                </span>
              </div>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="p-3.5 rounded-xl border border-white/[0.06] bg-slate-900/40 space-y-1">
                <span className="text-[10px] font-mono-code text-slate-500 uppercase tracking-widest">
                  COMMUNICATION // EMAIL
                </span>
                <div className="flex items-center gap-2 text-xs font-mono-code text-slate-200">
                  <Mail size={13} className="text-cyan-400/80 shrink-0" />
                  <span className="truncate">{user.email}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-white/[0.06] bg-slate-900/40 space-y-1">
                <span className="text-[10px] font-mono-code text-slate-500 uppercase tracking-widest">
                  ACCESS CLEARANCE
                </span>
                <div className="flex items-center gap-2 text-xs font-mono-code text-emerald-400">
                  <Shield size={13} className="text-emerald-400 shrink-0" />
                  <span className="tracking-wide">VERIFIED SITUATION ROOM</span>
                </div>
              </div>
            </div>

            {/* Dossier Telemetry Metrics */}
            <div className="p-4 rounded-xl border border-white/[0.06] bg-slate-900/30 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono-code text-slate-500 uppercase tracking-widest block">
                  BOOKMARKED DOSSIERS
                </span>
                <span className="text-lg font-bold font-mono-code text-cyan-300">
                  {bookmarkedEvents.length} Active
                </span>
              </div>
              <div>
                <span className="text-[10px] font-mono-code text-slate-500 uppercase tracking-widest block">
                  SESSION INTEGRITY
                </span>
                <span className="text-xs font-mono-code text-emerald-400 font-semibold">
                  SECURE (HTTP-ONLY)
                </span>
              </div>
              <div>
                <span className="text-[10px] font-mono-code text-slate-500 uppercase tracking-widest block">
                  ACCOUNT STATUS
                </span>
                <span className="text-xs font-mono-code text-slate-300 font-semibold">
                  ACTIVE ANALYST
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── BOOKMARKED INTELLIGENCE DOSSIERS ─────────────────────────────── */}
      <div className="space-y-4">
        <div
          className="flex items-center justify-between border-b pb-3"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <h2
            className="font-headline text-lg font-bold flex items-center gap-2"
            style={{ color: 'var(--color-text-primary)' }}
          >
            <Bookmark size={18} style={{ color: 'var(--color-accent)' }} />
            {t('profile.savedDossiers', {
              count: bookmarkedEvents.length,
              defaultValue: `Saved Dossiers (${bookmarkedEvents.length})`,
            })}
          </h2>
        </div>

        {isLoading ? (
          <div className="py-16 text-center text-xs font-mono-code text-slate-500">
            {t('profile.loadingBookmarks', { defaultValue: 'Loading saved bookmarks...' })}
          </div>
        ) : bookmarkedEvents.length === 0 ? (
          <div
            className="p-12 rounded-xl border border-white/[0.08] text-center space-y-2 bg-slate-900/30"
          >
            <Bookmark size={32} className="mx-auto text-slate-600" />
            <h3 className="text-sm font-bold font-headline text-slate-300">
              {t('profile.noBookmarks', { defaultValue: 'No saved dossiers yet' })}
            </h3>
            <p className="text-xs font-mono-code max-w-sm mx-auto text-slate-500">
              {t('profile.noBookmarksDesc', {
                defaultValue:
                  'Bookmark geopolitical events from the news feed to review and track them here.',
              })}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {bookmarkedEvents.map((event) => (
              <div key={event._id} className="relative group">
                <NewsCard
                  event={event}
                  onSelect={(e) => navigate(`/event/${e._id}`)}
                />
                <button
                  onClick={(e) => handleRemoveBookmark(event._id, e)}
                  title={t('profile.remove', { defaultValue: 'Remove' })}
                  className="absolute top-4 right-4 p-1.5 rounded border cursor-pointer z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{
                    backgroundColor: 'rgba(225,29,72,0.15)',
                    borderColor: 'rgba(225,29,72,0.35)',
                    color: '#e11d48',
                  }}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
