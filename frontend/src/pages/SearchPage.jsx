import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Filter, Globe, Layers, AlertCircle, RefreshCw, X, SlidersHorizontal } from 'lucide-react';
import apiClient from '../lib/apiClient.js';
import NewsCard from '../components/feed/NewsCard.jsx';
import FeedSkeleton from '../components/feed/FeedSkeleton.jsx';
import EventDetailModal from '../components/events/EventDetailModal.jsx';

// ─── Search Page ──────────────────────────────────────────────────────────────
// Dedicated intelligence search & multi-facet exploration engine.
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
  const [query, setQuery] = useState('');
  const [eventType, setEventType] = useState('ALL');
  const [sector, setSector] = useState('ALL');
  const [severity, setSeverity] = useState('ALL');
  const [country, setCountry] = useState('');

  const [results, setResults] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedEventId, setSelectedEventId] = useState(null);

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
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-amber-400">
          {t('search.tagline')}
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
          {t('search.title')}
        </h1>
      </div>

      {/* Main Search Controls Box */}
      <div
        className="p-6 rounded-2xl border space-y-4 shadow-xl"
        style={{
          backgroundColor: 'var(--color-surface-1)',
          borderColor: 'var(--color-border)',
        }}
      >
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
            placeholder={t('search.searchPlaceholder')}
            className="w-full pl-12 pr-10 py-3 text-sm rounded-xl border bg-slate-950 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition shadow-inner"
            style={{ borderColor: 'var(--color-border)' }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Facet Dropdowns / Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          {/* Event Type */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              {t('search.eventType')}
            </label>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border bg-slate-950 text-slate-200 focus:outline-none focus:border-amber-500 transition cursor-pointer"
              style={{ borderColor: 'var(--color-border)' }}
            >
              {EVENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type === 'ALL' ? t('filters.allEventTypes') : t(`eventTypes.${type}`, { defaultValue: type.replace(/_/g, ' ') })}
                </option>
              ))}
            </select>
          </div>

          {/* Sector */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              {t('search.affectedSector')}
            </label>
            <select
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border bg-slate-950 text-slate-200 focus:outline-none focus:border-amber-500 transition cursor-pointer"
              style={{ borderColor: 'var(--color-border)' }}
            >
              {SECTORS.map((sec) => (
                <option key={sec} value={sec}>
                  {sec === 'ALL' ? t('filters.allSectors') : sec}
                </option>
              ))}
            </select>
          </div>

          {/* Severity */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              {t('search.severityLevel')}
            </label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border bg-slate-950 text-slate-200 focus:outline-none focus:border-amber-500 transition cursor-pointer"
              style={{ borderColor: 'var(--color-border)' }}
            >
              {SEVERITIES.map((sev) => (
                <option key={sev} value={sev}>
                  {sev === 'ALL' ? t('filters.allSeverities') : t(`badges.severity.${sev}`, { defaultValue: sev })}
                </option>
              ))}
            </select>
          </div>

          {/* Country */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              {t('search.country')}
            </label>
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="e.g. Russia, China, US..."
              className="w-full px-3 py-2 text-xs rounded-lg border bg-slate-950 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
              style={{ borderColor: 'var(--color-border)' }}
            />
          </div>
        </div>

        {/* Quick Country Pills */}
        <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-slate-800/80">
          <span className="text-[11px] font-mono text-slate-500 mr-1 flex items-center gap-1">
            <Globe size={11} /> {t('search.popular')}:
          </span>
          {POPULAR_COUNTRIES.map((c) => {
            const isActive = country.toLowerCase() === c.toLowerCase();
            return (
              <button
                key={c}
                onClick={() => setCountry(isActive ? '' : c)}
                className={`px-2 py-0.5 rounded text-[10px] font-medium transition cursor-pointer ${
                  isActive
                    ? 'bg-amber-400 text-slate-950 font-bold'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                {c}
              </button>
            );
          })}

          {hasActiveFilters && (
            <button
              onClick={handleReset}
              className="px-2 py-0.5 text-[10px] rounded border border-rose-900/60 bg-rose-950/30 text-rose-300 hover:bg-rose-900/50 transition cursor-pointer ml-auto flex items-center gap-1"
            >
              <X size={10} /> {t('filters.reset')}
            </button>
          )}
        </div>
      </div>

      {/* Results Count Header */}
      <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
        <span>
          {t('search.foundReports', { count: totalCount })}
        </span>
        {isLoading && (
          <span className="flex items-center gap-1 text-amber-400">
            <RefreshCw size={12} className="animate-spin" /> {t('search.searching')}
          </span>
        )}
      </div>

      {/* Results Grid */}
      {isLoading && results.length === 0 ? (
        <FeedSkeleton count={6} />
      ) : error ? (
        <div className="p-8 rounded-2xl border border-rose-900 bg-rose-950/20 text-center text-rose-400 space-y-2">
          <AlertCircle size={32} className="mx-auto" />
          <p className="text-xs">{error}</p>
        </div>
      ) : results.length === 0 ? (
        <div className="p-12 rounded-2xl border border-slate-800 bg-slate-900/20 text-center text-slate-400 space-y-2">
          <Globe size={36} className="mx-auto text-slate-600 mb-1" />
          <h3 className="text-sm font-semibold text-slate-300">{t('search.noMatchesTitle')}</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {t('search.noMatchesDesc')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
