/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { motion } from 'motion/react';
import { 
  ArrowRight, Calendar, MapPin, Users, Award, 
  Sparkles, CheckCircle, ShieldCheck, Trophy,
  ChevronDown, HelpCircle
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (view: 'landing' | 'marketplace' | 'detail' | 'checkout' | 'dashboard', extraEventId?: string) => void;
}

const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&q=80&w=1600', // Marathon runner
  'https://images.unsplash.com/photo-1541614101331-1a5a3a194e92?auto=format&fit=crop&q=80&w=1600', // Cycling road climb
  'https://images.unsplash.com/photo-1530541930197-ff16ac917b0e?auto=format&fit=crop&q=80&w=1600', // Triathlon transition
];

interface FAQItem {
  question: string;
  answer: string;
  category: 'Participant' | 'Organizer';
}

const FAQ_DATA: FAQItem[] = [
  {
    category: 'Participant',
    question: 'How do I register and pay for an event on EventHubID?',
    answer: 'Simply browse our Event Marketplace, select your desired sports tournament or race, choose your category (e.g., Full Marathon, 10K, Elite Cycling), and complete our secure multi-step registration wizard. We support major local payment methods with instant automated booking confirmation.'
  },
  {
    category: 'Participant',
    question: 'How do I retrieve my BIB number and race pack?',
    answer: 'Once your registration payment is completed, a personal automated BIB identifier is instantly generated. You can retrieve your secure Ticket QR key at any time from your Participant Dashboard. Present this QR code to the on-site event crew during race pack collections.'
  },
  {
    category: 'Participant',
    question: 'Can I cancel my ticket or modify my participant details?',
    answer: 'Modification and refund regulations are defined by each individual event organizer. Because participant data is immediately synchronized with local safety databases, category changes are highly restricted. We advise consulting the organizer details listed on the Event Detail page.'
  },
  {
    category: 'Organizer',
    question: 'How do I host and publish my event on the archipelago map tracker?',
    answer: 'Switch your portal role to "Organizer" in the top header. In your Organizer Dashboard, click "Create Event" to describe your event, input its precise coordinate decimal values, upload banners, select pricing tiers with custom participant limits, and specify race regulations.'
  },
  {
    category: 'Organizer',
    question: 'How does the on-site race collection ticket scanner work?',
    answer: 'Organizers do not require external scanning devices. The Organizer Dashboard contains a web-based camera scanner. Just permit browser camera access on any phone or check-in tablet to instantly scan runner booking codes, logging check-ins in real-time.'
  },
  {
    category: 'Organizer',
    question: 'How do payouts and funds liquidation operate?',
    answer: 'All registration proceeds are handled through a secure Midtrans escrow infrastructure. Upon triumphant completion of the sporting event and basic system verifications, your total collected ticketing balance is liquidated and settled directly into the designated organization account.'
  }
];

const FAQ_DATA_ID: FAQItem[] = [
  {
    category: 'Participant',
    question: 'Bagaimana cara mendaftar dan membayar acara di EventHubID?',
    answer: 'Cukup telusuri Pasar Event kami, pilih turnamen atau perlombaan olahraga yang Anda inginkan, pilih kategori Anda (misalnya, Maraton Penuh, 10K, Balap Sepeda Elite), dan lengkapi pengisian formulir pendaftaran kami yang aman. Kami mendukung berbagai metode pembayaran lokal utama dengan konfirmasi pemesanan otomatis instan.'
  },
  {
    category: 'Participant',
    question: 'Bagaimana cara mendapatkan nomor BIB dan paket lomba (race pack) saya?',
    answer: 'Setelah pembayaran pendaftaran Anda selesai, nomor identifikasi BIB otomatis akan dibuat secara instan. Anda dapat mengunduh kode Tiket QR yang aman kapan saja dari Dasbor Peserta Anda. Tunjukkan kode QR ini kepada kru acara di lokasi saat pengambilan paket lomba.'
  },
  {
    category: 'Participant',
    question: 'Apakah saya bisa membatalkan tiket atau mengubah data peserta saya?',
    answer: 'Kebijakan pengubahan data dan pengembalian dana ditentukan oleh masing-masing penyelenggara acara. Karena data peserta disinkronkan langsung dengan database keselamatan penyelenggara lokal, perubahan kategori sangat dibatasi. Hubungi penyelenggara yang tertera di halaman detail event untuk info lebih lanjut.'
  },
  {
    category: 'Organizer',
    question: 'Bagaimana cara membuat dan mempublikasikan acara saya di peta interaktif?',
    answer: 'Beralihlah peran portal Anda ke "Penyelenggara" di bagian atas header. Di Dasbor Penyelenggara Anda, klik "Buat Event" untuk mendeskripsikan acara Anda, masukkan koordinat peta, unggah spanduk banner, pilih tingkat harga dengan batas peserta kustom, dan tentukan aturan perlombaan.'
  },
  {
    category: 'Organizer',
    question: 'Bagaimana cara kerja teknologi pemindai tiket di lokasi pengambilan paket lomba?',
    answer: 'Penyelenggara tidak memerlukan perangkat pemindai eksternal khusus. Dasbor Penyelenggara menyediakan fitur scanner berbasis web. Cukup izinkan akses kamera browser pada ponsel atau tablet check-in untuk memindai kode tiket QR pemesan, mencatat check-in secara real-time.'
  },
  {
    category: 'Organizer',
    question: 'Bagaimana cara penarikan dana dan pencairan saldo tiket yang terkumpul?',
    answer: 'Seluruh proses transaksi pendaftaran diproses melalui sistem escrow Midtrans yang aman. Setelah selesainya acara olahraga secara sukses dan verifikasi sistem dasar, penarikan total saldo tiket Anda dapat dicairkan langsung ke rekening organisasi yang didaftarkan.'
  }
];

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const { events, changeRole, language, t } = useApp();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // FAQ Accordion visibility state and category filter
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [faqCategory, setFaqCategory] = useState<'All' | 'Participant' | 'Organizer'>('All');

  const faqData = useMemo(() => {
    const savedEn = localStorage.getItem('eh_custom_faqs_en');
    const savedId = localStorage.getItem('eh_custom_faqs_id');
    if (language === 'id') {
      return savedId ? JSON.parse(savedId) : FAQ_DATA_ID;
    } else {
      return savedEn ? JSON.parse(savedEn) : FAQ_DATA;
    }
  }, [language]);

  const handleCategoryChange = (cat: 'All' | 'Participant' | 'Organizer') => {
    setFaqCategory(cat);
    setExpandedIndex(null);
  };

  const filteredFaqData = useMemo(() => {
    if (faqCategory === 'All') return faqData;
    return faqData.filter((item) => item.category === faqCategory);
  }, [faqCategory, faqData]);

  // Auto-rotate Hero covers
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex(prev => (prev + 1) % HERO_IMAGES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const featured = events.filter(e => e.isFeatured);

  // Animated tickers
  const [counters, setCounters] = useState({
    events: 0,
    participants: 0,
    organizers: 0,
    cities: 0
  });

  useEffect(() => {
    const duration = 2000;
    const steps = 50;
    const intervalTime = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      setCounters({
        events: Math.min(Math.floor((events.length * 3.5) * (step / steps)), 24),
        participants: Math.min(Math.floor(18500 * (step / steps)), 18450),
        organizers: Math.min(Math.floor(150 * (step / steps)), 142),
        cities: Math.min(Math.floor(40 * (step / steps)), 38)
      });

      if (step >= steps) {
        clearInterval(timer);
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [events.length]);

  return (
    <div className="flex flex-col bg-slate-50 min-h-screen">
      
      {/* Dynamic Immersive Hero Section - Fullscreen */}
      <section className="relative h-[85vh] w-full overflow-hidden" id="hero-slider">
        {/* Background images rotating with crossfades */}
        {HERO_IMAGES.map((img, idx) => (
          <div
            key={img}
            className={`absolute inset-0 h-full w-full bg-cover bg-center transition-all duration-[2000ms] ease-out ${
              idx === currentImageIndex ? 'scale-105 opacity-100' : 'scale-100 opacity-0'
            }`}
            style={{ backgroundImage: `url('${img}')` }}
          />
        ))}

        {/* Heavy Premium Dark overlay */}
        <div className="absolute inset-0 bg-linear-to-b from-slate-950/70 via-slate-900/60 to-slate-950/80 z-10" />

        {/* Hero content container */}
        <div className="absolute inset-0 z-20 flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl text-center">
            
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="inline-flex items-center space-x-2 rounded-full border border-cyan-400/40 bg-cyan-950/40 px-3.5 py-1.5 text-xs font-bold text-cyan-400 backdrop-blur-md mb-6"
            >
              <Sparkles className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
              <span className="font-sans uppercase tracking-widest text-[10px]">{t('hero_tag')}</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.15 }}
              className="font-sans text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight"
              id="hero-headline"
            >
              {t('hero_title_1')}<span className="bg-gradient-to-r from-cyan-400 to-cyan-200 bg-clip-text text-transparent">{t('hero_title_2')}</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.3 }}
              className="mx-auto mt-6 max-w-2xl font-sans text-sm sm:text-base text-slate-300 leading-relaxed"
              id="hero-subheadline"
            >
              {t('hero_desc')}
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.45 }}
              className="mt-10 flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0"
            >
              <button
                onClick={() => onNavigate('marketplace')}
                className="group flex w-full items-center justify-center space-x-2 rounded-2xl bg-cyan-500 hover:bg-cyan-400 px-8 py-4 font-sans text-sm font-extrabold text-slate-950 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer sm:w-auto"
                id="hero-cta-explore"
              >
                <span>{t('btn_register_explore')}</span>
                <ArrowRight className="h-4.5 w-4.5 transition-transform group-hover:translate-x-1" />
              </button>
              
              <button
                onClick={() => {
                  changeRole('organizer');
                  onNavigate('dashboard');
                }}
                className="flex w-full items-center justify-center space-x-2 rounded-2xl border border-white/20 bg-white/10 hover:bg-white/20 px-8 py-4 font-sans text-sm font-extrabold text-white backdrop-blur-md transition-all cursor-pointer sm:w-auto"
                id="hero-cta-organizer"
              >
                <span>{t('btn_host_event')}</span>
              </button>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Social Proof Stats Bar */}
      <section className="relative z-30 mx-auto -mt-16 w-full max-w-7xl px-4 sm:px-6 lg:px-8" id="social-proof-section">
        <div className="rounded-3xl border border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-900 p-6 shadow-xl shadow-slate-200/80 dark:shadow-slate-950/20 md:p-8">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            
            <div className="text-center">
              <p className="font-mono text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-4xl">
                {counters.events}+
              </p>
              <p className="mt-1 font-sans text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                {language === 'id' ? 'Event Aktif' : 'Active Events'}
              </p>
            </div>

            <div className="text-center border-l border-slate-100 dark:border-slate-800">
              <p className="font-mono text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-4xl">
                {counters.participants.toLocaleString('id-ID')}+
              </p>
              <p className="mt-1 font-sans text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                {language === 'id' ? 'Peserta Terdaftar' : 'Participants'}
              </p>
            </div>

            <div className="text-center border-l border-slate-100 dark:border-slate-800">
              <p className="font-mono text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-4xl">
                {counters.organizers}+
              </p>
              <p className="mt-1 font-sans text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                {language === 'id' ? 'Penyelenggara' : 'Organizers'}
              </p>
            </div>

            <div className="text-center border-l border-slate-100 dark:border-slate-800">
              <p className="font-mono text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-4xl">
                {counters.cities}+
              </p>
              <p className="mt-1 font-sans text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                {language === 'id' ? 'Kota Terjangkau' : 'Covered Cities'}
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Featured Events Horizontal Slider Section */}
      <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8" id="featured-events-section">
        <div className="flex flex-col space-y-2 md:flex-row md:items-end md:justify-between md:space-y-0 mb-10">
          <div>
            <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-cyan-600 uppercase tracking-wider">
              <Trophy className="h-4 w-4" />
              <span>{language === 'id' ? 'Lomba & Turnamen Terpopuler' : 'Sought-after Runs & Tournaments'}</span>
            </div>
            <h2 className="mt-2 font-sans text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              {t('featured_events')}
            </h2>
          </div>
          <button
            onClick={() => onNavigate('marketplace')}
            className="flex items-center space-x-1.5 text-sm font-bold text-slate-800 dark:text-slate-350 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors cursor-pointer"
          >
            <span>{language === 'id' ? 'Lihat Semua Event' : 'View Marketplace'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* Premium Horizontal Slider View */}
        <div className="flex space-x-6 overflow-x-auto pb-6 pt-1 leading-normal custom-scrollbar snap-x scroll-smooth">
          {featured.map((evt) => {
            const minPrice = evt.categories.reduce((min, c) => c.price < min ? c.price : min, evt.categories[0]?.price || 0);
            return (
              <div 
                key={evt.id}
                className="group w-[320px] shrink-0 snap-start bg-white rounded-3xl border border-slate-100 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                {/* Image */}
                <div className="relative h-48 w-full overflow-hidden">
                  <img 
                    src={evt.banner} 
                    alt={evt.title} 
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4 rounded-full bg-slate-950/80 backdrop-blur-md px-3 py-1 text-[10px] font-extrabold text-cyan-400 tracking-wider uppercase">
                    {evt.category}
                  </div>
                </div>

                {/* Info Area */}
                <div className="p-6">
                  {/* City/Location */}
                  <div className="flex items-center space-x-1 text-xs font-bold text-slate-400">
                    <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{evt.city}, {evt.province}</span>
                  </div>

                  {/* Title */}
                  <h3 className="mt-2 font-sans text-base font-extrabold text-slate-900 line-clamp-1 group-hover:text-cyan-600 transition-colors">
                    {evt.title}
                  </h3>

                  {/* Date Grid */}
                  <div className="mt-4 flex items-center space-x-1.5 text-xs text-slate-500">
                    <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                    <span>
                      {new Date(evt.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  </div>

                  {/* Pricing and Action button */}
                  <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-50">
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Entry Fee</p>
                      <p className="font-mono text-sm font-extrabold text-slate-950 mt-0.5">
                        {minPrice === 0 ? 'FREE' : `IDR ${(minPrice).toLocaleString('id-ID')}`}
                      </p>
                    </div>

                    <button
                      onClick={() => onNavigate('detail', evt.id)}
                      className="rounded-xl bg-slate-900 hover:bg-slate-800 px-4 py-2 font-sans text-xs font-bold text-white transition-all shadow-sm"
                    >
                      Buy Ticket
                    </button>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Trust & Guarantee Section */}
      <section className="bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-900 py-16" id="guarantee-section">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="font-sans text-xs font-bold tracking-widest uppercase text-cyan-600">
              {language === 'id' ? 'Standar Industri' : 'Enterprise Standards'}
            </h3>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {language === 'id' ? 'Mengapa Penyelenggara Terkemuka Mempercayai EventHub' : 'Why Elite Organizers Trust EventHub'}
            </h2>
          </div>
 
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="p-4 flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 dark:bg-cyan-950/30 text-cyan-500 mb-4">
                <CheckCircle className="h-6 w-6" />
              </div>
              <h4 className="font-sans text-sm font-bold text-slate-900 dark:text-white">
                {language === 'id' ? 'Pemberian BIB Otomatis' : 'Seamless Automated BIB'}
              </h4>
              <p className="mt-2 font-sans text-xs text-slate-400 dark:text-slate-500 leading-normal">
                {language === 'id' 
                  ? 'Nomor urut peserta (BIB) dibuat langsung secara sistematis di setiap kategori setelah pembayaran sukses.' 
                  : 'BIB numbers are generated automatically categorized by race limits immediately upon verified payments.'}
              </p>
            </div>
 
            <div className="p-4 flex flex-col items-center text-center border-l border-slate-50 dark:border-slate-900">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 dark:bg-cyan-950/30 text-cyan-500 mb-4">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h4 className="font-sans text-sm font-bold text-slate-900 dark:text-white">
                {language === 'id' ? 'Escrow Midtrans Aman' : 'Midtrans Verified Escrow'}
              </h4>
              <p className="mt-2 font-sans text-xs text-slate-400 dark:text-slate-500 leading-normal">
                {language === 'id' 
                  ? 'Gerbang transaksi langsung terintegrasi Midtrans menjamin dana pendaftaran Anda tersimpan aman hingga perlombaan selesai.' 
                  : 'Secure stateful transaction gateways keeping your funds guarded, featuring rapid settlement procedures.'}
              </p>
            </div>
 
            <div className="p-4 flex flex-col items-center text-center border-l border-slate-50 dark:border-slate-900">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 dark:bg-cyan-950/30 text-cyan-500 mb-4">
                <Users className="h-6 w-6" />
              </div>
              <h4 className="font-sans text-sm font-bold text-slate-900 dark:text-white">
                {language === 'id' ? 'Sistem Kamera Scan' : 'Live Scanners Support'}
              </h4>
              <p className="mt-2 font-sans text-xs text-slate-400 dark:text-slate-500 leading-normal">
                {language === 'id' 
                  ? 'Pindai tiket secara instan dengan modul kamera handphone browser tanpa membutuhkan hardware scanner eksternal.' 
                  : 'Inbuilt web-based QR scanning and instant status logs for race pack collection and start lines.'}
              </p>
            </div>
 
            <div className="p-4 flex flex-col items-center text-center border-l border-slate-50 dark:border-slate-900">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 dark:bg-cyan-950/30 text-cyan-500 mb-4">
                <Award className="h-6 w-6" />
              </div>
              <h4 className="font-sans text-sm font-bold text-slate-900 dark:text-white">
                {language === 'id' ? 'Sertifikat PDF Digital' : 'PDF Certificates Output'}
              </h4>
              <p className="mt-2 font-sans text-xs text-slate-400 dark:text-slate-500 leading-normal">
                {language === 'id' 
                  ? 'Hasilkan sertifikat pencapaian waktu finsih digital yang dapat diunduh langsung dari dasbor peserta.' 
                  : 'Organizers can generate dynamic finish certificates linked directly with participants finishing ranks.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section with elegant category toggle and micro-animated accordion */}
      <section className="bg-slate-50 dark:bg-slate-950/40 py-20 border-t border-slate-200/50 dark:border-slate-900" id="faq-section">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-cyan-600 uppercase tracking-widest bg-cyan-50/50 px-3.5 py-1.5 rounded-full border border-cyan-100/30 font-mono">
              <HelpCircle className="h-3.5 w-3.5" />
              <span>{t('faq_subtitle')}</span>
            </div>
            <h2 className="mt-3.5 text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
              {t('faq_title')}
            </h2>
            <p className="mt-3 text-sm text-slate-400 dark:text-slate-500 font-sans font-semibold leading-relaxed max-w-xl mx-auto">
              {t('faq_desc')}
            </p>
 
            {/* Category Navigation Tabs */}
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              {(['All', 'Participant', 'Organizer'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => handleCategoryChange(tab)}
                  className={`rounded-2xl px-5 py-2.5 text-xs font-extrabold tracking-wide transition-all border cursor-pointer outline-hidden ${
                    faqCategory === tab
                      ? 'bg-slate-950 border-slate-950 text-white dark:bg-slate-900 dark:border-slate-800 dark:text-cyan-450 shadow-lg shadow-slate-950/20'
                      : 'bg-white border-slate-200/60 text-slate-500 hover:text-slate-900 dark:bg-slate-900/60 dark:border-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100/30'
                  }`}
                  id={`faq-tab-${tab.toLowerCase()}`}
                >
                  {tab === 'All' ? t('all_questions') : tab === 'Participant' ? t('for_participants') : t('for_organizers')}
                </button>
              ))}
            </div>
          </div>

          {/* Accordion List */}
          <div className="space-y-3.5" id="faq-accordion-rows">
            {filteredFaqData.map((item, idx) => {
              const isOpen = expandedIndex === idx;
              return (
                <div
                  key={idx}
                  className={`rounded-2xl border transition-all duration-300 bg-white overflow-hidden ${
                    isOpen 
                      ? 'border-cyan-500/80 shadow-md shadow-cyan-500/5' 
                      : 'border-slate-150/70 hover:border-slate-200/90'
                  }`}
                  id={`faq-item-${idx}`}
                >
                  <button
                    onClick={() => setExpandedIndex(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between p-5 text-left font-sans text-sm font-bold text-slate-950 cursor-pointer outline-hidden transition-colors"
                    aria-expanded={isOpen}
                    id={`faq-btn-${idx}`}
                  >
                    <span className="pr-4">{item.question}</span>
                    <div className="shrink-0 flex h-6 w-6 items-center justify-center rounded-lg bg-slate-50 transition-colors">
                      <ChevronDown
                        className={`h-4 w-4 text-slate-400 transition-transform duration-300 ${
                          isOpen ? 'rotate-180 text-cyan-500' : ''
                        }`}
                      />
                    </div>
                  </button>

                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{
                      height: isOpen ? 'auto' : 0,
                      opacity: isOpen ? 1 : 0
                    }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 pt-0 border-t border-slate-50 text-xs text-slate-500 leading-relaxed font-sans font-medium pt-3.5">
                      {item.answer}
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

    </div>
  );
};
