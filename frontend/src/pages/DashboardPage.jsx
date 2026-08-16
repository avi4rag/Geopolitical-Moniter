import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, AlertCircle, FileQuestion, ChevronLeft, ChevronRight } from 'lucide-react';
import apiClient from '../lib/apiClient.js';
import StatCards from '../components/dashboard/StatCards.jsx';
import DomainMatrix from '../components/dashboard/DomainMatrix.jsx';
import EventFilterBar from '../components/dashboard/EventFilterBar.jsx';
import EventCard from '../components/dashboard/EventCard.jsx';
import EventDetailModal from '../components/events/EventDetailModal.jsx';

// ─── Dashboard Page ───────────────────────────────────────────────────────────
// Main real-time intelligence hub.
// ─────────────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  // Data state
  const [stats, setStats] = useState(null);
  const [domainStats, setDomainStats] = useState([]);
  const [events, setEvents] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, totalPages: 1 });

  // Loading & error state
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Filter state
  const [search, setSearch] = useState('');
  const [severity, setSeverity] = useState('ALL');
  const [eventType, setEventType] = useState('ALL');
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [sortBy, setSortBy] = useState('createdAt');
  const [page, setPage] = useState(1);

  // Selected event for modal
  const [selectedEventId, setSelectedEventId] = useState(null);

  // Fetch stats & domain distribution
  const fetchStats = useCallback(async () => {
    try {
      const [statsRes, domainsRes] = await Promise.all([
        apiClient.get('/stats'),
        apiClient.get('/stats/domains'),
      ]);
      setStats(statsRes.data);
      setDomainStats(domainsRes.data || []);
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
    }
  }, []);

  // Fetch events with current filters
  const fetchEvents = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = {
        page,
        limit: 12,
        sortBy,
        sortOrder: 'desc',
      };

      if (search.trim()) params.search = search.trim();
      if (severity !== 'ALL') params.severity = severity;
      if (eventType !== 'ALL') params.eventType = eventType;
      if (selectedDomain) params.sector = selectedDomain;

      const res = await apiClient.get('/events', { params });

      setEvents(res.data || []);
      if (res.pagination) {
        setPagination(res.pagination);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch geopolitical events');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [page, search, severity, eventType, selectedDomain, sortBy]);

  // Initial load
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Reset page when filters change
  const handleSearchChange = (val) => {
    setSearch(val);
    setPage(1);
  };

  const handleSeverityChange = (val) => {
    setSeverity(val);
    setPage(1);
  };

  const handleEventTypeChange = (val) => {
    setEventType(val);
    setPage(1);
  };

  const handleDomainSelect = (dom) => {
    setSelectedDomain(dom);
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearch('');
    setSeverity('ALL');
    setEventType('ALL');
    setSelectedDomain(null);
    setSortBy('createdAt');
    setPage(1);
  };

  const hasActiveFilters =
    search !== '' ||
    severity !== 'ALL' ||
    eventType !== 'ALL' ||
    selectedDomain !== null ||
    sortBy !== 'createdAt';

  return (
    <div className="space-y-6">
      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Global Event & Impact Monitor</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Automated intelligence extraction & deterministic cross-domain impact analysis
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setIsRefreshing(true);
              fetchStats();
              fetchEvents();
            }}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-700 bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={12} className={isRefreshing ? 'animate-spin' : ''} />
            <span>Refresh Feed</span>
          </button>
        </div>
      </div>

      {/* ── KPI Stat Cards ───────────────────────────────────────────────────── */}
      <StatCards
        stats={stats}
        onRefresh={() => {
          fetchStats();
          fetchEvents();
        }}
      />

      {/* ── Domain Impact Radar ──────────────────────────────────────────────── */}
      <DomainMatrix
        domainStats={domainStats}
        selectedDomain={selectedDomain}
        onSelectDomain={handleDomainSelect}
      />

      {/* ── Filter Toolbar ───────────────────────────────────────────────────── */}
      <EventFilterBar
        search={search}
        onSearchChange={handleSearchChange}
        severity={severity}
        onSeverityChange={handleSeverityChange}
        eventType={eventType}
        onEventTypeChange={handleEventTypeChange}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        onResetFilters={handleResetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* ── Events Grid ──────────────────────────────────────────────────────── */}
      {isLoading && events.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 space-y-3">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs">Loading real-time event feed...</p>
        </div>
      ) : error ? (
        <div className="p-8 rounded-xl border border-rose-900/60 bg-rose-950/20 text-center text-rose-400 space-y-2">
          <AlertCircle size={32} className="mx-auto text-rose-400" />
          <h3 className="text-sm font-semibold">Error Loading Events</h3>
          <p className="text-xs text-rose-300/80">{error}</p>
        </div>
      ) : events.length === 0 ? (
        <div className="p-12 rounded-xl border border-slate-800 bg-slate-900/20 text-center text-slate-400 space-y-3">
          <FileQuestion size={36} className="mx-auto text-slate-600" />
          <h3 className="text-sm font-semibold text-slate-300">No Geopolitical Events Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {hasActiveFilters
              ? 'No events match the current filter criteria. Try clearing your filters or changing search keywords.'
              : 'No articles have been analyzed yet. Click "Run Pipeline Sync" above to ingest and analyze current world news.'}
          </p>
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="mt-2 text-xs px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition cursor-pointer"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>
              Showing {events.length} of {pagination.total} events
              {selectedDomain ? ` (Filtered by domain: ${selectedDomain})` : ''}
            </span>
            <span>
              Page {pagination.page} of {pagination.totalPages}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map((event) => (
              <EventCard
                key={event._id}
                event={event}
                onSelect={(e) => setSelectedEventId(e._id)}
              />
            ))}
          </div>

          {/* ── Pagination Controls ─────────────────────────────────────────── */}
          {pagination.totalPages > 1 && (
            <div className="pt-4 flex items-center justify-between border-t border-slate-800">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!pagination.hasPrevPage}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-700 bg-slate-900 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
              >
                <ChevronLeft size={13} />
                <span>Previous</span>
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter((p) => {
                    return (
                      p === 1 ||
                      p === pagination.totalPages ||
                      Math.abs(p - pagination.page) <= 1
                    );
                  })
                  .map((p, idx, arr) => {
                    const isCurrent = p === pagination.page;
                    const prevP = arr[idx - 1];
                    const showEllipsis = prevP && p - prevP > 1;

                    return (
                      <React.Fragment key={p}>
                        {showEllipsis && <span className="text-slate-600 px-1">...</span>}
                        <button
                          onClick={() => setPage(p)}
                          className={`w-7 h-7 rounded-lg text-xs font-mono font-medium transition cursor-pointer ${
                            isCurrent
                              ? 'bg-amber-500 text-slate-950 font-bold'
                              : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                          }`}
                        >
                          {p}
                        </button>
                      </React.Fragment>
                    );
                  })}
              </div>

              <button
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={!pagination.hasNextPage}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-700 bg-slate-900 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
              >
                <span>Next</span>
                <ChevronRight size={13} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Event Detail Modal ──────────────────────────────────────────────── */}
      {selectedEventId && (
        <EventDetailModal
          eventId={selectedEventId}
          onClose={() => setSelectedEventId(null)}
        />
      )}
    </div>
  );
}
