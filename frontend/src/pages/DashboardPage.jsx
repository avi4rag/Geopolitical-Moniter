import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshCw, AlertCircle, FileQuestion } from 'lucide-react';
import apiClient from '../lib/apiClient.js';
import StatCards from '../components/dashboard/StatCards.jsx';
import DomainMatrix from '../components/dashboard/DomainMatrix.jsx';
import CountryRiskMatrix from '../components/dashboard/CountryRiskMatrix.jsx';
import EventFilterBar from '../components/dashboard/EventFilterBar.jsx';
import EventCard from '../components/dashboard/EventCard.jsx';
import EventDetailModal from '../components/events/EventDetailModal.jsx';

// ─── Full-Width Analytics & Risk Monitor Page ─────────────────────────────────
// Real-time KPI distribution, domain radar, country risk matrix, and events.
// ─────────────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [domainStats, setDomainStats] = useState([]);
  const [events, setEvents] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, totalPages: 1 });

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [severity, setSeverity] = useState('ALL');
  const [eventType, setEventType] = useState('ALL');
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [sortBy, setSortBy] = useState('createdAt');
  const [page, setPage] = useState(1);

  const [selectedEventId, setSelectedEventId] = useState(null);

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
      setError(err.message || t('errors.generic'));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [page, search, severity, eventType, selectedDomain, sortBy, t]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

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
    <div className="space-y-8 w-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-1 bg-indigo-600 rounded-full" />
            <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-indigo-700">
              MACROECONOMIC INTELLIGENCE MONITOR
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight mt-1.5">
            {t('analytics.title', { defaultValue: 'Global Event & Impact Analytics' })}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl">
            {t('analytics.subtitle', { defaultValue: 'Automated intelligence extraction & deterministic cross-domain impact analysis.' })}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => {
              setIsRefreshing(true);
              fetchStats();
              fetchEvents();
            }}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 transition cursor-pointer disabled:opacity-50 shadow-2xs"
          >
            <RefreshCw size={13} className={isRefreshing ? 'animate-spin text-indigo-600' : ''} />
            <span>{t('analytics.refresh', { defaultValue: 'Refresh Feed' })}</span>
          </button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <StatCards
        stats={stats}
        onRefresh={() => {
          fetchStats();
          fetchEvents();
        }}
      />

      {/* Domain Impact Radar */}
      <DomainMatrix
        domainStats={domainStats}
        selectedDomain={selectedDomain}
        onSelectDomain={handleDomainSelect}
      />

      {/* Country Risk Matrix */}
      <CountryRiskMatrix />

      {/* Filter Toolbar */}
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

      {/* Events Grid */}
      {isLoading && events.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 space-y-3">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500">{t('feed.loading')}</p>
        </div>
      ) : error ? (
        <div className="p-8 rounded-2xl border border-rose-200 bg-rose-50 text-center text-rose-700 space-y-2">
          <AlertCircle size={32} className="mx-auto text-rose-600" />
          <h3 className="text-sm font-bold">{t('feed.errorTitle')}</h3>
          <p className="text-xs text-rose-600">{error}</p>
        </div>
      ) : events.length === 0 ? (
        <div className="p-14 rounded-2xl border border-slate-200 bg-white text-center text-slate-500 space-y-3">
          <FileQuestion size={40} className="mx-auto text-slate-400" />
          <h3 className="text-base font-bold text-slate-800">{t('analytics.noEventsTitle')}</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {hasActiveFilters
              ? t('analytics.noEventsDescFiltered')
              : t('analytics.noEventsDescEmpty')}
          </p>
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="mt-2 text-xs px-4 py-2 rounded-full bg-slate-900 text-white font-bold hover:bg-slate-800 transition cursor-pointer"
            >
              {t('filters.clearFilters')}
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 font-mono pb-2 border-b border-slate-200">
            <span>
              {selectedDomain
                ? t('analytics.showingOfFiltered', { count: events.length, total: pagination.total, domain: t(`domains.${selectedDomain}`, { defaultValue: selectedDomain }) })
                : t('analytics.showingOf', { count: events.length, total: pagination.total })}
            </span>
            <span>
              {t('analytics.pageOf', { page: pagination.page, totalPages: pagination.totalPages })}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {events.map((event) => (
              <EventCard
                key={event._id}
                event={event}
                onSelect={(e) => setSelectedEventId(e._id)}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="pt-6 flex items-center justify-between border-t border-slate-200">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-full border border-slate-200 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 disabled:opacity-40 transition cursor-pointer"
              >
                {t('analytics.previous', { defaultValue: 'Previous' })}
              </button>

              <span className="text-xs font-mono text-slate-500">
                {page} / {pagination.totalPages}
              </span>

              <button
                onClick={() => setPage((p) => Math.min(p + 1, pagination.totalPages))}
                disabled={page === pagination.totalPages}
                className="px-4 py-2 rounded-full border border-slate-200 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 disabled:opacity-40 transition cursor-pointer"
              >
                {t('analytics.next', { defaultValue: 'Next' })}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {selectedEventId && (
        <EventDetailModal
          eventId={selectedEventId}
          onClose={() => setSelectedEventId(null)}
        />
      )}
    </div>
  );
}
