import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bookmark, LogOut, Shield, Mail, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import apiClient from '../lib/apiClient.js';
import NewsCard from '../components/feed/NewsCard.jsx';
import EventDetailModal from '../components/events/EventDetailModal.jsx';

// ─── Editorial Profile & Bookmarks Page ───────────────────────────────────────
// User account profile and saved bookmarks management.
// ─────────────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { t } = useTranslation();
  const { user, logout, toggleBookmark } = useAuth();
  const [bookmarkedEvents, setBookmarkedEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEventId, setSelectedEventId] = useState(null);

  useEffect(() => {
    let isMounted = true;
    apiClient
      .get('/users/bookmarks')
      .then((res) => {
        if (isMounted) setBookmarkedEvents(res.data || []);
      })
      .catch((err) => {
        console.error('Failed to load user bookmarks:', err);
      })
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

  if (!user) return null;

  return (
    <div className="space-y-8 max-w-5xl mx-auto w-full">
      {/* Account Info Header */}
      <div className="p-6 rounded-3xl border border-slate-200 bg-white shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 text-xl font-bold font-mono shrink-0">
            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>

          <div className="space-y-1">
            <h1 className="text-xl font-black text-slate-950">
              {user.name}
            </h1>
            <div className="flex items-center gap-3 text-xs text-slate-500 font-mono flex-wrap">
              <span className="flex items-center gap-1">
                <Mail size={12} className="text-slate-400" />
                <span>{user.email}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-indigo-700 font-bold">
                <Shield size={12} />
                <span>{user.role ? user.role.toUpperCase() : 'ANALYST'}</span>
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full border border-slate-200 bg-slate-50 text-slate-700 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 text-xs font-bold transition cursor-pointer self-start sm:self-center"
        >
          <LogOut size={13} />
          <span>{t('nav.signOut', { defaultValue: 'Sign Out' })}</span>
        </button>
      </div>

      {/* Bookmarked Dossiers Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h2 className="text-lg font-black text-slate-950 flex items-center gap-2">
            <Bookmark size={18} className="text-indigo-600" />
            <span>{t('profile.savedDossiers', { count: bookmarkedEvents.length, defaultValue: `Saved Dossiers (${bookmarkedEvents.length})` })}</span>
          </h2>
        </div>

        {isLoading ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            {t('profile.loadingBookmarks', { defaultValue: 'Loading saved bookmarks...' })}
          </div>
        ) : bookmarkedEvents.length === 0 ? (
          <div className="p-12 rounded-2xl border border-slate-200 bg-white text-center text-slate-500 space-y-2">
            <Bookmark size={36} className="mx-auto text-slate-300" />
            <h3 className="text-sm font-bold text-slate-800">
              {t('profile.noBookmarks', { defaultValue: 'No saved dossiers yet' })}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {t('profile.noBookmarksDesc', { defaultValue: 'Bookmark geopolitical events from the news feed to review and track them here.' })}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookmarkedEvents.map((event) => (
              <div key={event._id} className="relative group">
                <NewsCard
                  event={event}
                  onSelect={(e) => setSelectedEventId(e._id)}
                />
                <button
                  onClick={(e) => handleRemoveBookmark(event._id, e)}
                  title={t('profile.remove', { defaultValue: 'Remove' })}
                  className="absolute top-6 right-6 p-1.5 rounded-lg bg-white/90 border border-slate-200 text-slate-500 hover:text-rose-600 transition shadow-xs cursor-pointer z-10 opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Event Detail Modal */}
      {selectedEventId && (
        <EventDetailModal
          eventId={selectedEventId}
          onClose={() => setSelectedEventId(null)}
        />
      )}
    </div>
  );
}
