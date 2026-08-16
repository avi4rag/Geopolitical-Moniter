import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, AlertCircle, FileQuestion, ArrowDown } from 'lucide-react';
import apiClient from '../lib/apiClient.js';
import FeaturedStory from '../components/feed/FeaturedStory.jsx';
import FeedFilters from '../components/feed/FeedFilters.jsx';
import NewsCard from '../components/feed/NewsCard.jsx';
import FeedSkeleton from '../components/feed/FeedSkeleton.jsx';
import EventDetailModal from '../components/events/EventDetailModal.jsx';

// ─── Home / News Feed Page ───────────────────────────────────────────────────
// Core consumer news feed.
// ─────────────────────────────────────────────────────────────────────────────

export default function Home() {
  const [events, setEvents] = useState([]);
  const [featuredEvent, setFeaturedEvent] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, totalPages: 1 });

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [domain, setDomain] = useState('ALL');
  const [severity, setSeverity] = useState('ALL');
  const [page, setPage] = useState(1);

  // Modal inspection
  const [selectedEventId, setSelectedEventId] = useState(null);

  // Fetch initial feed data
  const fetchFeed = useCallback(async (targetPage = 1, append = false) => {
    try {
      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      const params = {
        page: targetPage,
        limit: 12,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      };

      if (search.trim()) params.search = search.trim();
      if (severity !== 'ALL') params.severity = severity;
      if (domain !== 'ALL') params.sector = domain;

      const res = await apiClient.get('/events', { params });
      const fetchedEvents = res.data || [];

      if (append) {
        setEvents((prev) => [...prev, ...fetchedEvents]);
      } else {
        setEvents(fetchedEvents);
        // Find top high/critical event for featured story
        const topHero = fetchedEvents.find((e) => e.severity === 'CRITICAL' || e.severity === 'HIGH');
        setFeaturedEvent(topHero || fetchedEvents[0] || null);
      }

      if (res.pagination) {
        setPagination(res.pagination);
      }
    } catch (err) {
      setError(err.message || 'Failed to load geopolitical news feed');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [search, domain, severity]);

  useEffect(() => {
    setPage(1);
    fetchFeed(1, false);
  }, [fetchFeed]);

  const handleLoadMore = () => {
    if (page < pagination.totalPages && !isLoadingMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchFeed(nextPage, true);
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setDomain('ALL');
    setSeverity('ALL');
  };

  const hasActiveFilters = search !== '' || domain !== 'ALL' || severity !== 'ALL';

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Masthead Headline */}
      <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-amber-400">
            Real-Time World Intelligence
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            Global Event & Impact Feed
          </h1>
        </div>
        <div className="text-xs text-slate-400 font-mono">
          Updated continuously via multi-source ingestion
        </div>
      </div>

      {/* Featured Hero Story (only when on page 1 without heavy filters) */}
      {!hasActiveFilters && page === 1 && featuredEvent && !isLoading && (
        <FeaturedStory
          event={featuredEvent}
          onSelect={(e) => setSelectedEventId(e._id)}
        />
      )}

      {/* Sticky Filter Toolbar */}
      <FeedFilters
        search={search}
        onSearchChange={setSearch}
        domain={domain}
        onDomainChange={setDomain}
        severity={severity}
        onSeverityChange={setSeverity}
        onReset={handleResetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* News Feed Stream */}
      {isLoading ? (
        <FeedSkeleton count={6} />
      ) : error ? (
        <div className="p-10 rounded-2xl border border-rose-900/60 bg-rose-950/20 text-center text-rose-400 space-y-3">
          <AlertCircle size={36} className="mx-auto text-rose-400" />
          <h3 className="text-sm font-semibold">Could not load the latest news events</h3>
          <p className="text-xs text-rose-300/80">{error}</p>
          <button
            onClick={() => fetchFeed(1, false)}
            className="px-4 py-2 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition cursor-pointer"
          >
            Try Again
          </button>
        </div>
      ) : events.length === 0 ? (
        <div className="p-12 rounded-2xl border border-slate-800 bg-slate-900/20 text-center text-slate-400 space-y-3">
          <FileQuestion size={36} className="mx-auto text-slate-600" />
          <h3 className="text-sm font-semibold text-slate-300">No Geopolitical Stories Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            No events match your current filter settings. Try searching for broader terms or clearing your topic filters.
          </p>
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="px-3.5 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition cursor-pointer"
            >
              Reset All Filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map((event) => (
              <NewsCard
                key={event._id}
                event={event}
                onSelect={(e) => setSelectedEventId(e._id)}
              />
            ))}
          </div>

          {/* Infinite Scroll / Load More Button */}
          {page < pagination.totalPages && (
            <div className="pt-6 text-center">
              <button
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-slate-700 bg-slate-900 text-slate-200 hover:text-white hover:bg-slate-800 text-xs font-bold transition cursor-pointer disabled:opacity-50 shadow-lg"
              >
                {isLoadingMore ? (
                  <>
                    <RefreshCw size={14} className="animate-spin text-amber-400" />
                    <span>Loading More Stories...</span>
                  </>
                ) : (
                  <>
                    <span>Load More Geopolitical Stories</span>
                    <ArrowDown size={14} />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Event Detail Inspection Modal */}
      {selectedEventId && (
        <EventDetailModal
          eventId={selectedEventId}
          onClose={() => setSelectedEventId(null)}
        />
      )}
    </div>
  );
}
