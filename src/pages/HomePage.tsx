import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getPublicEvents } from '../services/eventService';
import { getSponsors } from '../services/settingsService';
import { EventItem, Sponsor } from '../types';
import { 
  Calendar, 
  MapPin, 
  ChevronRight, 
  ArrowRight,
  Flag,
  Sparkles
} from 'lucide-react';

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    el.querySelectorAll('.reveal:not(.in-view)').forEach(c => observer.observe(c));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

export const HomePage: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  
  const heroRef = useScrollReveal();
  const featuredRef = useScrollReveal();
  const upcomingRef = useScrollReveal();

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

  const featuredEvents = events.slice(0, 4);
  const upcomingEvents = events.filter(e => e.status === 'REGISTRATION_OPEN').slice(0, 5);

  return (
    <div className="min-h-screen font-sans antialiased bg-[var(--bg-main)] text-[var(--text-main)]">

      {/* ===== HERO SECTION ===== */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1552674605-15c82513bb15?auto=format&fit=crop&w=1920&q=80" 
            alt="Guwigo Events Hero" 
            className="w-full h-full object-cover brightness-75"
          />
        </div>
        <div className="absolute inset-0 hero-overlay" />
        
        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center text-white" ref={heroRef}>
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 backdrop-blur border border-white/20 mb-8 reveal">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-sm font-semibold tracking-[0.2em] uppercase">
              Platform Event Olahraga Premium
            </span>
          </div>

          <h1 className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-[7rem] leading-none tracking-wide mb-6 reveal drop-shadow-2xl">
            Where Champions <br/><span className="text-amber-500">Come To Life</span>
          </h1>

          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-12 reveal font-light">
            Temukan event lari, triathlon, dan olahraga eksklusif di Indonesia.
            Daftar mudah, pembayaran aman, dan nikmati pengalaman tak terlupakan.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 reveal">
            <Link
              to="/events"
              className="inline-flex items-center justify-center px-10 py-4 rounded-full bg-amber-600 text-white font-bold text-lg hover:bg-amber-500 transition-all shadow-lg shadow-amber-900/30 w-full sm:w-auto"
            >
              Lihat Event
            </Link>
            <Link
              to="/about"
              className="inline-flex items-center justify-center px-10 py-4 rounded-full bg-white/10 text-white font-semibold border border-white/30 hover:bg-white/20 transition-all backdrop-blur w-full sm:w-auto"
            >
              Tentang Kami
            </Link>
          </div>
        </div>
      </section>

      {/* ===== FEATURED EVENTS (DARK SECTION) ===== */}
      <section className="bg-slate-900 text-white py-24 border-t-4 border-amber-500" ref={featuredRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 reveal">
            <div className="inline-block px-4 py-1 border border-amber-500/50 rounded-full text-amber-500 text-xs font-bold tracking-widest uppercase mb-4">
              Pilihan Editor
            </div>
            <h2 className="font-display text-4xl md:text-6xl tracking-wider">Event Unggulan</h2>
          </div>

          {loading ? (
            <div className="flex gap-6 overflow-x-auto pb-8 justify-center">
              {[1, 2, 3, 4].map(i => <div key={i} className="w-[300px] h-[450px] bg-slate-800 animate-pulse rounded-2xl flex-shrink-0" />)}
            </div>
          ) : (
            <div className="flex gap-6 overflow-x-auto pb-10 hide-scrollbar snap-x snap-mandatory reveal">
              {featuredEvents.map((event) => (
                <Link
                  key={event.id}
                  to={`/events/${event.slug}`}
                  className="relative w-[300px] md:w-[320px] h-[450px] flex-shrink-0 snap-center rounded-2xl overflow-hidden group border border-slate-700 hover:border-amber-500 transition-all duration-500 block"
                >
                  <img
                    src={event.banner || 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?auto=format&fit=crop&w=800&q=80'}
                    alt={event.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent" />
                  
                  <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col justify-end h-full">
                    <span className="px-3 py-1 bg-amber-500 text-slate-900 text-xs font-bold uppercase tracking-wider rounded w-fit mb-3">
                      {event.category || 'Featured'}
                    </span>
                    <h3 className="font-display text-3xl mb-2 leading-tight group-hover:text-amber-400 transition-colors">{event.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-slate-300">
                      <span className="flex items-center gap-1"><Calendar className="w-4 h-4 text-amber-500" /> {new Date(event.startDate).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-amber-500" /> {event.location}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
          
          <div className="text-center mt-8 reveal">
            <Link to="/events" className="inline-flex items-center justify-center px-8 py-3 rounded bg-white/5 border border-white/20 text-white font-medium hover:bg-amber-600 hover:border-amber-600 transition-all">
              Jelajahi Semua
            </Link>
          </div>
        </div>
      </section>

      {/* ===== UPCOMING EVENTS (LIST VIEW) ===== */}
      <section className="py-24 bg-[var(--bg-main)]" ref={upcomingRef}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16 reveal">
            <h2 className="font-display text-5xl md:text-6xl tracking-wider text-slate-900 dark:text-white mb-2">Event Mendatang</h2>
            <div className="w-24 h-1 bg-amber-500"></div>
          </div>

          <div className="space-y-6">
            {upcomingEvents.length === 0 && !loading && (
              <p className="text-center text-slate-500">Belum ada event mendatang saat ini.</p>
            )}
            
            {upcomingEvents.map((event) => {
              const date = new Date(event.startDate);
              return (
                <Link
                  key={event.id}
                  to={`/events/${event.slug}`}
                  className="group flex flex-col md:flex-row items-center bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-xl hover:border-amber-200 dark:hover:border-amber-900 transition-all reveal"
                >
                  {/* Date Block */}
                  <div className="flex flex-col items-center justify-center px-8 py-4 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-700 min-w-[140px]">
                    <span className="text-5xl font-display font-bold text-amber-600 dark:text-amber-500">{date.getDate()}</span>
                    <span className="text-lg font-bold text-slate-500 uppercase tracking-widest">{date.toLocaleString('id-ID', { month: 'short' })}</span>
                  </div>

                  {/* Image (Optional, small) */}
                  <div className="hidden md:block w-32 h-32 ml-6 rounded-xl overflow-hidden flex-shrink-0">
                    <img 
                      src={event.banner || 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?auto=format&fit=crop&w=400&q=80'} 
                      alt={event.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 mt-6 md:mt-0 md:ml-8 text-center md:text-left">
                    <div className="inline-block px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-bold uppercase tracking-widest rounded-full mb-3">
                      Pendaftaran Buka
                    </div>
                    <h3 className="font-display text-3xl mb-2 text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-colors">{event.name}</h3>
                    <p className="text-slate-500 text-sm flex items-center justify-center md:justify-start gap-2">
                      <MapPin className="w-4 h-4 text-slate-400" /> {event.location}
                    </p>
                  </div>

                  {/* Action */}
                  <div className="mt-6 md:mt-0 md:ml-6">
                    <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-700 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-colors">
                      <ArrowRight className="w-5 h-5 -rotate-45" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
          
          {upcomingEvents.length > 0 && (
            <div className="mt-12 text-center reveal">
               <Link to="/events" className="inline-flex items-center gap-2 font-bold text-slate-900 dark:text-white hover:text-amber-600 transition-colors border-b-2 border-amber-500 pb-1 uppercase tracking-widest text-sm">
                 Semua Event <ChevronRight className="w-4 h-4" />
               </Link>
            </div>
          )}
        </div>
      </section>

      {/* ===== NEWSLETTER / CTA ===== */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=1920&q=80" alt="CTA" className="w-full h-full object-cover brightness-50" />
          <div className="absolute inset-0 bg-slate-900/80" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center text-white">
          <h2 className="font-display text-5xl mb-4">Tetap Terhubung</h2>
          <p className="text-lg text-slate-300 mb-8">Dapatkan informasi terbaru seputar jadwal event, diskon early bird, dan berita olahraga lainnya langsung ke inbox Anda.</p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
            <input 
              type="email" 
              placeholder="Masukkan alamat email..." 
              className="flex-1 px-6 py-4 rounded-full bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 backdrop-blur"
            />
            <button type="button" className="px-8 py-4 rounded-full bg-amber-600 hover:bg-amber-500 font-bold transition-colors">
              Subscribe
            </button>
          </form>
        </div>
      </section>
      
      {/* ===== SPONSORS ===== */}
      {sponsors.length > 0 && (
        <section className="py-12 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-8">Didukung Oleh</p>
            <div className="flex flex-wrap justify-center items-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
              {sponsors.slice(0,6).map(sp => (
                <div key={sp.id} className="h-10">
                  {sp.logoUrl ? <img src={sp.logoUrl} alt={sp.name} className="h-full object-contain" /> : <span className="font-bold text-xl">{sp.name}</span>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

    </div>
  );
};
