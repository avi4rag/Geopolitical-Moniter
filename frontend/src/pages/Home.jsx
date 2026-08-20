import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshCw, AlertCircle, ArrowDown } from 'lucide-react';
import apiClient from '../lib/apiClient.js';
import FeaturedStory from '../components/feed/FeaturedStory.jsx';
import SubFeaturedRail from '../components/feed/SubFeaturedRail.jsx';
import TrendingSidebar from '../components/feed/TrendingSidebar.jsx';
import NewsCard from '../components/feed/NewsCard.jsx';
import FeedSkeleton from '../components/feed/FeedSkeleton.jsx';
import EventDetailModal from '../components/events/EventDetailModal.jsx';

// ─── Reference Design Home Page ───────────────────────────────────────────────
// Main editorial homepage layout replicating the reference design:
// - Left: Featured Lead Hero + Ethereal Glowing Sphere + 3-Column Sub-Stories
// - Right: Recommended Sidebar with Hero Card + Stack of Compact Thumbnail Stories
// - Bottom / Expanded: Full Ingested News Grid & Load More
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

      const res = await apiClient.get('/events', { params });
      const fetchedEvents = res.data || [];

      if (append) {
        setEvents((prev) => [...prev, ...fetchedEvents]);
      } else {
        setEvents(fetchedEvents);

        // 1. Pick Top Hero
        const hero = fetchedEvents.find((e) => e.severity === 'CRITICAL' || e.severity === 'HIGH') || fetchedEvents[0] || null;
        setFeaturedEvent(hero);

        // 2. Pick next 3 stories for sub-features row
        const others = fetchedEvents.filter((e) => hero && e._id !== hero._id);
        setSubFeaturedEvents(others.slice(0, 3));

        // 3. Pick recommended stories for right column
        setRecommendedEvents(others.slice(3, 8).length > 0 ? others.slice(3, 8) : fetchedEvents.slice(0, 5));
      }

      if (res.pagination) {
        setPagination(res.pagination);
      }
    } catch (err) {
      setError(err.message || t('feed.errorTitle'));
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [t]);

  useEffect(() => {
    fetchFeed(1, false);
  }, [fetchFeed]);

  const handleLoadMore = () => {
    if (page < pagination.totalPages && !isLoadingMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchFeed(nextPage, true);
    }
  };

  const handleScrollToFeed = () => {
    if (newsFeedRef.current) {
      newsFeedRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-12">
      {isLoading ? (
        <FeedSkeleton count={6} />
      ) : error ? (
        <div className="p-10 rounded-2xl border border-rose-200 bg-rose-50 text-center text-rose-700 space-y-3">
          <AlertCircle size={36} className="mx-auto text-rose-600" />
          <h3 className="text-base font-bold">{t('feed.errorTitle')}</h3>
          <p className="text-xs text-rose-600">{error}</p>
          <button
            onClick={() => fetchFeed(1, false)}
            className="px-4 py-2 rounded-full bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition cursor-pointer"
          >
            {t('feed.tryAgain')}
          </button>
        </div>
      ) : (
        <>
          {/* Main Top Two-Column Grid (Direct Reference Replica) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left Main Editorial Column (~68% on Desktop) */}
            <div className="lg:col-span-8 space-y-8">
              {/* Featured Lead Hero with Holographic Sphere */}
              {featuredEvent && (
                <FeaturedStory
                  event={featuredEvent}
                  onSelect={(e) => setSelectedEventId(e._id)}
                />
              )}

              {/* 3-Column Sub-Stories Row Directly Beneath Hero */}
              {subFeaturedEvents.length > 0 && (
                <SubFeaturedRail
                  events={subFeaturedEvents}
                  onSelect={(e) => setSelectedEventId(e._id)}
                />
              )}
            </div>

            {/* Right Recommended Sidebar (~32% on Desktop) */}
            <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-slate-100 lg:pl-8 pt-8 lg:pt-0">
              <TrendingSidebar
                trendingEvents={recommendedEvents}
                onSelectEvent={(e) => setSelectedEventId(e._id)}
                onViewAll={handleScrollToFeed}
              />
            </div>
          </div>

          {/* Full Ingested News Grid Section */}
          <div ref={newsFeedRef} className="pt-8 border-t border-slate-100 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-950 tracking-tight">
                {t('feed.allStories', { defaultValue: 'All Ingested Geopolitical Stories' })}
              </h2>
              <span className="text-xs font-mono text-slate-400">
                {events.length} {t('feed.stories', { defaultValue: 'stories' })}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <NewsCard
                  key={event._id}
                  event={event}
                  onSelect={(e) => setSelectedEventId(e._id)}
                />
              ))}
            </div>

            {/* Load More Button */}
            {page < pagination.totalPages && (
              <div className="pt-4 text-center">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer shadow-md hover:scale-105"
                >
                  {isLoadingMore ? (
                    <>
                      <RefreshCw size={14} className="animate-spin text-indigo-400" />
                      <span>{t('feed.loadingMore')}</span>
                    </>
                  ) : (
                    <>
                      <span>{t('feed.loadMore')}</span>
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
