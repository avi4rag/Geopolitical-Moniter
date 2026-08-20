import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshCw, AlertCircle, ArrowDown } from 'lucide-react';
import apiClient from '../lib/apiClient.js';
import FeaturedStory from '../components/feed/FeaturedStory.jsx';
import SubFeaturedRail from '../components/feed/SubFeaturedRail.jsx';
import TrendingSidebar from '../components/feed/TrendingSidebar.jsx';
import FeedFilters from '../components/feed/FeedFilters.jsx';
import NewsCard from '../components/feed/NewsCard.jsx';
import FeedSkeleton from '../components/feed/FeedSkeleton.jsx';
import EventDetailModal from '../components/events/EventDetailModal.jsx';

// ─── Full-Width Editorial Home Page ───────────────────────────────────────────
// High-impact news layout matching premier publications:
// 1. Lead Featured Story + 3-Column Sub-News Index (Left)
// 2. Recommended Stories Column (Right)
// 3. Latest Geopolitical Stories Section with Topic Filters & 3-Column Grid
// ─────────────────────────────────────────────────────────────────────────────

export default function Home() {
  const { t } = useTranslation();
  const [events, setEvents] = useState([]);
  const [featuredEvent, setFeaturedEvent] = useState(null);
  const [subFeaturedEvents, setSubFeaturedEvents] = useState([]);
  const [recommendedEvents, setRecommendedEvents] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, totalPages: 1 });

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [domain, setDomain] = useState('ALL');
  const [severity, setSeverity] = useState('ALL');
  const [page, setPage] = useState(1);
  const [selectedEventId, setSelectedEventId] = useState(null);

  const newsFeedRef = useRef(null);

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

        // 1. Pick Top Hero Story
        const hero = fetchedEvents.find((e) => e.severity === 'CRITICAL' || e.severity === 'HIGH') || fetchedEvents[0] || null;
        setFeaturedEvent(hero);

        // 2. Pick next 3 stories for sub-features row
        const others = fetchedEvents.filter((e) => hero && e._id !== hero._id);
        setSubFeaturedEvents(others.slice(0, 3));

        // 3. Pick recommended stories for right sidebar
        setRecommendedEvents(others.slice(3, 8).length > 0 ? others.slice(3, 8) : fetchedEvents.slice(0, 5));
      }

      if (res.pagination) {
        setPagination(res.pagination);
      }
    } catch (err) {
      setError(err.message || t('feed.errorTitle', { defaultValue: 'Could not load latest news' }));
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [search, domain, severity, t]);

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

  const handleScrollToFeed = () => {
    if (newsFeedRef.current) {
      newsFeedRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const hasActiveFilters = search !== '' || domain !== 'ALL' || severity !== 'ALL';

  return (
    <div className="space-y-12 w-full">
      {isLoading ? (
        <FeedSkeleton count={6} />
      ) : error ? (
        <div className="p-10 rounded-2xl border border-rose-200 bg-rose-50 text-center text-rose-700 space-y-3">
          <AlertCircle size={36} className="mx-auto text-rose-600" />
          <h3 className="text-base font-bold">{t('feed.errorTitle', { defaultValue: 'Could not load news' })}</h3>
          <p className="text-xs text-rose-600">{error}</p>
          <button
            onClick={() => fetchFeed(1, false)}
            className="px-4 py-2 rounded-full bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition cursor-pointer"
          >
            {t('feed.tryAgain', { defaultValue: 'Try Again' })}
          </button>
        </div>
      ) : (
        <>
          {/* Top Newspaper Lead Section (Hero + Sub-rail + Recommended Sidebar) */}
          {!hasActiveFilters && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start pb-4">
              {/* Left Column: Hero + 3-Column Sub-Stories (8 cols on desktop) */}
              <div className="lg:col-span-8 space-y-8">
                {featuredEvent && (
                  <FeaturedStory
                    event={featuredEvent}
                    onSelect={(e) => setSelectedEventId(e._id)}
                  />
                )}

                {subFeaturedEvents.length > 0 && (
                  <SubFeaturedRail
                    events={subFeaturedEvents}
                    onSelect={(e) => setSelectedEventId(e._id)}
                  />
                )}
              </div>

              {/* Right Column: Recommended Sidebar (4 cols on desktop) */}
              <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-slate-200 lg:pl-8 pt-8 lg:pt-0">
                <TrendingSidebar
                  trendingEvents={recommendedEvents}
                  onSelectEvent={(e) => setSelectedEventId(e._id)}
                  onViewAll={handleScrollToFeed}
                />
              </div>
            </div>
          )}

          {/* Main News Stream Section */}
          <div ref={newsFeedRef} className="pt-8 border-t border-slate-200 space-y-6">
            {/* Header Title + Story Count */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                  {hasActiveFilters
                    ? t('search.resultsFound', { count: events.length, defaultValue: `Filtered Stories (${events.length})` })
                    : t('feed.allStories', { defaultValue: 'Latest Geopolitical Stories' })}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {t('feed.updatedContinuously', { defaultValue: 'Updated continuously via multi-source ingestion' })}
                </p>
              </div>

              <span className="text-xs font-mono text-slate-500">
                {events.length} {t('feed.stories', { defaultValue: 'stories' })}
              </span>
            </div>

            {/* Sticky Category & Severity Filter Toolbar */}
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

            {/* 3-Column Responsive News Cards Grid */}
            {events.length === 0 ? (
              <div className="p-14 rounded-2xl border border-slate-200 bg-white text-center text-slate-500 space-y-3">
                <h3 className="text-base font-bold text-slate-800">
                  {t('feed.noStoriesTitle', { defaultValue: 'No Stories Found' })}
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {t('feed.noStoriesDesc', { defaultValue: 'No events match your current filters.' })}
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={handleResetFilters}
                    className="px-4 py-2 rounded-full bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition cursor-pointer"
                  >
                    {t('feed.resetAllFilters', { defaultValue: 'Reset Filters' })}
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => (
                  <NewsCard
                    key={event._id}
                    event={event}
                    onSelect={(e) => setSelectedEventId(e._id)}
                  />
                ))}
              </div>
            )}

            {/* Load More Button */}
            {page < pagination.totalPages && (
              <div className="pt-6 text-center">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer shadow-xs hover:gap-2.5"
                >
                  {isLoadingMore ? (
                    <>
                      <RefreshCw size={14} className="animate-spin text-indigo-400" />
                      <span>{t('feed.loadingMore', { defaultValue: 'Loading More...' })}</span>
                    </>
                  ) : (
                    <>
                      <span>{t('feed.loadMore', { defaultValue: 'Load More Stories' })}</span>
                      <ArrowDown size={14} />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </>
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
