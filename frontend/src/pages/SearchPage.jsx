import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, Globe, AlertCircle, RefreshCw, X } from 'lucide-react';
import apiClient from '../lib/apiClient.js';
import NewsCard from '../components/feed/NewsCard.jsx';
import FeedSkeleton from '../components/feed/FeedSkeleton.jsx';
import EventDetailModal from '../components/events/EventDetailModal.jsx';

// ─── Full-Width Search & Exploration Page ─────────────────────────────────────
// Multi-faceted search across global events, countries, and sectors.
// ─────────────────────────────────────────────────────────────────────────────

const EVENT_TYPES = [
  'ALL',
  'SANCTION',
  'TRADE_RESTRICTION',
  'MILITARY_CONFLICT',
  'DIPLOMATIC_MEETING',
  'TREATY_AGREEMENT',
  'ELECTION',
  'POLICY_CHANGE',
  'RESOURCE_DISCOVERY',
  'CYBER_ATTACK',
  'TERRORISM',
  'CIVIL_UNREST',
];

const SECTORS = [
  'ALL',
  'Energy',
  'Trade',
  'Technology',
  'Defense',
  'Finance',
  'Transportation',
  'Food & Agriculture',
];

const SEVERITIES = ['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

const POPULAR_COUNTRIES = [
  'United States',
  'China',
  'Russia',
  'Ukraine',
  'Taiwan',
  'Iran',
  'Israel',
  'India',
  'Japan',
  'United Kingdom',
  'Germany',
];

export default function SearchPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [eventType, setEventType] = useState('ALL');
  const [sector, setSector] = useState('ALL');
  const [severity, setSeverity] = useState('ALL');
  const [country, setCountry] = useState('');

  const [results, setResults] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedEventId, setSelectedEventId] = useState(null);

  // Sync URL query param
  useEffect(() => {
    if (searchParams.get('q')) {
      setQuery(searchParams.get('q'));
    }
  }, [searchParams]);

  const performSearch = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = {
        limit: 24,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      };

      if (query.trim()) params.search = query.trim();
      if (eventType !== 'ALL') params.eventType = eventType;
      if (sector !== 'ALL') params.sector = sector;
      if (severity !== 'ALL') params.severity = severity;
      if (country.trim()) params.country = country.trim();

      const res = await apiClient.get('/events', { params });
      setResults(res.data || []);
      setTotalCount(res.pagination?.total || (res.data || []).length);
    } catch (err) {
      setError(err.message || t('search.searchFailed', { defaultValue: 'Search failed' }));
    } finally {
      setIsLoading(false);
    }
  }, [query, eventType, sector, severity, country, t]);

  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch();
    }, 250);

    return () => clearTimeout(timer);
  }, [performSearch]);

  const handleReset = () => {
    setQuery('');
    setEventType('ALL');
    setSector('ALL');
    setSeverity('ALL');
    setCountry('');
  };

  const hasActiveFilters =
    query !== '' || eventType !== 'ALL' || sector !== 'ALL' || severity !== 'ALL' || country !== '';

  return (
    <div className="space-y-8 w-full">
      {/* Header Banner */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2">
          <div className="h-3 w-1 bg-indigo-600 rounded-full" />
          <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-indigo-700">
            {t('search.tagline', { defaultValue: 'GEOPOLITICAL INTELLIGENCE ARCHIVE' })}
          </span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight mt-1.5">
          {t('search.title', { defaultValue: 'Intelligence Search & Exploration' })}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl">
          {t('search.subtitle', { defaultValue: 'Multi-facet search across global events, countries, and domains.' })}
        </p>
      </div>

      {/* Main Search Controls Box */}
      <div className="p-6 rounded-3xl border border-slate-200 bg-white shadow-xs space-y-5">
        {/* Large Search Input */}
        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('search.searchPlaceholder', { defaultValue: 'Search events, countries, treaties, sectors...' })}
            className="w-full pl-12 pr-10 py-3.5 text-sm sm:text-base rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-400 transition"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer p-1"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Facet Dropdowns / Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-1">
          {/* Event Classification */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              {t('search.eventType', { defaultValue: 'Event Classification' })}
            </label>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-indigo-400 transition cursor-pointer"
            >
              {EVENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type === 'ALL' ? t('filters.allEventTypes', { defaultValue: 'All Event Classifications' }) : t(`eventTypes.${type}`, { defaultValue: type.replace(/_/g, ' ') })}
                </option>
              ))}
            </select>
          </div>

          {/* Affected Sector */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              {t('search.affectedSector', { defaultValue: 'Affected Sector' })}
            </label>
            <select
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-indigo-400 transition cursor-pointer"
            >
              {SECTORS.map((sec) => (
                <option key={sec} value={sec}>
                  {sec === 'ALL' ? t('filters.allSectors', { defaultValue: 'All Sectors' }) : sec}
                </option>
              ))}
            </select>
          </div>

          {/* Severity Threshold */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              {t('search.severityLevel', { defaultValue: 'Severity Threshold' })}
            </label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-indigo-400 transition cursor-pointer"
            >
              {SEVERITIES.map((sev) => (
                <option key={sev} value={sev}>
                  {sev === 'ALL' ? t('filters.allSeverities', { defaultValue: 'All Severities' }) : t(`badges.severity.${sev}`, { defaultValue: sev })}
                </option>
              ))}
            </select>
          </div>

          {/* Country / Region */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              {t('search.country', { defaultValue: 'Country / Region' })}
            </label>
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="e.g. United States, Japan..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-400 transition"
            />
          </div>
        </div>

        {/* Quick Country Pills */}
        <div className="flex items-center gap-2 flex-wrap pt-3 border-t border-slate-100">
          <span className="text-xs font-mono font-medium text-slate-500 mr-1 flex items-center gap-1">
            <Globe size={12} className="text-indigo-600" /> {t('search.popular', { defaultValue: 'Key Nations' })}:
          </span>
          {POPULAR_COUNTRIES.map((c) => {
            const isActive = country.toLowerCase() === c.toLowerCase();
            return (
              <button
                key={c}
                onClick={() => setCountry(isActive ? '' : c)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white font-bold'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {c}
              </button>
            );
          })}

          {hasActiveFilters && (
            <button
              onClick={handleReset}
              className="px-3 py-1 text-xs rounded-full border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 transition cursor-pointer ml-auto flex items-center gap-1"
            >
              <X size={11} /> {t('filters.reset', { defaultValue: 'Reset Filters' })}
            </button>
          )}
        </div>
      </div>

      {/* Results Header Count */}
      <div className="flex items-center justify-between text-xs text-slate-500 font-mono border-b border-slate-200 pb-2">
        <span className="text-slate-900 font-bold">
          {t('search.foundReports', { count: totalCount, defaultValue: `Found ${totalCount} intelligence dossiers` })}
        </span>
        {isLoading && (
          <span className="flex items-center gap-1 text-indigo-600 font-semibold">
            <RefreshCw size={12} className="animate-spin" /> {t('search.searching', { defaultValue: 'Searching archive...' })}
          </span>
        )}
      </div>

      {/* Results Grid */}
      {isLoading && results.length === 0 ? (
        <FeedSkeleton count={6} />
      ) : error ? (
        <div className="p-10 rounded-2xl border border-rose-200 bg-rose-50 text-center text-rose-700 space-y-3">
          <AlertCircle size={36} className="mx-auto" />
          <p className="text-xs">{error}</p>
        </div>
      ) : results.length === 0 ? (
        <div className="p-14 rounded-2xl border border-slate-200 bg-white text-center text-slate-500 space-y-3">
          <Globe size={40} className="mx-auto text-slate-400 mb-1" />
          <h3 className="text-base font-bold text-slate-800">{t('search.noMatchesTitle', { defaultValue: 'No Matching Dossiers' })}</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {t('search.noMatchesDesc', { defaultValue: 'Try adjusting your search terms or clearing specific facet filters.' })}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((event) => (
            <NewsCard
              key={event._id}
              event={event}
              onSelect={(e) => setSelectedEventId(e._id)}
            />
          ))}
        </div>
      )}

      {/* Detail Inspection Modal */}
      {selectedEventId && (
        <EventDetailModal
          eventId={selectedEventId}
          onClose={() => setSelectedEventId(null)}
        />
      )}
    </div>
  );
}
