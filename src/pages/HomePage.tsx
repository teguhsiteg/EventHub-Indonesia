import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getPublicEvents } from '../services/eventService';
import { getSponsors } from '../services/settingsService';
import { EventItem, Sponsor } from '../types';
import { 
  Calendar, 
  MapPin, 
  ChevronRight, 
  ArrowRight, 
  Sparkles,
  Search,
  Trophy,
  Users,
  ShieldCheck,
  Zap,
  Activity,
  CheckCircle2,
  Clock,
  ArrowUpRight
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'MARATHON' | 'TRAIL' | 'CYCLING' | 'TRIATHLON'>('ALL');
  const [searchKeyword, setSearchKeyword] = useState('');

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

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchKeyword.trim()) {
      navigate(`/events?q=${encodeURIComponent(searchKeyword.trim())}`);
    } else {
      navigate('/events');
    }
  };

  // Filter events based on active tab
  const filteredEvents = events.filter(e => {
    if (activeTab === 'ALL') return true;
    const cat = (e.category || '').toUpperCase();
    if (activeTab === 'MARATHON') return cat.includes('RUN') || cat.includes('MARATHON');
    if (activeTab === 'TRAIL') return cat.includes('TRAIL') || cat.includes('ULTRA');
    if (activeTab === 'CYCLING') return cat.includes('CYCLE') || cat.includes('BIKE') || cat.includes('SEPEDA');
    if (activeTab === 'TRIATHLON') return cat.includes('TRIATHLON') || cat.includes('DUATHLON');
    return true;
  });

  const featuredSpotlight = events[0] || null;
  const popularEvents = filteredEvents.slice(0, 6);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans antialiased">

      {/* ========================================================
          HERO SECTION — Enterprise Split Layout (Style DOKU, No Navbar)
          ======================================================== */}
      <section className="relative pt-12 pb-20 md:pt-16 md:pb-28 overflow-hidden bg-gradient-to-b from-slate-50/70 via-white to-white dark:from-[#0b0f19] dark:via-[#090d16] dark:to-[#090d16] border-b border-slate-100 dark:border-slate-800">
        <div className="absolute inset-0 doku-grid-bg opacity-70 pointer-events-none" />
        
        {/* Soft radial ambient glow */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-red-500/10 dark:bg-red-600/10 blur-[130px] rounded-full pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Brand Header Bar */}
          <div className="flex items-center justify-between pb-8 mb-8 border-b border-slate-200/60 dark:border-slate-800">
            <Link to="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="Guwigo Events" className="h-12 sm:h-14 w-auto object-contain transition-transform hover:scale-105" />
            </Link>
            <div className="flex items-center gap-2 sm:gap-3">
              <Link 
                to="/check-ticket" 
                className="btn-brand-primary !py-1.5 sm:!py-2 !px-3 sm:!px-4 text-[11px] sm:text-xs font-bold shadow-xs"
              >
                <span className="sm:hidden">Cek Tiket</span>
                <span className="hidden sm:inline">Cek E-Tiket Saya</span>
              </Link>
              <Link 
                to="/events" 
                className="btn-brand-secondary !py-1.5 sm:!py-2 !px-3 sm:!px-4 text-[11px] sm:text-xs font-bold"
              >
                <span className="sm:hidden">Lihat Event</span>
                <span className="hidden sm:inline">Lihat Event</span>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Value Proposition & Search */}
            <div className="lg:col-span-7 space-y-6 text-left">
              
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 dark:bg-red-950/40 border border-red-200/80 dark:border-red-800/60 shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-[#e50a38] dark:text-[#ff2b58] stroke-[2]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#e50a38] dark:text-[#ff476f]">
                  Official Sports Registration Platform
                </span>
              </div>

              <h1 className="text-hero text-slate-900 dark:text-white">
                Satu Platform untuk <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e50a38] via-rose-600 to-amber-500">
                  Semua Rekor Larimu.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed">
                Temukan dan ikuti race marathon, trail run, dan ajang olahraga bergengsi di Indonesia. Registrasi instan, pembayaran terverifikasi aman, dan sertifikat resmi.
              </p>

              {/* Integrated Hero Search Form (DOKU Style Enterprise Input) */}
              <form onSubmit={handleHeroSearch} className="max-w-xl">
                <div className="relative flex flex-col sm:flex-row items-center gap-2 p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-200/40 dark:shadow-none">
                  <div className="relative w-full flex items-center pl-3">
                    <Search className="w-5 h-5 text-slate-400 shrink-0" />
                    <input 
                      type="text"
                      placeholder="Cari event, kota (cth: Jakarta, Bali)..."
                      value={searchKeyword}
                      onChange={(e) => setSearchKeyword(e.target.value)}
                      className="w-full pl-3 pr-4 py-3 bg-transparent text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
                    />
                  </div>
                  <button 
                    type="submit"
                    className="btn-brand-primary w-full sm:w-auto shrink-0 !py-3 !px-6 text-sm"
                  >
                    <span>Cari Event</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>

              {/* Quick Guest Ticket Access (TIAS Zero-Friction) */}
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <span>Sudah mendaftar sebelumnya?</span>
                <Link to="/check-ticket" className="text-[#e50a38] font-bold hover:underline inline-flex items-center gap-1">
                  Cek & Unduh E-Tiket Saya <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {/* Trust Metrics Pill Counters */}
              <div className="pt-4 flex flex-wrap items-center gap-6 sm:gap-8 border-t border-slate-200/70 dark:border-slate-800 text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span><strong>100%</strong> Pembayaran Resmi</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Sertifikat & Timing Valid</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#e50a38]" />
                  <span>10,000+ Pelari Aktif</span>
                </div>
              </div>

            </div>

            {/* Right Column: Hero Spotlight Interactive Card (DOKU Style) */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                
                {/* Decorative floating badge */}
                <div className="absolute -top-4 -right-4 z-20 bg-white dark:bg-slate-800 px-4 py-2 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-white animate-bounce">
                  <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span>Registrasi Cepat 1 Menit</span>
                </div>

                {/* Spotlight Card */}
                {featuredSpotlight ? (
                  <div className="enterprise-card overflow-hidden group bg-white dark:bg-[#0f172a]">
                    <div className="relative h-64 overflow-hidden bg-slate-900">
                      <img 
                        src={featuredSpotlight.banner || 'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=800&q=80'}
                        alt={featuredSpotlight.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                      
                      <div className="absolute top-4 left-4">
                        <span className="badge-brand">
                          Event Terpilih
                        </span>
                      </div>

                      <div className="absolute bottom-4 left-4 right-4 text-white">
                        <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium mb-1">
                          <MapPin className="w-3.5 h-3.5 text-[#ff2b58]" />
                          <span>{featuredSpotlight.location}</span>
                        </div>
                        <h3 className="text-xl font-bold leading-snug drop-shadow-md line-clamp-1">
                          {featuredSpotlight.name}
                        </h3>
                      </div>
                    </div>

                    <div className="p-5 space-y-4">
                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1.5 font-semibold">
                          <Calendar className="w-4 h-4 text-[#e50a38]" />
                          {new Date(featuredSpotlight.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                        <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-bold">
                          Slot Tersedia
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                        {featuredSpotlight.description || 'Ambil bagian dalam gelaran olahraga paling bergengsi musim ini. Kuota terbatas.'}
                      </p>

                      <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                        <div>
                          <p className="text-[10px] uppercase font-bold text-slate-400">Kategori</p>
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {featuredSpotlight.category || 'Marathon'}
                          </p>
                        </div>
                        <Link 
                          to={`/events/${featuredSpotlight.slug}`}
                          className="btn-brand-primary !py-2 !px-4 text-xs font-bold"
                        >
                          <span>Daftar Sekarang</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="enterprise-card p-8 text-center bg-white dark:bg-[#0f172a]">
                    <Activity className="w-12 h-12 text-[#e50a38] mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Siap Berlari?</h3>
                    <p className="text-xs text-slate-500 mt-2 mb-4">Ribuan slot race menantimu untuk tahun 2026.</p>
                    <Link to="/events" className="btn-brand-primary text-xs">Jelajahi Event</Link>
                  </div>
                )}

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================
          ENTERPRISE CATEGORY TAB SWITCHER (Style DOKU)
          ======================================================== */}
      <section className="py-14 bg-white dark:bg-[#090d16] border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#e50a38]">Katalog Pilihan</span>
              <h2 className="text-title text-slate-900 dark:text-white mt-1">
                Eksplor Berdasarkan Kategori
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Pilih jenis lomba yang sesuai dengan target dan keahlianmu.
              </p>
            </div>

            {/* Category Tabs */}
            <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
              {[
                { id: 'ALL', label: 'Semua Event' },
                { id: 'MARATHON', label: 'Road Running' },
                { id: 'TRAIL', label: 'Trail & Ultra' },
                { id: 'CYCLING', label: 'Cycling' },
                { id: 'TRIATHLON', label: 'Triathlon' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeTab === tab.id
                      ? 'bg-white dark:bg-slate-800 text-[#e50a38] dark:text-[#ff476f] shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Events Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="enterprise-card h-80 animate-pulse bg-slate-100 dark:bg-slate-900" />
              ))}
            </div>
          ) : popularEvents.length === 0 ? (
            <div className="enterprise-card p-12 text-center max-w-lg mx-auto">
              <Calendar className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Belum Ada Event di Kategori Ini</h3>
              <p className="text-xs text-slate-500 mt-1 mb-4">Event baru akan segera diumumkan oleh para organizer mitra kami.</p>
              <button onClick={() => setActiveTab('ALL')} className="btn-brand-secondary text-xs">
                Tampilkan Semua Kategori
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularEvents.map(event => (
                <Link
                  key={event.id}
                  to={`/events/${event.slug}`}
                  className="enterprise-card group flex flex-col justify-between overflow-hidden"
                >
                  {/* Image Cover */}
                  <div className="relative h-48 overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img 
                      src={event.banner || 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?auto=format&fit=crop&w=600&q=80'} 
                      alt={event.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="badge-brand">
                        {event.category || 'Road'}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3 bg-white/95 dark:bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-slate-700 dark:text-slate-300 border border-slate-200/50">
                      {event.status === 'REGISTRATION_OPEN' ? '🟢 Open' : 'Tutup'}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mb-2">
                        <MapPin className="w-3.5 h-3.5 text-[#e50a38] shrink-0" />
                        <span className="truncate">{event.location}</span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-[#e50a38] transition-colors line-clamp-2 leading-snug">
                        {event.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                        {event.description}
                      </p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Jadwal</span>
                        <p className="font-bold text-slate-800 dark:text-slate-200">
                          {new Date(event.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                      <span className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 group-hover:bg-[#e50a38] group-hover:text-white transition-all shadow-xs">
                        <ChevronRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-12 text-center">
            <Link to="/events" className="btn-brand-primary">
              <span>Lihat Semua Jadwal Event ({events.length})</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </section>

      {/* ========================================================
          ENTERPRISE ORGANIZER CTA (DOKU Style Business Solutions)
          ======================================================== */}
      <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-radial from-red-600/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            <div className="lg:col-span-7 space-y-4">
              <span className="text-xs font-bold uppercase tracking-widest text-[#ff2b58]">Solusi Penyelenggara Event</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Kelola Pendaftaran, Tiket, & Race Pack dalam Satu Dashboard.
              </h2>
              <p className="text-sm sm:text-base text-slate-400 max-w-xl leading-relaxed">
                Apakah Anda komunitas lari, EO, atau sponsor? Gunakan infrastruktur registrasi Guwigo Events untuk mempermudah alur verifikasi data dan pembayaran peserta Anda.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-300">Auto Generate QR E-Tiket & BIB</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-300">Scanner Check-In RPC Terintegrasi</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-300">Payout Otomatis & Laporan Realtime</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-300">Keamanan Data Standar ISO</span>
                </div>
              </div>

              <div className="pt-6 flex flex-wrap gap-4">
                <Link to="/host-event" className="btn-brand-primary !bg-[#ff2b58] hover:!bg-[#e50a38]">
                  <span>Buka Pendaftaran Event Baru</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/contact" className="btn-brand-secondary !text-white !border-slate-700 hover:!bg-slate-800">
                  Konsultasi Gratis
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="p-6 rounded-3xl bg-slate-800/80 border border-slate-700/80 shadow-2xl space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-slate-700">
                  <span className="text-xs font-bold text-slate-400 uppercase">Live Race Control Preview</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">Online</span>
                </div>
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/50 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] text-slate-400">Total Tiket Terjual</p>
                      <p className="text-lg font-bold text-white">4,850 / 5,000</p>
                    </div>
                    <span className="text-xs font-bold text-emerald-400">97% Sold</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/50 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] text-slate-400">Peserta Check-In RPC</p>
                      <p className="text-lg font-bold text-white">4,710</p>
                    </div>
                    <span className="text-xs font-bold text-sky-400">QR Valid</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================
          SPONSORS & PARTNERS (DOKU Style Clean Ticker)
          ======================================================== */}
      {sponsors.length > 0 && (
        <section className="py-14 bg-white dark:bg-[#090d16] border-t border-slate-100 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-8">
              Dipercaya Oleh Komunitas, Brand, & Penyelenggara Resmi
            </p>
            <div className="flex flex-wrap justify-center items-center gap-10 md:gap-16 opacity-60 hover:opacity-100 transition-opacity grayscale hover:grayscale-0">
              {sponsors.map(sp => (
                <div key={sp.id} className="h-9">
                  {sp.logoUrl ? (
                    <img src={sp.logoUrl} alt={sp.name} className="h-full object-contain" />
                  ) : (
                    <span className="font-bold text-slate-600 dark:text-slate-300">{sp.name}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

    </div>
  );
};
