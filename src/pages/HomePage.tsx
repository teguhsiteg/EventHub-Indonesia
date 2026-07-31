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
  ShieldCheck, 
  Star, 
  Award, 
  CheckCircle2, 
  Zap,
  ArrowRight,
  Users,
  TrendingUp
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
    <div className="min-h-screen  text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-blue-500 selection:text-slate-900">

      {/* HERO SECTION */}
      <section className="relative pt-24 pb-32 md:pt-36 md:pb-48 overflow-hidden bg-[#020617]">
        {/* Cinematic Background */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=1920&q=80" 
            alt="Runners" 
            className="w-full h-full object-cover opacity-30 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#020617] via-transparent to-[#020617]" />
        </div>

        {/* Animated Glows */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-blue-600/30 blur-[150px] rounded-full animate-pulse" />
          <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-yellow-500/20 blur-[130px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-5xl mx-auto space-y-10">
            {/* Brand badge */}
            <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 text-blue-400 text-xs font-bold uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:bg-white/10 transition-colors cursor-default">
              <Star className="w-4 h-4 text-yellow-400 animate-pulse" />
              <span>GUWIGO — THE ULTIMATE SPORTS PLATFORM</span>
            </div>

            {/* Main headline */}
            <h1 className="text-5xl sm:text-7xl md:text-8xl font-black text-white tracking-tighter leading-[1.1]">
              TEMUKAN EVENT<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-yellow-400 drop-shadow-[0_0_30px_rgba(59,130,246,0.5)]">
                OLAHRAGA TERBAIKMU
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-slate-300 text-lg md:text-2xl leading-relaxed max-w-3xl mx-auto font-light">
              Guwigo menghubungkan kamu dengan ribuan event olahraga terbaik di Indonesia.
              Dari lari marathon hingga trail run — <span className="font-semibold text-white">satu platform, semua event.</span>
            </p>

            {/* Hero CTAs */}
            <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link
                to="/events"
                className="w-full sm:w-auto group px-10 py-5 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-black text-sm uppercase tracking-widest shadow-[0_0_40px_rgba(59,130,246,0.4)] transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3 border border-blue-400/50"
              >
                <span>Jelajahi Event</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
              </Link>
              <Link
                to="/register"
                className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-white/5 backdrop-blur-md hover:bg-white/10 border border-white/20 text-white font-bold text-sm uppercase tracking-widest transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3"
              >
                <Users className="w-5 h-5 text-blue-400" />
                <span>Daftar Sebagai Peserta</span>
              </Link>
            </div>

            {/* Premium Features Bento Box */}
            <div className="pt-20 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-left max-w-5xl mx-auto">
              {[
                { icon: CheckCircle2, bg: 'bg-gradient-to-br from-emerald-500/20 to-emerald-900/40', border: 'border-emerald-500/30', color: 'text-emerald-400', title: 'BIB Verifikasi', desc: 'Sistem anti duplikasi canggih' },
                { icon: Zap, bg: 'bg-gradient-to-br from-yellow-500/20 to-yellow-900/40', border: 'border-yellow-500/30', color: 'text-yellow-400', title: 'QR Check-In', desc: 'Scan instan Race Pack' },
                { icon: ShieldCheck, bg: 'bg-gradient-to-br from-blue-500/20 to-blue-900/40', border: 'border-blue-500/30', color: 'text-blue-400', title: 'Akses Aman', desc: 'Privasi data level bank' },
                { icon: Award, bg: 'bg-gradient-to-br from-pink-500/20 to-pink-900/40', border: 'border-pink-500/30', color: 'text-pink-400', title: 'E-Certificate', desc: 'Sertifikat digital terverifikasi' },
              ].map((feat, idx) => (
                <div key={idx} className={`p-6 rounded-3xl backdrop-blur-lg border ${feat.bg} ${feat.border} hover:border-white/50 hover:bg-white/10 transition-all duration-300 group`}>
                  <feat.icon className={`w-8 h-8 ${feat.color} mb-4 group-hover:scale-110 transition-transform`} />
                  <h4 className="text-sm font-black text-white uppercase tracking-wider mb-2">{feat.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{feat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="relative -mt-16 mb-20 z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-dark rounded-3xl p-8 md:p-10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] border-t border-white/10 bg-[#0a0f25]/80 backdrop-blur-2xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 divide-y md:divide-y-0 md:divide-x divide-white/10 text-center">
              {[
                { value: '500+', label: 'Event Sukses', icon: Trophy, color: 'text-blue-400' },
                { value: '50.000+', label: 'Peserta Aktif', icon: Users, color: 'text-yellow-400' },
                { value: '100+', label: 'Kota Jangkauan', icon: MapPin, color: 'text-emerald-400' },
              ].map((stat, idx) => (
                <div key={idx} className="space-y-3 pt-6 md:pt-0 first:pt-0 flex flex-col items-center">
                  <div className={`p-3 rounded-2xl bg-white/5 border border-white/10 ${stat.color} shadow-[0_0_15px_rgba(255,255,255,0.05)]`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div className="text-4xl md:text-5xl font-black text-white tracking-tighter">{stat.value}</div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED EVENTS */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest mb-3">
                <Star className="w-3 h-3" />
                <span>Guwigo</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-slate-900 dark:text-white uppercase tracking-tight">
                Event <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-yellow-400">Mendatang</span>
              </h2>
            </div>
            <Link
              to="/events"
              className="inline-flex items-center gap-2 text-xs font-bold text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 uppercase tracking-wider transition-colors group"
            >
              <span>Lihat Semua Event ({events.length})</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-white/60 dark:bg-blue-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl h-[380px] animate-pulse overflow-hidden">
                  <div className="h-48 bg-slate-200 dark:bg-slate-800/50" />
                  <div className="p-6 space-y-4">
                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-full w-2/3" />
                    <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-full w-3/4" />
                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-full w-full" />
                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-full w-1/2" />
                    <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-between">
                      <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-full w-1/3" />
                      <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-xl w-24" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="p-16 text-center bg-white/40 dark:bg-blue-950/40 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-lg mx-auto backdrop-blur-sm">
              <Calendar className="w-12 h-12 text-slate-600 dark:text-slate-500 dark:text-slate-400 dark:text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Belum ada event tersedia.</h3>
              <p className="text-xs text-slate-500 mt-2">Jadwal event olahraga terbaru akan segera diperbarui di RacePro.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredEvents.map((event, idx) => (
                <Link
                  key={event.id}
                  to={`/events/${event.slug}`}
                  className="group relative rounded-3xl overflow-hidden bg-[#0a0f25] border border-white/10 hover:border-blue-500/50 shadow-lg hover:shadow-[0_0_40px_rgba(59,130,246,0.3)] transition-all duration-500 hover:-translate-y-2 flex flex-col"
                >
                  {/* Banner */}
                  <div className="relative h-60 overflow-hidden">
                    <img
                      src={event.banner || 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?auto=format&fit=crop&w=800&q=80'}
                      alt={event.name}
                      className="w-full h-full object-cover group-hover:scale-110 group-hover:rotate-1 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f25] via-[#0a0f25]/40 to-transparent" />
                    <div className="absolute top-5 left-5">
                      <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-xl backdrop-blur-md shadow-xl border border-white/20 ${
                        event.status === 'REGISTRATION_OPEN' 
                          ? 'bg-blue-600/90 text-white' 
                          : 'bg-slate-800/90 text-slate-300'
                      }`}>
                        {event.status === 'REGISTRATION_OPEN' ? 'Pendaftaran Buka' : event.status}
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-6 flex-1 flex flex-col justify-between relative z-10 -mt-6">
                    <div className="space-y-3">
                      <div className="inline-flex items-center gap-2 text-[11px] font-bold text-yellow-400 bg-yellow-400/10 px-3 py-1.5 rounded-lg border border-yellow-400/20">
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="truncate">{event.location}</span>
                      </div>
                      <h3 className="text-xl font-black text-white group-hover:text-blue-400 transition-colors line-clamp-2 leading-tight">
                        {event.name}
                      </h3>
                      <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">
                        {event.description}
                      </p>
                    </div>

                    <div className="pt-6 mt-6 border-t border-white/10 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Tanggal Event</span>
                        <span className="flex items-center gap-2 text-sm text-white font-bold">
                          <Calendar className="w-4 h-4 text-blue-400" />
                          {new Date(event.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-blue-500 group-hover:border-blue-400 group-hover:text-white text-slate-400 transition-all">
                        <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* SPONSOR MARQUEE */}
      {sponsors.length > 0 && (
        <section className="py-24 border-y border-white/5 bg-[#050b1a] overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-black uppercase tracking-[0.2em] mb-4">
              <Star className="w-4 h-4 animate-pulse" />
              <span>Mitra & Sponsor RacePro</span>
            </div>
            <h3 className="text-2xl font-black text-white uppercase tracking-widest">
              Dipercaya Oleh <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-yellow-400">Partner Terbaik</span>
            </h3>
          </div>
          
          <div className="relative w-full flex overflow-x-hidden group">
            {/* Left and Right fades */}
            <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#050b1a] to-transparent z-10" />
            <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#050b1a] to-transparent z-10" />
            
            <div className="animate-marquee flex whitespace-nowrap gap-8 py-4 items-center pl-8">
              {/* Duplicate array 3 times for smooth infinite scroll */}
              {[...sponsors, ...sponsors, ...sponsors].map((sp, i) => (
                <div key={`${sp.id}-${i}`} className="flex-shrink-0 flex items-center gap-4 bg-white/5 backdrop-blur-xl px-8 py-5 rounded-2xl border border-white/10 hover:border-blue-500/40 hover:bg-white/10 transition-colors shadow-lg">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-yellow-500/20 border border-white/10 flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-blue-400" />
                  </div>
                  <span className="text-sm font-black text-white uppercase tracking-widest">{sp.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* BOTTOM CTA */}
      <section className="py-32 relative overflow-hidden bg-[#020617]">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1571008840902-27b2fa1eb13c?auto=format&fit=crop&w=1920&q=80" 
            alt="Finish Line" 
            className="w-full h-full object-cover opacity-10 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#050b1a] via-[#020617]/90 to-[#020617]" />
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-blue-600/20 blur-[200px] rounded-full pointer-events-none z-0" />
        
        <div className="relative z-10 max-w-4xl mx-auto text-center px-4 space-y-10">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-black uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(59,130,246,0.2)]">
            <Zap className="w-4 h-4 animate-pulse" />
            <span>Siap Menembus Batas?</span>
          </div>
          <h2 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-[1.1]">
            Daftar Event<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-yellow-400 drop-shadow-[0_0_30px_rgba(59,130,246,0.3)]">Sekarang</span>
          </h2>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto leading-relaxed font-light">
            Buat akun peserta sekarang untuk kemudahan pendaftaran event, verifikasi QR Code Race Pack, dan klaim sertifikat finisher resmi — semua dalam satu platform RacePro.
          </p>
          <div className="pt-6 flex flex-col sm:flex-row justify-center gap-6">
            <Link
              to="/register"
              className="group px-10 py-5 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-black text-sm uppercase tracking-widest shadow-[0_0_40px_rgba(59,130,246,0.4)] transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3 border border-blue-400/50"
            >
              <Zap className="w-5 h-5" />
              <span>Daftar Akun Peserta</span>
            </Link>
            <Link
              to="/host-event"
              className="px-10 py-5 rounded-2xl bg-white/5 backdrop-blur-md hover:bg-white/10 text-white font-black text-sm uppercase tracking-widest shadow-lg shadow-black/30 transition-all transform hover:-translate-y-1 border border-white/20 hover:border-white/40 flex items-center justify-center gap-3"
            >
              <Trophy className="w-5 h-5 text-yellow-400" />
              <span>Buat Event Sendiri</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
