import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, Globe, AlertCircle, RefreshCw, X } from 'lucide-react';
import apiClient from '../lib/apiClient.js';
import NewsCard from '../components/feed/NewsCard.jsx';
import FeedSkeleton from '../components/feed/FeedSkeleton.jsx';
import EventDetailModal from '../components/events/EventDetailModal.jsx';

// ─── Editorial Search Page ────────────────────────────────────────────────────
// Multi-faceted geopolitical exploration and query engine.
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

  // Sync URL search param if changed
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
      setError(err.message || t('search.searchFailed'));
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
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Masthead Header */}
      <div className="border-b border-slate-800/80 pb-5">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400">
            {t('search.tagline', { defaultValue: 'GEOPOLITICAL INTELLIGENCE ARCHIVE' })}
          </span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight mt-1.5">
          {t('search.title', { defaultValue: 'Intelligence Search & Exploration' })}
        </h1>
      </div>

      {/* Main Search Controls Box */}
      <div className="p-6 rounded-3xl border border-slate-800/90 bg-slate-900/60 backdrop-blur-md shadow-2xl space-y-5">
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
            placeholder={t('search.searchPlaceholder', { defaultValue: 'Search headlines, countries, treaties, sectors...' })}
            className="w-full pl-12 pr-10 py-3.5 text-sm sm:text-base rounded-2xl border border-slate-800 bg-slate-950/90 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition shadow-inner"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer p-1"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Facet Dropdowns / Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5 pt-1">
          {/* Event Type */}
          <div>
            <label className="block text-xs font-mono font-semibold text-slate-400 mb-1.5">
              {t('search.eventType', { defaultValue: 'Event Classification' })}
            </label>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-800 bg-slate-950 text-slate-200 focus:outline-none focus:border-amber-500 transition cursor-pointer"
            >
              {EVENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type === 'ALL' ? t('filters.allEventTypes', { defaultValue: 'All Event Classifications' }) : t(`eventTypes.${type}`, { defaultValue: type.replace(/_/g, ' ') })}
                </option>
              ))}
            </select>
          </div>

          {/* Sector */}
          <div>
            <label className="block text-xs font-mono font-semibold text-slate-400 mb-1.5">
              {t('search.affectedSector', { defaultValue: 'Affected Sector' })}
            </label>
            <select
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-800 bg-slate-950 text-slate-200 focus:outline-none focus:border-amber-500 transition cursor-pointer"
            >
              {SECTORS.map((sec) => (
                <option key={sec} value={sec}>
                  {sec === 'ALL' ? t('filters.allSectors', { defaultValue: 'All Sectors' }) : sec}
                </option>
              ))}
            </select>
          </div>

          {/* Severity */}
          <div>
            <label className="block text-xs font-mono font-semibold text-slate-400 mb-1.5">
              {t('search.severityLevel', { defaultValue: 'Severity Threshold' })}
            </label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-800 bg-slate-950 text-slate-200 focus:outline-none focus:border-amber-500 transition cursor-pointer"
            >
              {SEVERITIES.map((sev) => (
                <option key={sev} value={sev}>
                  {sev === 'ALL' ? t('filters.allSeverities', { defaultValue: 'All Severities' }) : t(`badges.severity.${sev}`, { defaultValue: sev })}
                </option>
              ))}
            </select>
          </div>

          {/* Country */}
          <div>
            <label className="block text-xs font-mono font-semibold text-slate-400 mb-1.5">
              {t('search.country', { defaultValue: 'Country / Region' })}
            </label>
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="e.g. United States, Japan..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-800 bg-slate-950 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
            />
          </div>
        </div>

        {/* Quick Country Pills */}
        <div className="flex items-center gap-1.5 flex-wrap pt-3 border-t border-slate-800/80">
          <span className="text-[11px] font-mono text-slate-400 mr-1 flex items-center gap-1">
            <Globe size={11} className="text-amber-400" /> {t('search.popular', { defaultValue: 'Key Nations' })}:
          </span>
          {POPULAR_COUNTRIES.map((c) => {
            const isActive = country.toLowerCase() === c.toLowerCase();
            return (
              <button
                key={c}
                onClick={() => setCountry(isActive ? '' : c)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition cursor-pointer ${
                  isActive
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                    : 'bg-slate-950 text-slate-300 border border-slate-800 hover:text-white hover:bg-slate-800'
                }`}
              >
                {c}
              </button>
            );
          })}

          {hasActiveFilters && (
            <button
              onClick={handleReset}
              className="px-3 py-1 text-xs rounded-full border border-rose-800/60 bg-rose-950/40 text-rose-300 hover:bg-rose-900/60 transition cursor-pointer ml-auto flex items-center gap-1"
            >
              <X size={11} /> {t('filters.reset', { defaultValue: 'Reset Filters' })}
            </button>
          )}
        </div>
      </div>

      {/* Results Count Header */}
      <div className="flex items-center justify-between text-xs text-slate-400 font-mono border-b border-slate-800 pb-2">
        <span className="text-white font-bold">
          {t('search.foundReports', { count: totalCount, defaultValue: `Found ${totalCount} intelligence dossiers` })}
        </span>
        {isLoading && (
          <span className="flex items-center gap-1 text-amber-400">
            <RefreshCw size={12} className="animate-spin" /> {t('search.searching', { defaultValue: 'Searching archive...' })}
          </span>
        )}
      </div>

      {/* Results Grid */}
      {isLoading && results.length === 0 ? (
        <FeedSkeleton count={6} />
      ) : error ? (
        <div className="p-10 rounded-3xl border border-rose-900/60 bg-rose-950/20 text-center text-rose-400 space-y-3">
          <AlertCircle size={36} className="mx-auto" />
          <p className="text-xs">{error}</p>
        </div>
      ) : results.length === 0 ? (
        <div className="p-14 rounded-3xl border border-slate-800 bg-slate-900/20 text-center text-slate-400 space-y-3">
          <Globe size={40} className="mx-auto text-slate-600 mb-1" />
          <h3 className="text-base font-bold text-slate-200">{t('search.noMatchesTitle', { defaultValue: 'No Matching Dossiers' })}</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {t('search.noMatchesDesc', { defaultValue: 'Try adjusting your search terms or clearing specific facet filters.' })}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
