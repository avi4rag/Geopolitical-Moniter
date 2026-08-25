import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Bookmark, LogOut, Shield, Mail, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import apiClient from '../lib/apiClient.js';
import NewsCard from '../components/feed/NewsCard.jsx';

// ─── Situation Room Profile & Bookmarks Page ───────────────────────────────────
// User account info + bookmarked dossiers. Uses navigate() instead of modal.
// ─────────────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, logout, toggleBookmark } = useAuth();
  const [bookmarkedEvents, setBookmarkedEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    apiClient.get('/users/bookmarks')
      .then((res) => { if (isMounted) setBookmarkedEvents(res.data || []); })
      .catch((err) => console.error('Failed to load user bookmarks:', err))
      .finally(() => { if (isMounted) setIsLoading(false); });
    return () => { isMounted = false; };
  }, []);

  const handleRemoveBookmark = async (eventId, e) => {
    e.stopPropagation();
    await toggleBookmark(eventId);
    setBookmarkedEvents((prev) => prev.filter((ev) => ev._id !== eventId));
  };

  if (!user) return null;

  return (
    <div className="space-y-8 max-w-5xl mx-auto w-full">
      {/* Account header */}
      <div
        className="p-6 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-6"
        style={{ backgroundColor: 'var(--color-surface-1)', borderColor: 'var(--color-border)' }}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded flex items-center justify-center text-xl font-bold font-mono-code shrink-0"
            style={{ backgroundColor: 'var(--color-accent-bg)', border: '1px solid var(--color-accent-border)', color: 'var(--color-accent)' }}
          >
            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-bold font-headline" style={{ color: 'var(--color-text-primary)' }}>
              {user.name}
            </h1>
            <div className="flex items-center gap-3 text-xs font-mono-code flex-wrap">
              <span className="flex items-center gap-1" style={{ color: 'var(--color-text-muted)' }}>
                <Mail size={11} style={{ color: 'var(--color-text-dim)' }} />
                {user.email}
              </span>
              <span style={{ color: 'var(--color-border)' }}>•</span>
              <span className="flex items-center gap-1 font-bold" style={{ color: 'var(--color-accent)' }}>
                <Shield size={11} />
                {user.role ? user.role.toUpperCase() : 'ANALYST'}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded text-xs font-mono-code font-bold cursor-pointer transition-colors self-start sm:self-center"
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

      {/* Bookmarked dossiers */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--color-border)' }}>
          <h2 className="font-headline text-lg font-bold flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
            <Bookmark size={18} style={{ color: 'var(--color-accent)' }} />
            {t('profile.savedDossiers', { count: bookmarkedEvents.length, defaultValue: `Saved Dossiers (${bookmarkedEvents.length})` })}
          </h2>
        </div>

        {isLoading ? (
          <div className="py-16 text-center text-xs font-mono-code" style={{ color: 'var(--color-text-dim)' }}>
            {t('profile.loadingBookmarks', { defaultValue: 'Loading saved bookmarks...' })}
          </div>
        ) : bookmarkedEvents.length === 0 ? (
          <div className="p-12 rounded-lg border text-center space-y-2" style={{ backgroundColor: 'var(--color-surface-1)', borderColor: 'var(--color-border)' }}>
            <Bookmark size={32} className="mx-auto" style={{ color: 'var(--color-text-dim)' }} />
            <h3 className="text-sm font-bold font-headline" style={{ color: 'var(--color-text-primary)' }}>
              {t('profile.noBookmarks', { defaultValue: 'No saved dossiers yet' })}
            </h3>
            <p className="text-xs font-mono-code max-w-sm mx-auto" style={{ color: 'var(--color-text-muted)' }}>
              {t('profile.noBookmarksDesc', { defaultValue: 'Bookmark geopolitical events from the news feed to review and track them here.' })}
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
                    backgroundColor: 'rgba(225,29,72,0.10)',
                    borderColor: 'rgba(225,29,72,0.30)',
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
