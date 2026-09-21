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
      <div className="glass-panel p-6 sm:p-8 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-cyan-950/70 border border-cyan-500/40 flex items-center justify-center text-xl font-bold font-mono text-cyan-300 shadow-[0_0_16px_rgba(6,182,212,0.25)] shrink-0">
            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold font-headline text-slate-100">
              {user.name}
            </h1>
            <div className="flex items-center gap-3 text-xs font-mono flex-wrap">
              <span className="flex items-center gap-1.5 text-slate-400">
                <Mail size={12} className="text-cyan-400" />
                {user.email}
              </span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-1 font-bold text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded-md text-[10px] uppercase tracking-wider">
                <Shield size={11} className="text-cyan-400" />
                {user.role ? user.role.toUpperCase() : 'ANALYST'}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-mono font-bold cursor-pointer transition-all self-start sm:self-center border border-rose-500/30 bg-rose-950/40 text-rose-300 hover:bg-rose-900/50"
        >
          <LogOut size={13} />
          {t('nav.signOut', { defaultValue: 'Sign Out' })}
        </button>
      </div>

      {/* Bookmarked dossiers */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <h2 className="font-headline text-lg font-bold flex items-center gap-2 text-slate-100">
            <Bookmark size={18} className="text-cyan-400" />
            {t('profile.savedDossiers', { count: bookmarkedEvents.length, defaultValue: `Saved Dossiers (${bookmarkedEvents.length})` })}
          </h2>
        </div>

        {isLoading ? (
          <div className="py-16 text-center text-xs font-mono text-slate-400">
            {t('profile.loadingBookmarks', { defaultValue: 'Loading saved bookmarks...' })}
          </div>
        ) : bookmarkedEvents.length === 0 ? (
          <div className="glass-panel p-12 rounded-2xl text-center space-y-2">
            <Bookmark size={32} className="mx-auto text-slate-500" />
            <h3 className="text-sm font-bold font-headline text-slate-200">
              {t('profile.noBookmarks', { defaultValue: 'No saved dossiers yet' })}
            </h3>
            <p className="text-xs font-mono max-w-sm mx-auto text-slate-400">
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
                  className="absolute top-4 right-4 p-1.5 rounded-xl border border-rose-500/30 bg-rose-950/60 text-rose-300 hover:bg-rose-900 cursor-pointer z-10 opacity-0 group-hover:opacity-100 transition-opacity"
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
