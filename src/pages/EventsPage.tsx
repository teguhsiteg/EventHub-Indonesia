import React, { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { searchEventsInFirestore, EventSearchParams } from '../services/eventService';
import { EventSearchFilter } from '../components/events/EventSearchFilter';
import { EventItem } from '../types';
import { MapPin, ChevronRight, Trophy, Tag, Calendar, Search, Sparkles, ArrowRight } from 'lucide-react';

export const EventsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = useCallback(async (params: EventSearchParams) => {
    setIsSearching(true);
    try {
      const results = await searchEventsInFirestore(params);
      setEvents(results);
    } catch (e) {
      console.error('Search error:', e);
    } finally {
      setIsSearching(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    handleSearch({ query: initialQuery, limitCount: 25 });
  }, [handleSearch, initialQuery]);

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-[#090d16] text-[var(--text-primary)] pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header Section (DOKU Style) */}
        <div className="mb-10 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/40 border border-red-200/80 dark:border-red-800/60 text-[#e50a38] text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Katalog Resmi Event Olahraga</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Jelajahi <span className="text-[#e50a38]">Event & Race</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base mt-2 max-w-2xl">
            Cari marathon, fun run, trail ultra, hingga kompetisi bersepeda dengan sistem pendaftaran terverifikasi di seluruh Indonesia.
          </p>
        </div>

        {/* Filter Component */}
        <div className="mb-8">
          <EventSearchFilter
            onSearch={handleSearch}
            isSearching={isSearching}
            totalResults={events.length}
          />
        </div>

        {/* Event Cards Grid (Modern Enterprise 3-Column Grid) */}
        {loading || isSearching ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="enterprise-card h-88 bg-white dark:bg-slate-900 animate-pulse" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="enterprise-card p-16 text-center max-w-lg mx-auto bg-white dark:bg-slate-900">
            <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-950/40 flex items-center justify-center mx-auto mb-4 text-[#e50a38]">
              <Search className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Event Tidak Ditemukan</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Tidak ada jadwal race yang cocok dengan kata kunci atau filter Anda. Coba reset filter atau ganti kata pencarian.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map(event => (
              <Link
                key={event.id}
                to={`/events/${event.slug}`}
                className="enterprise-card group flex flex-col justify-between overflow-hidden bg-white dark:bg-[#0f172a]"
              >
                {/* Thumbnail Cover */}
                <div className="relative h-48 overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img
                    src={event.banner || 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?auto=format&fit=crop&w=600&q=80'}
                    alt={event.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Status Badge */}
                  <div className="absolute top-3 left-3">
                    <span className="badge-brand">
                      {event.category || 'Race'}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3 bg-white/95 dark:bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-slate-700 dark:text-slate-300 border border-slate-200/50">
                    {event.status === 'REGISTRATION_OPEN' ? '🟢 Open' : 'Tutup'}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-2">
                      <MapPin className="w-3.5 h-3.5 text-[#e50a38] shrink-0" />
                      <span className="truncate">{event.location}</span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-[#e50a38] transition-colors line-clamp-2 leading-snug">
                      {event.name}
                    </h3>

                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                      {event.description}
                    </p>

                    {/* Categories chips */}
                    {event.categories && event.categories.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {event.categories.slice(0, 3).map((cat, idx) => (
                          <span key={idx} className="text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md">
                            {cat}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Card Bottom Meta */}
                  <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Pelaksanaan</span>
                      <p className="font-bold text-slate-800 dark:text-slate-200">
                        {new Date(event.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>

                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 group-hover:bg-[#e50a38] group-hover:text-white transition-all shadow-xs">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
