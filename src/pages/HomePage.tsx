import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getPublicEvents } from '../services/eventService';
import { getSponsors } from '../services/settingsService';
import { EventItem, Sponsor } from '../types';
import { 
  Trophy, 
  Calendar, 
  MapPin, 
  ChevronRight, 
  ArrowRight,
  Users,
  Medal,
  Flag,
  Sparkles,
  Clock
} from 'lucide-react';

// Inline IntersectionObserver for scroll reveal
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
    // Also observe all .reveal children
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
  const featuresRef = useScrollReveal();
  const eventsRef = useScrollReveal();
  const ctaRef = useScrollReveal();

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
  const upcomingEvents = events.filter(e => e.status === 'REGISTRATION_OPEN').slice(0, 3);

  return (
    <div className="min-h-screen text-slate-800 dark:text-gray-200 flex flex-col font-sans antialiased">

      {/* ===== HERO SECTION ===== */}
      <section className="pt-24 pb-8 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto w-full">
        <div className="relative min-h-[75vh] flex items-center overflow-hidden rounded-[32px] shadow-sm">
          {/* Background image */}
          <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1552674605-15c82513bb15?auto=format&fit=crop&w=1920&q=80" 
            alt="Guwigo Events" 
            className="w-full h-full object-cover brightness-75 saturate-150"
          />
        </div>

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-blue-900/35 to-black/60" />
        <div className="absolute inset-0 hero-grid-pattern opacity-10" />

        {/* Glow orbs */}
        <div className="absolute top-1/4 -right-32 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl animate-pulse-soft pointer-events-none" />
        <div className="absolute bottom-1/4 -left-32 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-20" ref={heroRef}>
          <div className="text-center text-white">
            {/* Pill badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6 reveal">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-xs font-semibold tracking-wider uppercase">
                Platform Event Olahraga Terdepan di Indonesia
              </span>
            </div>

            <h1 className="font-display text-6xl sm:text-7xl md:text-8xl lg:text-9xl tracking-wider mb-4 reveal">
              GUWIGO EVENTS
            </h1>

            <p className="text-xl md:text-2xl font-light mb-2 reveal text-white/90">
              Lebih dari Sekadar Lomba
            </p>
            <p className="text-base md:text-lg text-white/70 max-w-2xl mx-auto mb-10 reveal">
              Temukan event lari, triathlon, dan olahraga terbaik di Indonesia. Daftar mudah, 
              pembayaran aman, dan nikmati pengalaman event yang tak terlupakan.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 reveal">
              <Link
                to="/events"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-amber-500 text-blue-900 font-bold text-base shadow-xl shadow-amber-500/30 hover:bg-amber-400 hover:scale-105 transition"
              >
                <Flag className="w-5 h-5" />
                Jelajahi Event
              </Link>
              <Link
                to="/about"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white/10 backdrop-blur-md border border-white/30 text-white font-semibold hover:bg-white/20 transition"
              >
                <Sparkles className="w-5 h-5" />
                Tentang Kami
              </Link>
            </div>

            {/* Stats row */}
            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12 reveal">
              {[
                { icon: Users, value: '1000+', label: 'Peserta' },
                { icon: Flag, value: '50+', label: 'Event' },
                { icon: Medal, value: '25+', label: 'Kota' },
                { icon: Trophy, value: '4.9', label: 'Rating' },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <stat.icon className="w-5 h-5 text-amber-400 mx-auto mb-2" />
                  <p className="font-display text-3xl md:text-4xl tracking-wider">{stat.value}</p>
                  <p className="text-xs text-white/60 uppercase tracking-wider">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        </div>
      </section>

      {/* ===== SPONSORS BAR ===== */}
      {sponsors.length > 0 && (
        <section className="py-10 border-b border-gray-100 dark:border-gray-800">
          <div className="max-w-7xl mx-auto px-4">
            <p className="text-center text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-6">
              Dipercaya Oleh
            </p>
            <div className="flex justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500 flex-wrap">
              {sponsors.slice(0, 6).map((sp) => (
                <div key={sp.id} className="flex items-center gap-2">
                  {sp.logoUrl ? (
                    <img src={sp.logoUrl} alt={sp.name} className="h-8 md:h-10 object-contain" />
                  ) : (
                    <span className="text-xl font-black tracking-tighter text-gray-400">{sp.name}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== UPCOMING EVENTS (Highlight) ===== */}
      {upcomingEvents.length > 0 && (
        <section className="py-20 md:py-28 bg-gray-50 dark:bg-gray-900/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" ref={eventsRef}>
            <div className="text-center mb-14 reveal">
              <p className="text-sm font-semibold tracking-widest uppercase text-blue-600 dark:text-amber-400 mb-2">
                Segera Hadir
              </p>
              <h2 className="font-display text-4xl md:text-5xl tracking-wider mb-3">
                Event Mendatang
              </h2>
              <p className="opacity-70 max-w-2xl mx-auto">
                Daftar sekarang sebelum kehabisan slot. Event terbaik menantimu!
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {upcomingEvents.map((event) => (
                <Link
                  key={event.id}
                  to={`/events/${event.slug}`}
                  className="event-card group flex flex-col"
                >
                  <div className="relative h-52 overflow-hidden bg-gray-100 dark:bg-gray-800">
                    <img
                      src={event.banner || 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?auto=format&fit=crop&w=800&q=80'}
                      alt={event.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-transparent dark:from-gray-900/80" />
                    <div className="absolute top-4 left-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full backdrop-blur-md shadow-sm border border-white/50 bg-blue-600/90 text-white">
                        Buka Pendaftaran
                      </span>
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between relative z-10 -mt-8">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-xs font-bold text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-blue-500" />{event.location}</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-blue-500" />{new Date(event.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                      <h3 className="font-display text-2xl tracking-wider text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-amber-400 transition-colors line-clamp-2">
                        {event.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                        {event.description}
                      </p>
                    </div>

                    <div className="pt-5 mt-5 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                      <span className="text-sm font-bold text-blue-600 dark:text-amber-400">Daftar Sekarang</span>
                      <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center group-hover:bg-blue-600 dark:group-hover:bg-amber-500 group-hover:text-white text-gray-400 transition-all">
                        <ArrowRight className="w-4 h-4 -rotate-45" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="text-center mt-12 reveal">
              <Link
                to="/events"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-500/30 transition"
              >
                Lihat Semua Event
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ===== FEATURES SECTION ===== */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" ref={featuresRef}>
          <div className="text-center mb-14 reveal">
            <p className="text-sm font-semibold tracking-widest uppercase text-blue-600 dark:text-amber-400 mb-2">
              Kenapa Guwigo?
            </p>
            <h2 className="font-display text-4xl md:text-5xl tracking-wider mb-3">
              Pengalaman Event Premium
            </h2>
            <p className="opacity-70 max-w-2xl mx-auto">
              Semua yang kamu butuhkan untuk mengelola dan mengikuti event olahraga, dalam satu platform.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[
              { icon: '🎫', title: 'Registrasi Mudah', desc: 'Pendaftaran online cepat dengan berbagai metode pembayaran.' },
              { icon: '⏱️', title: 'Timing Chip', desc: 'Pencatatan waktu akurat dengan teknologi chip profesional.' },
              { icon: '🏅', title: 'Sertifikat Digital', desc: 'E-sertifikat resmi langsung setelah menyelesaikan event.' },
              { icon: '📋', title: 'Cek Hasil Live', desc: 'Pantau hasil & klasemen secara real-time selama event.' },
              { icon: '📍', title: 'QR Check-in', desc: 'Check-in peserta cepat dengan QR code di race pack.' },
              { icon: '📸', title: 'Foto Event', desc: 'Galeri foto event yang bisa diakses semua peserta.' },
              { icon: '🛡️', title: 'Asuransi', desc: 'Perlindungan asuransi selama mengikuti event.' },
              { icon: '🎽', title: 'Race Pack', desc: 'Perlengkapan race pack eksklusif dengan jersey & BIB.' },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="p-8 rounded-3xl bg-white dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 hover:border-blue-500 dark:hover:border-amber-500/30 hover:shadow-lg transition reveal group"
              >
                <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-6 text-3xl group-hover:scale-110 transition shadow-sm">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-800 dark:text-white">{feature.title}</h3>
                <p className="text-slate-600 dark:text-gray-300 leading-relaxed text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== ALL EVENTS GRID ===== */}
      {featuredEvents.length > 0 && upcomingEvents.length === 0 && (
        <section className="py-20 md:py-28 bg-gray-50 dark:bg-gray-900/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4 reveal">
              <div>
                <p className="text-sm font-semibold tracking-widest uppercase text-blue-600 dark:text-amber-400 mb-2">
                  Katalog Event
                </p>
                <h2 className="font-display text-4xl md:text-5xl tracking-wider">
                  Semua Event
                </h2>
              </div>
              <Link
                to="/events"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-amber-400 font-bold text-sm hover:bg-blue-100 dark:hover:bg-blue-900/40 transition"
              >
                Lihat Semua
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map(i => (
                  <div key={i} className="event-card h-[420px] animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredEvents.map((event) => (
                  <Link
                    key={event.id}
                    to={`/events/${event.slug}`}
                    className="event-card group flex flex-col reveal"
                  >
                    <div className="relative h-52 overflow-hidden bg-gray-100 dark:bg-gray-800">
                      <img
                        src={event.banner || 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?auto=format&fit=crop&w=800&q=80'}
                        alt={event.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-transparent dark:from-gray-900/80" />
                      <div className="absolute top-4 left-4">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full backdrop-blur-md shadow-sm border border-white/50 ${
                          event.status === 'REGISTRATION_OPEN' 
                            ? 'bg-blue-600/90 text-white' 
                            : 'bg-white/90 text-gray-700'
                        }`}>
                          {event.status === 'REGISTRATION_OPEN' ? 'Buka' : event.status}
                        </span>
                      </div>
                    </div>

                    <div className="p-6 flex-1 flex flex-col justify-between relative z-10 -mt-8">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-xs font-bold text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-blue-500" />{event.location}</span>
                          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-blue-500" />{new Date(event.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                        </div>
                        <h3 className="font-display text-2xl tracking-wider text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-amber-400 transition-colors line-clamp-2">
                          {event.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                          {event.description}
                        </p>
                      </div>

                      <div className="pt-5 mt-5 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                        <span className="text-sm font-bold text-blue-600 dark:text-amber-400">
                          {event.status === 'REGISTRATION_OPEN' ? 'Daftar Sekarang' : 'Lihat Detail'}
                        </span>
                        <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center group-hover:bg-blue-600 dark:group-hover:bg-amber-500 group-hover:text-white text-gray-400 transition-all">
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
      )}

      {/* ===== BOTTOM CTA ===== */}
      <section className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="relative overflow-hidden rounded-[32px] shadow-sm py-20 px-8">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-blue-600 to-blue-800" />
        <div className="absolute inset-0 hero-grid-pattern -z-10 opacity-10" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-amber-500/20 rounded-full blur-3xl -z-10 animate-pulse-soft" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white" ref={ctaRef}>
          <h2 className="font-display text-5xl md:text-7xl tracking-wider mb-4 reveal">SIAP?</h2>
          <p className="text-xl md:text-2xl font-light mb-3 reveal">Jadi bagian dari pengalaman event terbaik.</p>
          <p className="opacity-80 max-w-2xl mx-auto mb-10 reveal">
            Daftarkan event kamu atau ikuti event yang tersedia. Slot terbatas — jangan sampai ketinggalan!
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 reveal">
            <Link
              to="/events"
              className="w-full sm:w-auto inline-flex items-center gap-2 px-10 py-5 rounded-full bg-amber-500 text-blue-900 font-bold text-lg shadow-xl shadow-amber-500/40 hover:bg-amber-400 hover:scale-105 transition"
            >
              <Flag className="w-6 h-6" />
              Jelajahi Event
            </Link>
            <Link
              to="/host-event"
              className="w-full sm:w-auto inline-flex items-center gap-2 px-10 py-5 rounded-full bg-white/10 backdrop-blur-md border border-white/30 text-white font-bold text-lg hover:bg-white/20 transition"
            >
              <Trophy className="w-6 h-6" />
              Jadi Penyelenggara
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-white/80 reveal">
            <span className="flex items-center gap-2">
              <Flag className="w-4 h-4 text-amber-400" />
              Pendaftaran Aman
            </span>
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              Pembayaran Mudah
            </span>
            <span className="flex items-center gap-2">
              <Medal className="w-4 h-4 text-amber-400" />
              Hasil Real-time
            </span>
          </div>
        </div>
        </div>
      </section>
    </div>
  );
};
