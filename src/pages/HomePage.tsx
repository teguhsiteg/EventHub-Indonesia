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
  Users
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-orange-500 selection:text-slate-900 dark:text-white">
      
      {/* Hero Section */}
      <section className="relative pt-12 pb-24 md:pt-20 md:pb-32 overflow-hidden border-b border-slate-900">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-orange-600/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-amber-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            
            {/* Ecosystem Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-orange-400 text-xs font-bold uppercase tracking-wider shadow-xl">
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>GUWIGO EVENTS — Official Event Platform by PT Guwigo Teknologi Indonesia</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tight uppercase leading-[1.05]">
              YOUR NEXT EVENT <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-400 to-amber-200">
                STARTS HERE.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg md:text-xl leading-relaxed max-w-2xl mx-auto font-normal">
              Temukan, daftar, dan kelola pengalaman event olahraga Anda bersama Guwigo Events.
            </p>

            {/* Hero CTAs */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/events"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-orange-600 via-amber-500 to-amber-400 hover:from-orange-500 hover:to-amber-300 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-orange-600/25 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                <span>Jelajahi Event</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
              >
                <Users className="w-4 h-4 text-orange-400" />
                <span>Daftar Sebagai Peserta</span>
              </Link>
              <Link
                to="/about"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white dark:bg-slate-900/60 hover:bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
              >
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>Selenggarakan Event</span>
              </Link>
            </div>

            {/* Feature Highlights Bar */}
            <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-4 text-left max-w-4xl mx-auto">
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 mb-2" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase">BIB System Server-Side</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Verifikasi otomatis tanpa duplikasi</p>
              </div>
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80">
                <Zap className="w-5 h-5 text-amber-400 mb-2" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase">QR Check-In</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Pengambilan Race Pack instan</p>
              </div>
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80">
                <ShieldCheck className="w-5 h-5 text-blue-400 mb-2" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase">Akses Peserta Aman</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Privasi data medis & pribadi terjaga</p>
              </div>
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80">
                <Award className="w-5 h-5 text-orange-400 mb-2" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase">Sertifikat Digital</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">E-Certificate resmi hasil lomba</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Upcoming Events Section */}
      <section className="py-20 bg-slate-50 dark:bg-slate-950 border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-extrabold text-orange-500 uppercase tracking-widest block mb-1">GUWIGO EVENTS</span>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Event Mendatang</h2>
            </div>
            <Link
              to="/events"
              className="inline-flex items-center gap-2 text-xs font-bold text-orange-400 hover:text-orange-300 uppercase tracking-wider"
            >
              <span>Lihat Semua Event ({events.length})</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl h-96 animate-pulse border border-slate-200 dark:border-slate-800" />
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-lg mx-auto">
              <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Belum ada event yang tersedia.</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Jadwal event olahraga terbaru dari penyelenggara akan segera diperbarui di Firestore.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:border-slate-700 rounded-2xl overflow-hidden shadow-xl transition-all duration-300 flex flex-col group hover:-translate-y-1"
                >
                  {/* Banner image */}
                  <div className="relative h-52 bg-slate-50 dark:bg-slate-950 overflow-hidden">
                    <img
                      src={event.banner || 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?auto=format&fit=crop&w=800&q=80'}
                      alt={event.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                    <div className="absolute top-4 left-4 bg-orange-600/90 backdrop-blur-md text-white text-[10px] font-black uppercase px-3 py-1.5 rounded-md shadow-md tracking-wider">
                      {event.status === 'REGISTRATION_OPEN' ? 'PENDAFTARAN DIBUKA' : event.status}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
                        <MapPin className="w-4 h-4 text-orange-400 shrink-0" />
                        <span>{event.location}</span>
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-orange-400 transition-colors line-clamp-2">
                        {event.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                        {event.description}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80 space-y-3">
                      <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                        <span className="flex items-center gap-1.5 font-medium">
                          <Calendar className="w-4 h-4 text-slate-500" />
                          {new Date(event.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        <span className="font-extrabold text-amber-400">
                          {event.status === 'REGISTRATION_OPEN' ? 'Pendaftaran Buka' : 'Status: ' + event.status}
                        </span>
                      </div>

                      <Link
                        to={`/events/${event.slug}`}
                        className="w-full py-3 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-orange-600 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                      >
                        <span>Detail & Pendaftaran</span>
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </section>

      {/* Sponsors Section */}
      {sponsors.length > 0 && (
        <section className="py-16 bg-slate-50 dark:bg-slate-950 border-b border-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-widest block mb-8">MITRA & SPONSOR EVENT</span>
            <div className="flex flex-wrap items-center justify-center gap-8">
              {sponsors.map(sp => (
                <div key={sp.id} className="flex items-center gap-3 bg-white dark:bg-slate-900/60 px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase">{sp.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Bottom CTA */}
      <section className="py-20 bg-gradient-to-b from-slate-950 to-slate-900">
        <div className="max-w-4xl mx-auto text-center px-4 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
            Guwigo Events Platform
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xl mx-auto">
            Daftar akun peserta sekarang untuk kemudahan pendaftaran event, verifikasi QR Code Race Pack, dan klaim sertifikat finisher resmi.
          </p>
          <div className="pt-2 flex justify-center gap-4">
            <Link
              to="/register"
              className="px-8 py-4 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-orange-600/30"
            >
              Daftar Akun Peserta
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};
