import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, AlertCircle, ArrowDown } from 'lucide-react';
import apiClient from '../lib/apiClient.js';
import FeaturedStory from '../components/feed/FeaturedStory.jsx';
import SubFeaturedRail from '../components/feed/SubFeaturedRail.jsx';
import TrendingSidebar from '../components/feed/TrendingSidebar.jsx';
import FeedFilters from '../components/feed/FeedFilters.jsx';
import NewsCard from '../components/feed/NewsCard.jsx';
import FeedSkeleton from '../components/feed/FeedSkeleton.jsx';

// ─── Situation Room Intelligence Feed — Home Page ─────────────────────────────
// Dark feed layout:
// 1. Hero featured event + 3-column sub-rail (8-col on desktop)
// 2. Trending signals sidebar (4-col on desktop)
// 3. Live intelligence feed with filters + 3-col card grid + load-more
//
// NAVIGATION: clicking any event card navigates to /event/:id (full dossier)
// — no modal overlay. EventDetailModal is removed from this page.
// ─────────────────────────────────────────────────────────────────────────────

export default function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();

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

  const newsFeedRef = useRef(null);

  // Navigate to the full-screen event dossier on any card click
  const handleEventSelect = useCallback((event) => {
    navigate(`/event/${event._id}`);
  }, [navigate]);

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

        // 1. Pick Top Hero Story (highest severity)
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
        <div
          className="p-10 rounded-lg border text-center space-y-4"
          style={{ backgroundColor: 'var(--color-surface-1)', borderColor: 'var(--color-critical-border, rgba(225,29,72,0.3))' }}
        >
          <AlertCircle size={32} className="mx-auto" style={{ color: 'var(--color-critical)' }} />
          <h3 className="text-base font-bold font-headline" style={{ color: 'var(--color-text-primary)' }}>
            {t('feed.errorTitle', { defaultValue: 'Could not load latest news' })}
          </h3>
          <p className="text-xs font-mono-code" style={{ color: 'var(--color-text-muted)' }}>{error}</p>
          <button
            onClick={() => fetchFeed(1, false)}
            className="px-4 py-2 rounded text-xs font-mono-code font-bold cursor-pointer transition-colors"
            style={{
              backgroundColor: 'var(--color-surface-4)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-muted)',
            }}
          >
            {t('feed.tryAgain', { defaultValue: 'Try Again' })}
          </button>
        </div>
      ) : (
        <>
          {/* ── HERO + SUB-RAIL + TRENDING SIDEBAR ─────────────────────────────── */}
          {!hasActiveFilters && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
              {/* Left Column: Hero + Sub-rail (8 cols on desktop) */}
              <div className="lg:col-span-8 space-y-6">
                {featuredEvent && (
                  <FeaturedStory
                    event={featuredEvent}
                    onSelect={handleEventSelect}
                  />
                )}
                {subFeaturedEvents.length > 0 && (
                  <SubFeaturedRail
                    events={subFeaturedEvents}
                    onSelect={handleEventSelect}
                  />
                )}
              </div>

              {/* Right Column: Trending Sidebar (4 cols on desktop) */}
              <div
                className="lg:col-span-4 border-t lg:border-t-0 lg:border-l pt-6 lg:pt-0 lg:pl-8"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <TrendingSidebar
                  trendingEvents={recommendedEvents}
                  onSelectEvent={handleEventSelect}
                  onViewAll={handleScrollToFeed}
                />
              </div>
            </div>
          )}

          {/* ── LIVE INTELLIGENCE FEED ─────────────────────────────────────────── */}
          <div
            ref={newsFeedRef}
            className="pt-8 border-t space-y-6"
            style={{ borderColor: 'var(--color-border-subtle)' }}
          >
            {/* Feed header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <h2 className="font-headline text-2xl sm:text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  {hasActiveFilters
                    ? t('search.resultsFound', { count: events.length, defaultValue: `Filtered Results (${events.length})` })
                    : t('feed.allStories', { defaultValue: 'Live Intelligence Feed' })}
                </h2>
                <p className="text-xs font-mono-code mt-1" style={{ color: 'var(--color-text-dim)' }}>
                  {t('feed.updatedContinuously', { defaultValue: 'Updated continuously via multi-source ingestion' })}
                </p>
              </div>
              <span className="text-xs font-mono-code" style={{ color: 'var(--color-text-dim)' }}>
                {events.length} {t('feed.stories', { defaultValue: 'SIGNALS' })}
              </span>
            </div>

            {/* Filters toolbar */}
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

            {/* Events grid */}
            {events.length === 0 ? (
              <div
                className="p-14 rounded-lg border text-center space-y-3"
                style={{ backgroundColor: 'var(--color-surface-1)', borderColor: 'var(--color-border)' }}
              >
                <h3 className="text-base font-bold font-headline" style={{ color: 'var(--color-text-primary)' }}>
                  {t('feed.noStoriesTitle', { defaultValue: 'No Signals Found' })}
                </h3>
                <p className="text-xs font-mono-code max-w-sm mx-auto" style={{ color: 'var(--color-text-muted)' }}>
                  {t('feed.noStoriesDesc', { defaultValue: 'No events match your current filters.' })}
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={handleResetFilters}
                    className="px-4 py-2 rounded text-xs font-mono-code font-bold cursor-pointer transition-colors"
                    style={{
                      backgroundColor: 'var(--color-surface-4)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text-muted)',
                    }}
                  >
                    {t('feed.resetAllFilters', { defaultValue: 'Reset Filters' })}
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {events.map((event) => (
                  <NewsCard
                    key={event._id}
                    event={event}
                    onSelect={handleEventSelect}
                  />
                ))}
              </div>
            )}

            {/* Load more */}
            {page < pagination.totalPages && (
              <div className="pt-6 text-center">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="inline-flex items-center gap-2 px-7 py-3 rounded font-mono-code text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                  style={{
                    backgroundColor: 'var(--color-surface-3)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  {isLoadingMore ? (
                    <>
                      <RefreshCw size={13} className="animate-spin" style={{ color: 'var(--color-accent)' }} />
                      <span>{t('feed.loadingMore', { defaultValue: 'Loading...' })}</span>
                    </>
                  ) : (
                    <>
                      <span>{t('feed.loadMore', { defaultValue: 'Load More Signals' })}</span>
                      <ArrowDown size={13} />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
