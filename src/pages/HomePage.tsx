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
  Sparkles, 
  Award, 
  CheckCircle2, 
  Zap,
  ArrowRight,
  Users,
  TrendingUp,
  Star
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
      <section className="relative pt-16 pb-28 md:pt-24 md:pb-36 overflow-hidden">
        {/* Animated gradient blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-blue-600/20 blur-[150px] rounded-full animate-pulse" />
          <div className="absolute top-1/3 right-0 w-[400px] h-[400px] bg-yellow-500/15 blur-[130px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute -bottom-20 left-1/3 w-[350px] h-[350px] bg-blue-600/10 blur-[140px] rounded-full animate-pulse" style={{ animationDelay: '4s' }} />
        </div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(249,115,22,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(249,115,22,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto space-y-8">

            {/* Brand badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/80 dark:bg-blue-950/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 text-blue-500 dark:text-blue-400 text-xs font-bold uppercase tracking-[0.2em] shadow-xl shadow-blue-500/5 dark:shadow-blue-500/10">
              <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
              <span>RACEPRO — Platform Tiket Event Olahraga Premium</span>
            </div>

            {/* Main headline */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.05]">
              TEMUKAN EVENT<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-blue-600 to-yellow-500 dark:from-blue-400 dark:via-yellow-400 dark:to-blue-400">
                OLAHRAGA TERBAIKMU
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-slate-600 dark:text-slate-500 dark:text-slate-400 text-base sm:text-lg md:text-xl leading-relaxed max-w-2xl mx-auto font-normal">
              RacePro menghubungkan kamu dengan ribuan event olahraga terbaik di Indonesia.
              Dari lari marathon hingga trail run — satu platform, semua event.
            </p>

            {/* Hero CTAs */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/events"
                className="w-full sm:w-auto group px-8 py-4 rounded-xl bg-gradient-to-r from-blue-500 via-blue-500 to-yellow-500 hover:from-blue-400 hover:to-yellow-400 text-white font-black text-xs uppercase tracking-wider shadow-xl shadow-blue-500/25 transition-all transform hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-blue-500/30 flex items-center justify-center gap-2"
              >
                <span>Jelajahi Event</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white/80 dark:bg-blue-950/80 backdrop-blur-sm hover:bg-slate-50 dark:hover:bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs uppercase tracking-wider transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                <Users className="w-4 h-4 text-blue-400" />
                <span>Daftar Sebagai Peserta</span>
              </Link>
              <Link
                to="/host-event"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white dark:bg-blue-950/60 backdrop-blur-sm hover:bg-slate-100 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-800/60 text-slate-600 dark:text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
              >
                <Trophy className="w-4 h-4 text-yellow-400" />
                <span>Selenggarakan Event</span>
              </Link>
            </div>

            {/* Feature highlights */}
            <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-4 text-left max-w-4xl mx-auto">
              {[
                { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', title: 'BIB System Terverifikasi', desc: 'Verifikasi otomatis tanpa duplikasi' },
                { icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20', title: 'QR Check-In Instan', desc: 'Pengambilan Race Pack cepat' },
                { icon: ShieldCheck, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', title: 'Akses Peserta Aman', desc: 'Privasi data medis & pribadi terjaga' },
                { icon: Award, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', title: 'Sertifikat Digital', desc: 'E-Certificate resmi hasil lomba' },
              ].map((feat, idx) => (
                <div key={idx} className={`p-4 rounded-xl bg-white dark:bg-blue-950/60 backdrop-blur-sm border ${feat.bg} hover:border-slate-300 dark:border-slate-700 transition-colors group`}>
                  <feat.icon className={`w-5 h-5 ${feat.color} mb-2`} />
                  <h4 className="text-xs font-bold text-white uppercase group-hover:text-blue-400 transition-colors">{feat.title}</h4>
                  <p className="text-[11px] text-slate-500">{feat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="relative -mt-8 mb-8 z-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-900 border border-slate-300 dark:border-slate-800 rounded-2xl p-6 md:p-8 backdrop-blur-xl shadow-2xl shadow-black/40">
            <div className="grid grid-cols-3 gap-6 text-center">
              {[
                { value: '500+', label: 'Event', icon: Trophy, color: 'text-blue-400' },
                { value: '50.000+', label: 'Peserta', icon: Users, color: 'text-yellow-400' },
                { value: '100+', label: 'Kota', icon: MapPin, color: 'text-emerald-400' },
              ].map((stat, idx) => (
                <div key={idx} className="space-y-1">
                  <stat.icon className={`w-5 h-5 ${stat.color} mx-auto`} />
                  <div className="text-2xl md:text-3xl font-black text-white">{stat.value}</div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</div>
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
                <Sparkles className="w-3 h-3" />
                <span>RacePro</span>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredEvents.map((event, idx) => (
                <Link
                  key={event.id}
                  to={`/events/${event.slug}`}
                  className={`group glass-card-interactive overflow-hidden flex flex-col animate-fade-in-up stagger-${(idx % 8) + 1}`}
                >
                  {/* Banner */}
                  <div className="relative h-52  overflow-hidden">
                    <img
                      src={event.banner || 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?auto=format&fit=crop&w=800&q=80'}
                      alt={event.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-50 dark:from-[#020617] via-slate-50/40 dark:via-[#020617]/40 to-transparent" />
                    <div className="absolute top-4 left-4">
                      <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-md backdrop-blur-md shadow-lg ${
                        event.status === 'REGISTRATION_OPEN' 
                          ? 'bg-blue-500/90 text-white' 
                          : 'bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-600 dark:text-slate-300'
                      }`}>
                        {event.status === 'REGISTRATION_OPEN' ? 'Pendaftaran Buka' : event.status}
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-500 dark:text-slate-400 mb-2">
                        <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
                        <span className="truncate">{event.location}</span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                        {event.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                        {event.description}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-500 dark:text-slate-400 font-medium">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(event.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-400 uppercase tracking-wider group-hover:gap-2 transition-all">
                        <span>Detail</span>
                        <ChevronRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* SPONSOR TIERS */}
      {sponsors.length > 0 && (
        <section className="py-16 border-t border-slate-300 dark:border-slate-800/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-[10px] font-black uppercase tracking-widest mb-6">
              <Star className="w-3 h-3" />
              <span>Mitra & Sponsor RacePro</span>
            </div>
            <h3 className="text-xl font-black text-white uppercase mb-10">
              Dipercaya Oleh <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-yellow-400">Partner Terbaik</span>
            </h3>
            <div className="flex flex-wrap items-center justify-center gap-4">
              {sponsors.map(sp => (
                <div key={sp.id} className="flex items-center gap-3 bg-white dark:bg-blue-950/60 backdrop-blur-sm px-6 py-3 rounded-xl border border-slate-300 dark:border-slate-800 hover:border-blue-500/30 transition-all hover:scale-105">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-yellow-500/20 border border-blue-500/20 flex items-center justify-center">
                    <Trophy className="w-4 h-4 text-blue-400" />
                  </div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-600 dark:text-slate-300 uppercase">{sp.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* BOTTOM CTA */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-[#020617] to-slate-950" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-500/10 blur-[150px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 max-w-4xl mx-auto text-center px-4 space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest">
            <Zap className="w-3.5 h-3.5" />
            <span>Siap Berlaga?</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-tight">
            Daftar Event<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-yellow-400">Sekarang</span>
          </h2>
          <p className="text-slate-600 dark:text-slate-500 dark:text-slate-400 text-sm max-w-xl mx-auto leading-relaxed">
            Daftar akun peserta sekarang untuk kemudahan pendaftaran event, verifikasi QR Code Race Pack, dan klaim sertifikat finisher resmi — semua dalam satu platform RacePro.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/register"
              className="group px-8 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-yellow-500 hover:from-blue-400 hover:to-yellow-400 text-white font-black text-xs uppercase tracking-wider shadow-xl shadow-blue-500/25 transition-all transform hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-blue-500/30 flex items-center justify-center gap-2"
            >
              <span>Daftar Akun Peserta</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <a
              href="https://racepro.com"
              target="_blank"
              rel="noreferrer"
              className="px-8 py-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:bg-slate-700 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-black/30 transition-all transform hover:-translate-y-0.5 border border-slate-300 dark:border-slate-700 hover:border-slate-600"
            >
              Buat Event Sendiri
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
