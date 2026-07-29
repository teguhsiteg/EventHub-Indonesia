import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { searchEventsInFirestore, EventSearchParams } from '../services/eventService';
import { EventSearchFilter } from '../components/events/EventSearchFilter';
import { EventCardSkeleton } from '../components/events/EventCardSkeleton';
import { EventItem } from '../types';
import { MapPin, ChevronRight, Trophy, Tag, Sparkles } from 'lucide-react';

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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-orange-400 text-[10px] font-black uppercase tracking-wider mb-2">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>GUWIGO EVENTS FIRESTORE SEARCH</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Jelajah Event Olahraga</h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
              Filter dan cari event lari, trail run, marathon, atau cycling langsung dari database Firestore.
            </p>
          </div>
        </div>

        {/* Search & Filter Component with Debounce Logic */}
        <EventSearchFilter
          onSearch={handleSearch}
          isSearching={isSearching}
          totalResults={events.length}
        />

        {/* Event List Grid */}
        {loading || isSearching ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <EventCardSkeleton key={i} />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="p-16 text-center bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-lg mx-auto">
            <Trophy className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Event Tidak Ditemukan</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Tidak ada event di Firestore yang cocok dengan kata kunci, lokasi, atau kategori yang Anda pilih.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map(event => (
              <div key={event.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden flex flex-col hover:border-slate-300 dark:border-slate-700 transition-all group shadow-lg">
                <div className="relative h-48 bg-slate-50 dark:bg-slate-950 overflow-hidden">
                  <img src={event.banner} alt={event.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-3 left-3 bg-orange-600 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded shadow-md">
                    {event.status === 'REGISTRATION_OPEN' ? 'DIBUKA' : event.status}
                  </div>
                  {event.category && (
                    <div className="absolute top-3 right-3 bg-slate-50 dark:bg-slate-950/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 text-amber-400 text-[10px] font-bold uppercase px-2.5 py-1 rounded flex items-center gap-1">
                      <Tag className="w-3 h-3 text-amber-400" />
                      <span>{event.category}</span>
                    </div>
                  )}
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1.5">
                      <MapPin className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                      <span className="truncate">{event.location}</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-orange-400 transition-colors">{event.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">{event.description}</p>
                    
                    {/* Categories chips if available */}
                    {event.categories && event.categories.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {event.categories.slice(0, 3).map((cat, idx) => (
                          <span key={idx} className="text-[10px] bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800">
                            {cat}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      {new Date(event.startDate).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                    </span>
                    <Link
                      to={`/events/${event.slug}`}
                      className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1 shadow-md shadow-orange-600/20 transition-all"
                    >
                      <span>Detail</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
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

