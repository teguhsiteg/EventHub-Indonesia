import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Filter, X, RotateCcw, Loader2, Tag, Star } from 'lucide-react';
import { EventSearchParams } from '../../services/eventService';
import { EVENT_CATEGORIES } from '../../utils/constants';

interface EventSearchFilterProps {
  onSearch: (params: EventSearchParams) => void;
  isSearching?: boolean;
  totalResults?: number;
}

export const CATEGORY_OPTIONS = [
  { id: 'ALL', label: 'Semua Kategori' },
  ...EVENT_CATEGORIES.map(cat => ({ id: cat, label: cat }))
];

export const STATUS_OPTIONS = [
  { id: 'ALL', label: 'Semua Status Pendaftaran' },
  { id: 'REGISTRATION_OPEN', label: 'Open / Dibuka' },
  { id: 'REGISTRATION_CLOSED', label: 'Pendaftaran Ditutup' },
  { id: 'ONGOING', label: 'Sedang Berlangsung' }
];

export const POPULAR_LOCATIONS = ['Semua Lokasi', 'Yogyakarta', 'Bali', 'Jakarta', 'Bandung', 'Lombok'];

export const EventSearchFilter: React.FC<EventSearchFilterProps> = ({
  onSearch,
  isSearching = false,
  totalResults
}) => {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('Semua Lokasi');
  const [category, setCategory] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [isDebouncing, setIsDebouncing] = useState(false);

  // Debounce logic for query and location text input
  const initialRender = useRef(true);

  useEffect(() => {
    // Skip on initial mount if empty
    if (initialRender.current) {
      initialRender.current = false;
      return;
    }

    setIsDebouncing(true);

    const timer = setTimeout(() => {
      setIsDebouncing(false);
      onSearch({
        query: query.trim(),
        location: location === 'Semua Lokasi' ? '' : location,
        category,
        status,
        limitCount: 25
      });
    }, 350);

    return () => {
      clearTimeout(timer);
    };
  }, [query, location, category, status]);

  const handleReset = () => {
    setQuery('');
    setLocation('Semua Lokasi');
    setCategory('ALL');
    setStatus('ALL');
    onSearch({
      query: '',
      location: '',
      category: 'ALL',
      status: 'ALL',
      limitCount: 25
    });
  };

  const hasActiveFilters = query.trim() !== '' || location !== 'Semua Lokasi' || category !== 'ALL' || status !== 'ALL';

  return (
    <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl p-4 sm:p-6 shadow-xl mb-8 space-y-5">
      
      {/* Top Search Inputs Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 items-center">
        
        {/* Name / Keyword Search */}
        <div className="lg:col-span-5 relative">
          <label className="block text-[10px] font-extrabold text-slate-500 dark:text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Kata Kunci Lomba
          </label>
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari nama event, tantangan, atau deskripsi..."
              className="w-full  border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-9 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-3 p-1 text-slate-500 hover:text-slate-600 dark:text-slate-600 dark:text-slate-300 rounded-full transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Location Dropdown / Input */}
        <div className="lg:col-span-3 relative">
          <label className="block text-[10px] font-extrabold text-slate-500 dark:text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Lokasi Event
          </label>
          <div className="relative flex items-center">
            <MapPin className="w-4 h-4 text-blue-400 absolute left-3.5 pointer-events-none" />
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full  border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-8 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 appearance-none cursor-pointer transition-colors"
            >
              {POPULAR_LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Dropdown */}
        <div className="lg:col-span-4 relative">
          <label className="block text-[10px] font-extrabold text-slate-500 dark:text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Status Pendaftaran
          </label>
          <div className="relative flex items-center">
            <Filter className="w-4 h-4 text-slate-500 absolute left-3.5 pointer-events-none" />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full  border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-8 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer transition-colors"
            >
              {STATUS_OPTIONS.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.label}
                </option>
              ))}
            </select>
          </div>
        </div>

      </div>

      {/* Category Pills Bar */}
      <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-500 dark:text-slate-400 uppercase tracking-wider mr-2 flex items-center gap-1">
            <Tag className="w-3 h-3 text-blue-400 dark:text-amber-400" />
            <span>Kategori:</span>
          </span>
          {CATEGORY_OPTIONS.map((cat) => {
            const isSelected = category === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : ' border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200 hover:border-slate-300 dark:border-slate-700'
                }`}
              >
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Action Controls & Indicators */}
        <div className="flex items-center gap-3 shrink-0">
          {(isDebouncing || isSearching) && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-800/50 text-blue-400 text-[11px] font-semibold animate-pulse">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Mencari di Firestore...</span>
            </div>
          )}

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg  hover:bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200 text-xs font-bold transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>Reset Filter</span>
            </button>
          )}

          {typeof totalResults === 'number' && !isDebouncing && !isSearching && (
            <div className="text-[11px] text-slate-500 dark:text-slate-500 dark:text-slate-400 font-semibold  px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800">
              <span className="text-slate-900 dark:text-white font-extrabold">{totalResults}</span> event ditemukan
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
