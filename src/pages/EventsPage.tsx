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
    <div className="min-h-screen bg-slate-50/50 text-slate-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* HEADER */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-50 border border-red-100 text-red-600 text-[10px] font-bold uppercase tracking-wider mb-4">
              <Star className="w-3.5 h-3.5 text-red-500" />
              <span>EventHub by Guwigo Search</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
              Explore <span className="text-red-600">Events</span>
            </h1>
            <p className="text-slate-500 text-sm mt-3 max-w-xl">
              Filter and search for running events, trail runs, marathons, or cycling directly from the EventHub by Guwigo database.
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white border border-slate-100 rounded-3xl overflow-hidden animate-pulse shadow-sm">
                <div className="flex flex-col md:flex-row">
                  <div className="w-full md:w-56 h-48 md:h-auto bg-slate-100 shrink-0" />
                  <div className="p-6 flex-1 space-y-4">
                    <div className="h-3 bg-slate-100 rounded-full w-1/4" />
                    <div className="h-5 bg-slate-100 rounded-full w-3/4" />
                    <div className="h-3 bg-slate-100 rounded-full w-full" />
                    <div className="h-3 bg-slate-100 rounded-full w-2/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="p-16 text-center bg-white border border-slate-100 rounded-3xl max-w-lg mx-auto shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-6">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Event Tidak Ditemukan</h3>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed max-w-sm mx-auto">
              Tidak ada event di database yang cocok dengan filter pencarian Anda. Coba ubah kategori atau lokasi.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {events.map(event => (
              <div
                key={event.id}
                className="group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-elegant hover:shadow-xl transition-all duration-300"
              >
                <div className="flex flex-col md:flex-row h-full">
                  {/* Image */}
                  <div className="relative w-full md:w-64 shrink-0 h-56 md:h-auto overflow-hidden bg-slate-100 p-2">
                    <img
                      src={event.banner}
                      alt={event.name}
                      className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-700"
                    />
                    
                    {/* Status badge */}
                    <div className="absolute top-4 left-4">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full backdrop-blur-md shadow-sm border border-white/50 ${
                        event.status === 'REGISTRATION_OPEN'
                          ? 'bg-red-600/90 text-white'
                          : 'bg-white/90 text-slate-700'
                      }`}>
                        {event.status === 'REGISTRATION_OPEN' ? 'Open' : event.status}
                      </span>
                    </div>

                    {/* Category badge */}
                    {event.category && (
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md border border-slate-100 text-slate-600 text-[10px] font-bold uppercase px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                        <Tag className="w-3 h-3 text-red-500" />
                        <span>{event.category}</span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 mb-3">
                        <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                        <span className="truncate">{event.location}</span>
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 group-hover:text-red-600 transition-colors line-clamp-2 leading-tight">
                        {event.name}
                      </h3>
                      <p className="text-sm text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                        {event.description}
                      </p>

                      {/* Category chips */}
                      {event.categories && event.categories.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                          {event.categories.slice(0, 3).map((cat, idx) => (
                            <span key={idx} className="text-[10px] font-bold bg-slate-50 text-slate-500 px-3 py-1 rounded-full border border-slate-100">
                              {cat}
                            </span>
                          ))}
                          {event.categories.length > 3 && (
                            <span className="text-[10px] font-bold bg-slate-50 text-slate-500 px-3 py-1 rounded-full border border-slate-100">
                              +{event.categories.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Tanggal Event</span>
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                          <Calendar className="w-4 h-4 text-red-500" />
                          {new Date(event.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      </div>
                      <Link
                        to={`/events/${event.slug}`}
                        className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-red-500 group-hover:text-white text-slate-400 transition-all shadow-sm"
                      >
                        <ChevronRight className="w-4 h-4" />
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
