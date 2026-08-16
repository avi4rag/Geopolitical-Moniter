import React, { useEffect, useState } from 'react';
import { User, Bookmark, LogOut, Shield, Mail, Calendar, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import apiClient from '../lib/apiClient.js';
import EventCard from '../components/dashboard/EventCard.jsx';
import EventDetailModal from '../components/events/EventDetailModal.jsx';

// ─── Profile Page ─────────────────────────────────────────────────────────────
// User account profile and saved bookmarks management.
// ─────────────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
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
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Account Info Header */}
      <div
        className="p-6 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        style={{
          backgroundColor: 'var(--color-surface-1)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-xl font-bold font-mono shrink-0">
            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>

          <div className="space-y-1">
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              <span>{user.name}</span>
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {user.role}
              </span>
            </h1>
            <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
              <span className="flex items-center gap-1">
                <Mail size={12} /> {user.email}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Shield size={12} /> {user.authProvider}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold border border-rose-900/60 bg-rose-950/30 text-rose-300 hover:bg-rose-900/50 transition cursor-pointer self-start sm:self-auto"
        >
          <LogOut size={13} />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Saved Bookmarks Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Bookmark size={18} className="text-amber-400" />
            <span>Saved Dossiers ({bookmarkedEvents.length})</span>
          </h2>
        </div>

        {isLoading ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading saved bookmarks...
          </div>
        ) : bookmarkedEvents.length === 0 ? (
          <div className="p-12 rounded-xl border border-slate-800 bg-slate-900/20 text-center text-slate-400 space-y-2">
            <Bookmark size={32} className="mx-auto text-slate-600 mb-1" />
            <h3 className="text-sm font-semibold text-slate-300">No Saved Events Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              When reading story dossiers on the news feed, click the bookmark icon to save them here for offline reference.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bookmarkedEvents.map((event) => (
              <div key={event._id} className="relative group">
                <EventCard
                  event={event}
                  onSelect={(e) => setSelectedEventId(e._id)}
                />
                <button
                  onClick={(e) => handleRemoveBookmark(event._id, e)}
                  title="Remove bookmark"
                  className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-900/90 text-slate-400 hover:text-rose-400 hover:bg-rose-950 border border-slate-800 transition cursor-pointer"
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
