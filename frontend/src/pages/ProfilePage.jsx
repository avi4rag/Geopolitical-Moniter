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

    // 1. Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setUploadError('Please select a valid image file (JPEG, PNG, WEBP, or GIF).');
      return;
    }

    // 2. Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size exceeds 5MB limit. Please choose a smaller file.');
      return;
    }

    // 3. Show preview immediately
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('avatar', file);

      // 4. Upload to existing Multer endpoint
      const uploadRes = await apiClient.post('/uploads/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const uploadedUrl = uploadRes.data?.data?.files?.[0]?.url;
      if (!uploadedUrl) {
        throw new Error('Failed to retrieve uploaded image URL');
      }

      // 5. Persist avatar URL to User document
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
      {/* ── USER ACCOUNT & INTERACTIVE AVATAR HEADER ──────────────────────── */}
      <div
        className="p-6 rounded-xl border border-white/[0.08] shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
        style={{ backgroundColor: 'rgba(15, 23, 42, 0.60)', backdropFilter: 'blur(12px)' }}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 w-full md:w-auto">
          {/* Avatar Container with interactive upload trigger */}
          <div className="relative group shrink-0">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-indigo-400/40 bg-slate-950 flex items-center justify-center shadow-xl relative cursor-pointer transition-transform duration-200 group-hover:scale-[1.02]"
              title="Click to change profile picture"
            >
              {currentDisplayAvatar ? (
                <img
                  src={currentDisplayAvatar}
                  alt={user.name || 'Profile'}
                  className="w-full h-full object-cover"
                  onError={() => setAvatarPreview(null)}
                />
              ) : (
                <span className="text-2xl sm:text-3xl font-mono-code font-bold text-indigo-300">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </span>
              )}

              {/* Uploading loading spinner overlay */}
              {isUploading && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center gap-1 z-20">
                  <Loader2 size={20} className="animate-spin text-indigo-400" />
                  <span className="text-[9px] font-mono-code text-slate-300 font-bold">SAVING</span>
                </div>
              )}

              {/* Hover overlay hint */}
              {!isUploading && (
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-white z-10">
                  <Camera size={18} />
                  <span className="text-[9px] font-mono-code uppercase font-bold tracking-wider">Change</span>
                </div>
              )}
            </div>

            {/* Active presence dot */}
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-950 shadow" />
          </div>

          {/* User details */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold font-headline text-white">
                {user.name}
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono-code font-bold uppercase tracking-wider bg-indigo-500/15 border border-indigo-400/30 text-indigo-300">
                {user.role ? user.role.toUpperCase() : 'ANALYST'}
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono-code text-slate-400 flex-wrap">
              <span className="flex items-center gap-1 text-slate-300">
                <Mail size={12} className="text-slate-400" />
                {user.email}
              </span>
              <span>•</span>
              <span className="text-slate-400">
                Auth: <strong className="text-slate-300 font-bold">{user.authProvider || 'LOCAL'}</strong>
              </span>
            </div>

            {/* Photo controls */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleFileSelect}
                className="hidden"
                disabled={isUploading}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono-code font-semibold tracking-wider bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 border border-white/10 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Camera size={12} />
                <span>{user.avatar ? 'Change Photo' : 'Upload Photo'}</span>
              </button>

              {user.avatar && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  disabled={isUploading}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono-code font-semibold tracking-wider text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 transition-colors cursor-pointer disabled:opacity-50"
                  title="Remove custom profile picture"
                >
                  <Trash2 size={12} />
                  <span>Remove</span>
                </button>
              )}
            </div>

            {/* Upload feedback messages */}
            {uploadError && (
              <div className="flex items-center gap-1.5 text-xs font-mono-code text-rose-400 pt-1">
                <AlertCircle size={13} className="shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}
            {uploadSuccess && (
              <div className="flex items-center gap-1.5 text-xs font-mono-code text-emerald-400 pt-1">
                <CheckCircle2 size={13} className="shrink-0" />
                <span>Profile picture updated successfully</span>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={logout}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-mono-code font-bold cursor-pointer transition-colors self-start md:self-center"
          style={{
            color: '#e11d48',
            border: '1px solid rgba(225,29,72,0.30)',
            backgroundColor: 'rgba(225,29,72,0.10)',
          }}
        >
          <LogOut size={13} />
          {t('nav.signOut', { defaultValue: 'Sign Out' })}
        </button>
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
