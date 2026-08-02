import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPublicEvents } from '../services/eventService';
import { getSponsors } from '../services/settingsService';
import { EventItem, Sponsor } from '../types';
import { 
  Trophy, 
  Calendar, 
  MapPin, 
  ChevronRight, 
  ArrowRight
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHomeData() {
      setLoading(true);
      try {
        const evs = await getPublicEvents();
        setEvents(evs);
        const sps = await getSponsors();
        setSponsors(sps);
      } catch (e) {
        console.error('Home data load error:', e);
      }
      setLoading(false);
    }
    loadHomeData();
  }, []);

  const featuredEvents = events.slice(0, 6);

  return (
    <div className="min-h-screen bg-white text-slate-800 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-32 md:pt-48 md:pb-40 overflow-hidden bg-white">
        
        {/* Elegant Soft Blue Glows (Ticketly Style) */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden flex items-center justify-center">
          <div className="absolute top-0 w-[800px] h-[800px] bg-gradient-to-b from-blue-400/40 via-blue-200/20 to-transparent blur-[120px] rounded-full" />
          <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-blue-100/40 blur-[100px] rounded-full" />
          <div className="absolute top-1/4 left-0 w-[600px] h-[600px] bg-blue-100/40 blur-[100px] rounded-full" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            
            {/* Pill Badge */}
            <div className="inline-flex items-center justify-center">
              <div className="px-5 py-2 rounded-full bg-blue-50/80 border border-blue-100 text-blue-600 text-[11px] font-bold uppercase tracking-wider shadow-sm">
                World no. 1 event ticket platform
              </div>
            </div>

            {/* Main headline */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-slate-900 tracking-tight leading-[1.15]">
              Convenience for Yourself to <br className="hidden md:block"/>
              Get Ticket Events!
            </h1>

            {/* Subtitle */}
            <p className="text-slate-500 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto font-medium">
              EventHub by Guwigo is a platform that provides online event ticket sales, already widely used in various regions.
            </p>

            {/* Hero CTAs */}
            <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/events"
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white text-blue-600 font-bold text-sm tracking-wide shadow-elegant hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <span>Download Apps</span>
                <ArrowRight className="w-4 h-4 -rotate-45" />
              </Link>
              <Link
                to="/about"
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-transparent border border-blue-200 text-blue-600 font-bold text-sm tracking-wide hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
              >
                <span>Learn More</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SPONSOR LOGOS (Minimalist) */}
      {sponsors.length > 0 && (
        <section className="py-12 border-b border-slate-100 bg-white relative z-20">
          <div className="max-w-7xl mx-auto px-4 overflow-hidden">
             <div className="flex justify-center items-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500 flex-wrap">
              {sponsors.slice(0, 5).map((sp) => (
                <div key={sp.id} className="flex items-center gap-2">
                  {sp.logoUrl ? (
                    <img src={sp.logoUrl} alt={sp.name} className="h-8 object-contain" />
                  ) : (
                    <span className="text-xl font-black tracking-tighter text-slate-400">{sp.name}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FEATURES SECTION (Light & Clean) */}
      <section className="py-24 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-1.5 rounded-full bg-blue-50 text-blue-500 text-xs font-bold uppercase tracking-wider mb-4 border border-blue-100">
              Our Features
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
              makes it easy to find the <br/> latest tickets
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: 'categorization', desc: 'that makes it easy to find event tickets. Categorize them properly so that users can easily use them.', num: '/ 01' },
              { title: 'ease of buying', desc: 'tickets can provide a different experience. Making it easy for you to find concert and race tickets.', num: '/ 02' },
              { title: 'choosing a seat', desc: 'can now be done by looking at the actual map. Easy to use map for event selections.', num: '/ 03' },
            ].map((feat, idx) => (
              <div key={idx} className="bg-white rounded-3xl p-8 shadow-elegant border border-slate-100 flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300">
                <div>
                  <span className="text-blue-500 font-bold mb-4 block">{feat.num}</span>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4 leading-tight">
                    <span className="bg-blue-500 text-white px-2 py-0.5 rounded mr-1">{feat.title}</span> 
                    {feat.desc.split('.')[0]}
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    {feat.desc.split('.').slice(1).join('.')}
                  </p>
                </div>
                <div className="mt-8">
                  <button className="px-6 py-2.5 rounded-full border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-colors">
                    Learn More
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED EVENTS */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
                Upcoming Events
              </h2>
              <p className="text-slate-500 mt-2 font-medium">Discover the best sports and running events.</p>
            </div>
            <Link
              to="/events"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-blue-50 text-blue-600 font-bold text-sm tracking-wide hover:bg-blue-100 transition-colors"
            >
              <span>See All Events</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white border border-slate-100 rounded-3xl h-[400px] animate-pulse shadow-sm" />
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="p-16 text-center bg-slate-50 rounded-3xl border border-slate-100 max-w-lg mx-auto">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-900">Belum ada event tersedia.</h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredEvents.map((event) => (
                <Link
                  key={event.id}
                  to={`/events/${event.slug}`}
                  className="group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-elegant hover:shadow-xl transition-all duration-500 flex flex-col"
                >
                  {/* Banner */}
                  <div className="relative h-56 overflow-hidden bg-slate-100 p-2">
                    <img
                      src={event.banner || 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?auto=format&fit=crop&w=800&q=80'}
                      alt={event.name}
                      className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-4 left-4">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full backdrop-blur-md shadow-sm border border-white/50 ${
                        event.status === 'REGISTRATION_OPEN' 
                          ? 'bg-blue-600/90 text-white' 
                          : 'bg-white/90 text-slate-700'
                      }`}>
                        {event.status === 'REGISTRATION_OPEN' ? 'Open' : event.status}
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500">
                          <MapPin className="w-3.5 h-3.5 text-blue-500" />
                          <span className="truncate max-w-[150px]">{event.location}</span>
                        </div>
                        <div className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                           <Calendar className="w-3.5 h-3.5 text-blue-500" />
                           {new Date(event.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight">
                        {event.name}
                      </h3>
                      <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
                        {event.description}
                      </p>
                    </div>

                    <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
                       <span className="text-lg font-black text-blue-600">
                          {event.status === 'REGISTRATION_OPEN' ? 'Register Now' : 'View Details'}
                       </span>
                      <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white text-slate-400 transition-all">
                        <ArrowRight className="w-4 h-4 -rotate-45" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* BOTTOM CTA (Clean Ticketly Style) */}
      <section className="py-24 bg-blue-50/50">
        <div className="max-w-4xl mx-auto text-center px-4 space-y-8">
          <div className="inline-block px-4 py-1.5 rounded-full bg-blue-100/50 text-blue-600 text-xs font-bold uppercase tracking-wider mb-2">
            Active User
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight leading-tight">
            Our application has spread across <br/> continents and has many active users
          </h2>
          <div className="pt-8 flex flex-col sm:flex-row justify-center gap-4">
             <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-blue-600 text-white font-bold text-sm tracking-wide shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
              >
                <span>Get Started Now</span>
              </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
