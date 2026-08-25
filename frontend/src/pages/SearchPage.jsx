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
      className="px-2.5 py-1 rounded text-[10px] font-mono-code font-bold uppercase whitespace-nowrap cursor-pointer transition-colors"
      style={active
        ? { backgroundColor: 'var(--color-accent-bg)', border: '1px solid var(--color-accent-border)', color: 'var(--color-accent)' }
        : { backgroundColor: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text-dim)' }
      }
    >
      {value}
    </button>
  );

  return (
    <div className="space-y-8 w-full">
      {/* Header */}
      <div className="border-b pb-5" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center gap-2 mb-1">
          <div className="h-3 w-1 rounded-full" style={{ backgroundColor: 'var(--color-accent)' }} />
          <span className="text-[10px] font-mono-code font-bold uppercase tracking-widest" style={{ color: 'var(--color-accent)' }}>
            {t('search.tagline', { defaultValue: 'INTELLIGENCE ARCHIVE' })}
          </span>
        </div>
        <h1 className="font-headline text-2xl sm:text-4xl font-bold mt-1" style={{ color: 'var(--color-text-primary)' }}>
          {t('search.title', { defaultValue: 'Intelligence Search' })}
        </h1>
        <p className="text-xs sm:text-sm mt-1 max-w-3xl" style={{ color: 'var(--color-text-muted)' }}>
          {t('search.subtitle', { defaultValue: 'Search across events, countries, and domains.' })}
        </p>
      </div>

      {/* Search controls */}
      <div className="p-5 rounded-lg border space-y-5" style={{ backgroundColor: 'var(--color-surface-1)', borderColor: 'var(--color-border)' }}>
        {/* Main search input */}
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--color-text-dim)' }} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('search.placeholder', { defaultValue: 'Search events, countries, entities...' })}
            className="w-full pl-11 pr-10 py-3 rounded font-headline text-base"
            style={{
              backgroundColor: 'var(--color-surface-2)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-primary)',
            }}
            autoFocus
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer" style={{ color: 'var(--color-text-dim)' }}>
              <X size={16} />
            </button>
          )}
        </div>

        {/* Country chips */}
        <div>
          <div className="text-[9px] font-mono-code font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--color-text-dim)' }}>Quick Country Filter</div>
          <div className="flex flex-wrap gap-1.5">
            {POPULAR_COUNTRIES.map((c) => (
              <button
                key={c}
                onClick={() => setCountry(country === c ? '' : c)}
                className="px-2.5 py-1 rounded text-[10px] font-mono-code cursor-pointer transition-colors"
                style={country === c
                  ? { backgroundColor: 'var(--color-accent-bg)', border: '1px solid var(--color-accent-border)', color: 'var(--color-accent)' }
                  : { backgroundColor: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text-dim)' }
                }
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Facet pills row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="text-[9px] font-mono-code font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--color-text-dim)' }}>Event Type</div>
            <div className="flex flex-wrap gap-1.5">
              {EVENT_TYPES.slice(0, 6).map((et) => (
                <Pill key={et} value={et.replace(/_/g, ' ')} active={eventType === et} onClick={() => setEventType(et)} />
              ))}
            </div>
          </div>
          <div>
            <div className="text-[9px] font-mono-code font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--color-text-dim)' }}>Sector</div>
            <div className="flex flex-wrap gap-1.5">
              {SECTORS.map((s) => (
                <Pill key={s} value={s} active={sector === s} onClick={() => setSector(s)} />
              ))}
            </div>
          </div>
          <div>
            <div className="text-[9px] font-mono-code font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--color-text-dim)' }}>Severity</div>
            <div className="flex flex-wrap gap-1.5">
              {SEVERITIES.map((sv) => (
                <Pill key={sv} value={sv} active={severity === sv} onClick={() => setSeverity(sv)} />
              ))}
            </div>
          </div>
        </div>

        {hasActive && (
          <button onClick={handleReset} className="text-xs font-mono-code font-bold cursor-pointer flex items-center gap-1" style={{ color: '#e11d48' }}>
            <X size={12} /> Reset All Filters
          </button>
        )}
      </div>

      {/* Results */}
      <div className="space-y-4">
        {!isLoading && results.length > 0 && (
          <div className="flex items-center gap-2">
            <Globe size={14} style={{ color: 'var(--color-accent)' }} />
            <span className="text-xs font-mono-code" style={{ color: 'var(--color-text-dim)' }}>
              {totalCount} {t('search.resultsFound', { defaultValue: 'events found' })}
            </span>
          </div>
        )}

        {isLoading ? (
          <FeedSkeleton count={6} />
        ) : error ? (
          <div className="p-10 rounded-lg border text-center space-y-3" style={{ backgroundColor: 'var(--color-surface-1)', borderColor: 'var(--color-border)' }}>
            <AlertCircle size={28} style={{ color: 'var(--color-critical)', margin: '0 auto' }} />
            <p className="text-sm font-mono-code" style={{ color: 'var(--color-text-muted)' }}>{error}</p>
            <button onClick={performSearch} className="inline-flex items-center gap-2 px-4 py-2 rounded text-xs font-mono-code font-bold cursor-pointer" style={{ backgroundColor: 'var(--color-surface-4)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}>
              <RefreshCw size={12} /> Retry
            </button>
          </div>
        ) : results.length === 0 ? (
          <div className="p-14 rounded-lg border text-center space-y-2" style={{ backgroundColor: 'var(--color-surface-1)', borderColor: 'var(--color-border)' }}>
            <Search size={28} style={{ color: 'var(--color-text-dim)', margin: '0 auto' }} />
            <p className="text-sm font-mono-code" style={{ color: 'var(--color-text-muted)' }}>
              {hasActive ? t('search.noResults', { defaultValue: 'No events match your search' }) : t('search.startSearch', { defaultValue: 'Type a query to search intelligence events' })}
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
