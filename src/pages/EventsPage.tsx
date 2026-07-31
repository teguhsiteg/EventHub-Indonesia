import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { searchEventsInFirestore, EventSearchParams } from '../services/eventService';
import { EventSearchFilter } from '../components/events/EventSearchFilter';
import { EventCardSkeleton } from '../components/events/EventCardSkeleton';
import { EventItem } from '../types';
import { MapPin, ChevronRight, Trophy, Tag, Calendar, Search, Star } from 'lucide-react';

export const EventsPage: React.FC = () => {
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
    handleSearch({ limitCount: 25 });
  }, [handleSearch]);

  return (
    <div className="min-h-screen  text-slate-900 dark:text-slate-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* HEADER */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text--600 dark:text--400 text-[10px] font-black uppercase tracking-wider mb-3">
              <Star className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
              <span>RacePro Search</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-slate-900 dark:text-white uppercase tracking-tight">
              Jelajahi <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-yellow-400">Event Olahraga</span>
            </h1>
            <p className="text-slate-600 dark:text-slate-500 dark:text--600 dark:text--400 text-xs mt-2 max-w-xl">
              Filter dan cari event lari, trail run, marathon, atau cycling langsung dari database RacePro.
            </p>
          </div>
        </div>

        {/* Search & Filter Component */}
        <EventSearchFilter
          onSearch={handleSearch}
          isSearching={isSearching}
          totalResults={events.length}
        />

        {/* Event List Grid */}
        {loading || isSearching ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white/60 dark:bg-blue-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden animate-pulse">
                <div className="flex flex-col md:flex-row">
                  <div className="w-full md:w-56 h-48 md:h-auto bg-slate-200 dark:bg-slate-800/50 shrink-0" />
                  <div className="p-5 flex-1 space-y-3">
                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-full w-1/4" />
                    <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-full w-3/4" />
                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-full w-full" />
                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-full w-2/3" />
                    <div className="flex gap-2 pt-2">
                      <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-16" />
                      <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-16" />
                    </div>
                    <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
                      <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-full w-24" />
                      <div className="h-9 bg-slate-200 dark:bg-slate-800 rounded-xl w-20" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="p-16 text-center bg-white/40 dark:bg-blue-950/40 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg mx-auto backdrop-blur-sm">
            <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-center mx-auto mb-6">
              <Search className="w-8 h-8 text-slate-600 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Event Tidak Ditemukan</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed max-w-sm mx-auto">
              Tidak ada event di Firestore yang cocok dengan kata kunci, lokasi, atau kategori yang Anda pilih. Coba ubah filter pencarian.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {events.map(event => (
              <div
                key={event.id}
                className="group glass-card-interactive overflow-hidden transition-all duration-300"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Image */}
                  <div className="relative w-full md:w-56 shrink-0 h-48 md:h-auto overflow-hidden">
                    <img
                      src={event.banner}
                      alt={event.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-slate-50 dark:to-[#020617] md:bg-gradient-to-t md:from-slate-50 md:dark:from-[#020617] md:via-transparent md:to-transparent" />
                    
                    {/* Status badge */}
                    <div className="absolute top-3 left-3">
                      <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-md backdrop-blur-md shadow-lg ${
                        event.status === 'REGISTRATION_OPEN'
                          ? 'bg-blue-500/90 text-white'
                          : 'bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-600 dark:text-slate-300'
                      }`}>
                        {event.status === 'REGISTRATION_OPEN' ? 'Dibuka' : event.status}
                      </span>
                    </div>

                    {/* Category badge */}
                    {event.category && (
                      <div className="absolute top-3 right-3 bg-white/80 dark:bg-blue-950/80 backdrop-blur-md border border-slate-200 dark:border-slate-700/50 text-yellow-500 dark:text--600 dark:text--400 text-[10px] font-bold uppercase px-2.5 py-1 rounded-md flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        <span>{event.category}</span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-500 dark:text--600 dark:text--400 mb-1.5">
                        <MapPin className="w-3.5 h-3.5 text--600 dark:text--400 shrink-0" />
                        <span className="truncate">{event.location}</span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-blue-500 dark:group-hover:text--600 dark:text--400 transition-colors">
                        {event.name}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                        {event.description}
                      </p>

                      {/* Category chips */}
                      {event.categories && event.categories.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {event.categories.slice(0, 3).map((cat, idx) => (
                            <span key={idx} className="text-[10px] bg-slate-100 dark:bg-slate-800/60 text-slate-500 dark:text-slate-500 dark:text--600 dark:text--400 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700/50">
                              {cat}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-500 dark:text--600 dark:text--400 font-medium">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(event.startDate).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                      </span>
                      <Link
                        to={`/events/${event.slug}`}
                        className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-blue-500/20 transition-all group/link"
                      >
                        <span>Detail</span>
                        <ChevronRight className="w-4 h-4 group-hover/link:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
