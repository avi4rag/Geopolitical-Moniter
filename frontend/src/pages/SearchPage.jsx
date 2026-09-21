import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, Globe, AlertCircle, RefreshCw, X } from 'lucide-react';
import apiClient from '../lib/apiClient.js';
import NewsCard from '../components/feed/NewsCard.jsx';
import FeedSkeleton from '../components/feed/FeedSkeleton.jsx';

const EVENT_TYPES = ['ALL','SANCTION','TRADE_RESTRICTION','MILITARY_CONFLICT','DIPLOMATIC_MEETING','TREATY_AGREEMENT','ELECTION','POLICY_CHANGE','RESOURCE_DISCOVERY','CYBER_ATTACK','TERRORISM','CIVIL_UNREST'];
const SECTORS = ['ALL','Energy','Trade','Technology','Defense','Finance','Transportation','Food & Agriculture'];
const SEVERITIES = ['ALL','CRITICAL','HIGH','MEDIUM','LOW'];
const POPULAR_COUNTRIES = ['United States','China','Russia','Ukraine','Taiwan','Iran','Israel','India','Japan','United Kingdom','Germany'];

export default function SearchPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [eventType, setEventType] = useState('ALL');
  const [sector, setSector] = useState('ALL');
  const [severity, setSeverity] = useState('ALL');
  const [country, setCountry] = useState('');
  const [results, setResults] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (searchParams.get('q')) setQuery(searchParams.get('q'));
  }, [searchParams]);

  const performSearch = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const params = { limit: 24, sortBy: 'createdAt', sortOrder: 'desc' };
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
    const timer = setTimeout(performSearch, 250);
    return () => clearTimeout(timer);
  }, [performSearch]);

  const handleReset = () => { setQuery(''); setEventType('ALL'); setSector('ALL'); setSeverity('ALL'); setCountry(''); };
  const hasActive = query !== '' || eventType !== 'ALL' || sector !== 'ALL' || severity !== 'ALL' || country !== '';

  const Pill = ({ value, active, onClick }) => (
    <button
      onClick={onClick}
      className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase whitespace-nowrap cursor-pointer transition-all duration-150 ${
        active
          ? 'bg-cyan-500/25 text-cyan-200 border border-cyan-400/40 shadow-[0_0_10px_rgba(6,182,212,0.25)]'
          : 'glass-control text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
      }`}
    >
      {value}
    </button>
  );

  return (
    <div className="space-y-8 w-full animate-fadeIn pb-16">
      {/* Header */}
      <div className="border-b border-slate-800/80 pb-5">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="h-3 w-1 rounded-full bg-cyan-400" />
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-cyan-400">
            {t('search.tagline', { defaultValue: 'GLOBAL ARCHIVE QUERY ENGINE' })}
          </span>
        </div>
        <h1 className="font-headline text-2xl sm:text-4xl font-bold mt-1 text-slate-100">
          {t('search.title', { defaultValue: 'Intelligence Search' })}
        </h1>
        <p className="text-xs sm:text-sm mt-1.5 max-w-3xl text-slate-400 font-sans leading-relaxed">
          {t('search.subtitle', { defaultValue: 'Real-time multi-vector search across corroborated events, countries, and systemic impact domains.' })}
        </p>
      </div>

      {/* Search controls console */}
      <div className="glass-panel p-5 sm:p-6 rounded-2xl space-y-5">
        {/* Main search input */}
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-cyan-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('search.placeholder', { defaultValue: 'Search by keyword, country, entity, treaty, conflict...' })}
            className="w-full pl-12 pr-10 py-3 rounded-xl font-headline text-sm sm:text-base glass-control text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-400/60 transition-all"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer p-1"
              aria-label="Clear query"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Country chips */}
        <div>
          <div className="text-[10px] font-mono font-bold uppercase tracking-widest mb-2.5 text-slate-400">
            Active Geopolitical Entities
          </div>
          <div className="flex flex-wrap gap-1.5">
            {POPULAR_COUNTRIES.map((c) => (
              <button
                key={c}
                onClick={() => setCountry(country === c ? '' : c)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold cursor-pointer transition-all duration-150 ${
                  country === c
                    ? 'bg-cyan-500/25 text-cyan-200 border border-cyan-400/40 shadow-[0_0_10px_rgba(6,182,212,0.25)]'
                    : c === 'India'
                    ? 'glass-control text-amber-300 border-amber-500/30 hover:border-amber-400/50'
                    : 'glass-control text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {c === 'India' ? '🇮🇳 India / भारत' : c}
              </button>
            ))}
          </div>
        </div>

        {/* Facet pills row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-3 border-t border-slate-800/60">
          <div>
            <div className="text-[10px] font-mono font-bold uppercase tracking-widest mb-2 text-slate-400">Event Classification</div>
            <div className="flex flex-wrap gap-1.5">
              {EVENT_TYPES.slice(0, 6).map((et) => (
                <Pill key={et} value={et.replace(/_/g, ' ')} active={eventType === et} onClick={() => setEventType(et)} />
              ))}
            </div>
          </div>
          <div>
            <div className="text-[10px] font-mono font-bold uppercase tracking-widest mb-2 text-slate-400">Strategic Sector</div>
            <div className="flex flex-wrap gap-1.5">
              {SECTORS.map((s) => (
                <Pill key={s} value={s} active={sector === s} onClick={() => setSector(s)} />
              ))}
            </div>
          </div>
          <div>
            <div className="text-[10px] font-mono font-bold uppercase tracking-widest mb-2 text-slate-400">Severity Tier</div>
            <div className="flex flex-wrap gap-1.5">
              {SEVERITIES.map((sv) => (
                <Pill key={sv} value={sv} active={severity === sv} onClick={() => setSeverity(sv)} />
              ))}
            </div>
          </div>
        </div>

        {hasActive && (
          <div className="pt-2 border-t border-slate-800/60 flex justify-end">
            <button
              onClick={handleReset}
              className="text-xs font-mono font-bold cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-500/30 bg-rose-950/40 text-rose-300 hover:bg-rose-900/50 transition-all"
            >
              <X size={13} /> Reset All Query Vectors
            </button>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="space-y-4">
        {!isLoading && results.length > 0 && (
          <div className="flex items-center justify-between pb-1 border-b border-slate-800/60">
            <div className="flex items-center gap-2">
              <Globe size={14} className="text-cyan-400" />
              <span className="text-xs font-mono text-slate-400">
                <strong className="text-cyan-300">{totalCount}</strong> {t('search.resultsFound', { defaultValue: 'intelligence dispatches matched' })}
              </span>
            </div>
          </div>
        )}

        {isLoading ? (
          <FeedSkeleton count={6} />
        ) : error ? (
          <div className="glass-panel p-10 rounded-2xl text-center space-y-3">
            <AlertCircle size={32} className="text-rose-400 mx-auto" />
            <p className="text-sm font-mono text-slate-300">{error}</p>
            <button
              onClick={performSearch}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold cursor-pointer glass-control text-slate-200 hover:text-white transition"
            >
              <RefreshCw size={12} /> Retry Search
            </button>
          </div>
        ) : results.length === 0 ? (
          <div className="glass-panel p-14 rounded-2xl text-center space-y-2">
            <Search size={32} className="text-slate-500 mx-auto" />
            <p className="text-sm font-mono text-slate-400">
              {hasActive ? t('search.noResults', { defaultValue: 'No intelligence events match the specified criteria' }) : t('search.startSearch', { defaultValue: 'Type a query above to search intelligence events' })}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {results.map((event) => (
              <NewsCard key={event._id} event={event} onSelect={(e) => navigate(`/event/${e._id}`)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
