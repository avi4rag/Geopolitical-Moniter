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
      className="px-2.5 py-1 rounded-md text-[10px] font-mono-code font-bold uppercase whitespace-nowrap cursor-pointer transition-all duration-150"
      style={active
        ? { backgroundColor: 'rgba(195, 192, 255, 0.15)', border: '1px solid var(--color-accent)', color: 'var(--color-accent)', boxShadow: '0 0 10px rgba(195,192,255,0.25)' }
        : { backgroundColor: 'rgba(21, 27, 45, 0.60)', border: '1px solid rgba(255, 255, 255, 0.08)', color: 'var(--color-text-dim)' }
      }
    >
      {value}
    </button>
  );

  return (
    <div className="space-y-8 w-full animate-fadeIn pb-16">
      {/* Header */}
      <div className="border-b pb-5" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center gap-2 mb-1.5">
          <div className="h-3 w-1 rounded-full" style={{ backgroundColor: 'var(--color-accent)' }} />
          <span className="text-[10px] font-mono-code font-bold uppercase tracking-widest" style={{ color: 'var(--color-accent)' }}>
            {t('search.tagline', { defaultValue: 'GLOBAL ARCHIVE QUERY' })}
          </span>
        </div>
        <h1 className="font-headline text-2xl sm:text-4xl font-bold mt-1" style={{ color: 'var(--color-text-primary)' }}>
          {t('search.title', { defaultValue: 'Intelligence Search' })}
        </h1>
        <p className="text-xs sm:text-sm mt-1.5 max-w-3xl" style={{ color: 'var(--color-text-muted)' }}>
          {t('search.subtitle', { defaultValue: 'Real-time multi-vector search across corroborated events, countries, and systemic impact domains.' })}
        </p>
      </div>

      {/* Search controls */}
      <div className="glass-panel p-5 sm:p-6 rounded-xl border space-y-5 shadow-lg" style={{ borderColor: 'var(--color-border)' }}>
        {/* Main search input */}
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--color-accent)' }} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('search.placeholder', { defaultValue: 'Search by keyword, country, entity, treaty, conflict...' })}
            className="w-full pl-12 pr-10 py-3 rounded-lg font-headline text-base glass-control focus:outline-none transition-all"
            style={{
              color: 'var(--color-text-primary)',
            }}
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-dim)] hover:text-white cursor-pointer p-1"
              aria-label="Clear query"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Country chips */}
        <div>
          <div className="text-[9px] font-mono-code font-bold uppercase tracking-widest mb-2.5 text-[var(--color-text-dim)]">
            Active Geopolitical Entities
          </div>
          <div className="flex flex-wrap gap-1.5">
            {POPULAR_COUNTRIES.map((c) => (
              <button
                key={c}
                onClick={() => setCountry(country === c ? '' : c)}
                className="px-2.5 py-1 rounded-md text-[10px] font-mono-code font-bold cursor-pointer transition-all duration-150"
                style={country === c
                  ? { backgroundColor: 'rgba(195, 192, 255, 0.20)', border: '1px solid var(--color-accent)', color: 'var(--color-accent)', boxShadow: '0 0 10px rgba(195,192,255,0.25)' }
                  : { backgroundColor: 'rgba(21, 27, 45, 0.50)', border: '1px solid rgba(255, 255, 255, 0.08)', color: 'var(--color-text-secondary)' }
                }
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Facet pills row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2 border-t" style={{ borderColor: 'var(--color-border-subtle)' }}>
          <div>
            <div className="text-[9px] font-mono-code font-bold uppercase tracking-widest mb-2 text-[var(--color-text-dim)]">Event Type</div>
            <div className="flex flex-wrap gap-1.5">
              {EVENT_TYPES.slice(0, 6).map((et) => (
                <Pill key={et} value={et.replace(/_/g, ' ')} active={eventType === et} onClick={() => setEventType(et)} />
              ))}
            </div>
          </div>
          <div>
            <div className="text-[9px] font-mono-code font-bold uppercase tracking-widest mb-2 text-[var(--color-text-dim)]">Sector</div>
            <div className="flex flex-wrap gap-1.5">
              {SECTORS.map((s) => (
                <Pill key={s} value={s} active={sector === s} onClick={() => setSector(s)} />
              ))}
            </div>
          </div>
          <div>
            <div className="text-[9px] font-mono-code font-bold uppercase tracking-widest mb-2 text-[var(--color-text-dim)]">Severity</div>
            <div className="flex flex-wrap gap-1.5">
              {SEVERITIES.map((sv) => (
                <Pill key={sv} value={sv} active={severity === sv} onClick={() => setSeverity(sv)} />
              ))}
            </div>
          </div>
        </div>

        {hasActive && (
          <div className="pt-2 border-t flex justify-end" style={{ borderColor: 'var(--color-border-subtle)' }}>
            <button
              onClick={handleReset}
              className="text-xs font-mono-code font-bold cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all"
              style={{
                color: '#f43f5e',
                border: '1px solid rgba(244,63,94,0.30)',
                backgroundColor: 'rgba(244,63,94,0.10)',
              }}
            >
              <X size={13} /> Reset All Filters
            </button>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="space-y-4">
        {!isLoading && results.length > 0 && (
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-2">
              <Globe size={14} style={{ color: 'var(--color-accent)' }} />
              <span className="text-xs font-mono-code tracking-wide" style={{ color: 'var(--color-text-secondary)' }}>
                <strong className="text-white">{totalCount}</strong> {t('search.resultsFound', { defaultValue: 'intelligence dispatches matched' })}
              </span>
            </div>
          </div>
        )}

        {isLoading ? (
          <FeedSkeleton count={6} />
        ) : error ? (
          <div className="glass-panel p-10 rounded-xl border text-center space-y-3" style={{ borderColor: 'var(--color-border)' }}>
            <AlertCircle size={28} style={{ color: 'var(--color-critical)', margin: '0 auto' }} />
            <p className="text-sm font-mono-code" style={{ color: 'var(--color-text-muted)' }}>{error}</p>
            <button
              onClick={performSearch}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono-code font-bold cursor-pointer transition-colors"
              style={{ backgroundColor: 'var(--color-surface-4)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
            >
              <RefreshCw size={12} /> Retry Search
            </button>
          </div>
        ) : results.length === 0 ? (
          <div className="glass-panel p-14 rounded-xl border text-center space-y-2" style={{ borderColor: 'var(--color-border)' }}>
            <Search size={28} style={{ color: 'var(--color-text-dim)', margin: '0 auto' }} />
            <p className="text-sm font-mono-code" style={{ color: 'var(--color-text-muted)' }}>
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
