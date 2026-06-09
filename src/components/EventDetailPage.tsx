/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Calendar, MapPin, Award, ShieldAlert, Navigation, 
  Map, Clock, HelpCircle, Users, CheckCircle, Flame, 
  ArrowLeft, HeartPulse, ChevronRight, Compass, Sparkles,
  Share2, Facebook, Twitter, MessageCircle, Link2, Check
} from 'lucide-react';
import { IndonesiaMap } from './IndonesiaMap';
import { motion, AnimatePresence } from 'motion/react';

interface EventDetailPageProps {
  eventId: string;
  onNavigate: (view: 'landing' | 'marketplace' | 'detail' | 'checkout' | 'dashboard', extraEventId?: string, selectedCategoryId?: string) => void;
}

export const EventDetailPage: React.FC<EventDetailPageProps> = ({ eventId, onNavigate }) => {
  const { events, incrementViews, language } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'racepack' | 'rules' | 'route' | 'schedule' | 'faq' | 'sponsors' | 'gallery'>('overview');
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Load target event
  const event = useMemo(() => {
    return events.find(e => e.id === eventId);
  }, [events, eventId]);

  // Track initial view views count
  useEffect(() => {
    if (event) {
      incrementViews(event.id);
    }
  }, [eventId]);

  const [selectedCategory, setSelectedCategory] = useState<string>('');

  useEffect(() => {
    if (event && event.categories.length > 0) {
      setSelectedCategory(event.categories[0].id);
    }
  }, [event]);

  // Live countdown timer calculation with seconds precision and corrected division formulas
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!event) return;

    const calculateTime = () => {
      const difference = +new Date(event.date) - +new Date();
      if (difference <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / (1000 * 60)) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      };
    };

    setCountdown(calculateTime());
    const interval = setInterval(() => {
      setCountdown(calculateTime());
    }, 1000);

    return () => clearInterval(interval);
  }, [event]);

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <ShieldAlert className="h-10 w-10 text-red-500" />
        <h3 className="mt-4 font-sans text-base font-extrabold text-slate-900">Event Not Found</h3>
        <p className="mt-1 text-xs text-slate-400">This event does not exist or has been archived.</p>
        <button
          onClick={() => onNavigate('marketplace')}
          className="mt-6 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white"
        >
          Back to Marketplace
        </button>
      </div>
    );
  }

  const selectedCatObj = event.categories.find(c => c.id === selectedCategory);
  const totalSlots = event.categories.reduce((acc, c) => acc + c.quota, 0);
  const registeredSlots = event.categories.reduce((acc, c) => acc + c.registeredCount, 0);
  const remainingSlots = totalSlots - registeredSlots;

  // Social sharing constants and helper links
  const shareUrl = window.location.href;
  const shareText = language === 'id'
    ? `Ikuti event olahraga seru "${event.title}" di ${event.location}! Berbagai kategori lomba tersedia, sisa slot terbatas. Daftar online aman di EventHubID:`
    : `Join the exciting sports event "${event.title}" in ${event.location}! Multiple race categories are available, limited slots left. Register securely online on EventHubID:`;

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;

  const labels = {
    shareTitle: language === 'id' ? 'BAGIKAN' : 'SHARE',
    copied: language === 'id' ? 'Tersalin!' : 'Link copied!',
    whatsapp: language === 'id' ? 'Bagikan ke WhatsApp' : 'Share to WhatsApp',
    twitter: language === 'id' ? 'Bagikan ke Twitter / X' : 'Share to Twitter / X',
    facebook: language === 'id' ? 'Bagikan ke Facebook' : 'Share to Facebook',
    copy: language === 'id' ? 'Salin Tautan' : 'Copy Link',
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error('Failed to copy link: ', err);
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      
      {/* Premium Full-Width Banner Hero */}
      <div className="relative h-[480px] w-full bg-slate-950">
        <img 
          src={event.banner} 
          alt={event.title} 
          className="h-full w-full object-cover opacity-60"
        />
        {/* Soft edge gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-slate-950/60" />

        {/* Floating breadcrumbs and back control */}
        <div className="absolute top-6 left-0 right-0 z-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => onNavigate('marketplace')}
              className="inline-flex items-center space-x-2 rounded-full border border-white/20 bg-black/40 hover:bg-black/60 px-4 py-2 text-xs font-bold text-white backdrop-blur-md transition-all"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Explore</span>
            </button>
          </div>
        </div>

        {/* Hero Meta Overlay (Title, countdown details, etc.) */}
        <div className="absolute bottom-8 left-0 right-0 z-10 text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              
              <span className="inline-flex items-center space-x-1.5 rounded-full bg-cyan-500/20 border border-cyan-400/40 px-3 py-1 text-[10px] font-extrabold text-cyan-400 uppercase tracking-widest">
                <Flame className="h-3.5 w-3.5 animate-pulse" />
                <span>{event.category} Event</span>
              </span>

              <h1 className="mt-4 font-sans text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl" id="detail-title">
                {event.title}
              </h1>

              {/* Specs grid */}
              <div className="mt-6 flex flex-wrap items-center gap-y-4 gap-x-8 text-sm">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4.5 w-4.5 text-cyan-400" />
                  <span className="font-semibold">{event.location}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4.5 w-4.5 text-cyan-400" />
                  <span className="font-semibold">
                    {new Date(event.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <Award className="h-4.5 w-4.5 text-cyan-400" />
                  <span className="font-semibold text-slate-200">Organized by {event.organizerName}</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Main content body + Sticky Registration side bar */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-3">
          
          {/* LEFT 2 COLS: Detailed specifications / dynamic Tabs */}
          <div className="lg:col-span-2 space-y-10">
            
            {/* Quick Live Countdown and Quota statistics */}
            <div className="grid gap-4 sm:grid-cols-2">
              
              {/* Countdown panel */}
              <div className="rounded-2xl border border-slate-150/70 bg-white p-5 shadow-xs">
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 mb-3.5">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4.5 w-4.5 text-cyan-500 animate-pulse" />
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Event Start Countdown</span>
                  </div>
                  <span className="inline-flex h-2 w-2 rounded-full bg-cyan-500 animate-ping" />
                </div>
                <div className="flex justify-between items-center space-x-1 sm:space-x-1.5 mt-2">
                  <div className="flex-1 flex flex-col items-center rounded-xl bg-slate-950 p-2.5 text-center border border-slate-900">
                    <span className="font-mono text-lg font-bold text-white tracking-tight leading-none" id="countdown-days">
                      {countdown.days.toString().padStart(2, '0')}
                    </span>
                    <span className="mt-1 text-[8px] font-bold uppercase tracking-widest text-slate-400">Days</span>
                  </div>
                  <span className="text-slate-300 font-mono text-sm font-bold leading-none">:</span>
                  <div className="flex-1 flex flex-col items-center rounded-xl bg-slate-950 p-2.5 text-center border border-slate-900">
                    <span className="font-mono text-lg font-bold text-white tracking-tight leading-none" id="countdown-hours">
                      {countdown.hours.toString().padStart(2, '0')}
                    </span>
                    <span className="mt-1 text-[8px] font-bold uppercase tracking-widest text-slate-400">Hours</span>
                  </div>
                  <span className="text-slate-300 font-mono text-sm font-bold leading-none">:</span>
                  <div className="flex-1 flex flex-col items-center rounded-xl bg-slate-950 p-2.5 text-center border border-slate-900">
                    <span className="font-mono text-lg font-bold text-white tracking-tight leading-none" id="countdown-minutes">
                      {countdown.minutes.toString().padStart(2, '0')}
                    </span>
                    <span className="mt-1 text-[8px] font-bold uppercase tracking-widest text-slate-400">Mins</span>
                  </div>
                  <span className="text-slate-300 font-mono text-sm font-bold leading-none">:</span>
                  <div className="flex-1 flex flex-col items-center rounded-xl bg-slate-950 p-2.5 text-center border border-slate-900">
                    <span className="font-mono text-lg font-bold text-cyan-400 tracking-tight leading-none" id="countdown-seconds">
                      {countdown.seconds.toString().padStart(2, '0')}
                    </span>
                    <span className="mt-1 text-[8px] font-bold uppercase tracking-widest text-cyan-500">Secs</span>
                  </div>
                </div>
              </div>

              {/* Status slot details */}
              <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">REGISTRATION DEMAND STATUS</p>
                  <p className="mt-1 font-sans text-lg font-extrabold text-slate-900">
                    {registeredSlots.toLocaleString('id-ID')} / {totalSlots.toLocaleString('id-ID')} Registered
                  </p>
                  <div className="mt-2.5 h-1.5 w-52 rounded-full bg-slate-100 overflow-hidden">
                    <div 
                      className="h-full bg-cyan-500 rounded-full" 
                      style={{ width: `${(registeredSlots / totalSlots) * 100}%` }}
                    />
                  </div>
                </div>
                <Users className="h-8 w-8 text-cyan-500 opacity-60 flex-none" />
              </div>

            </div>

            {/* Event Navigation Tabs */}
            <div className="border-b border-slate-200">
              <nav className="-mb-px flex space-x-6 overflow-x-auto pb-0.5 custom-scrollbar" id="info-tabs">
                {(['overview', 'racepack', 'rules', 'route', 'schedule', 'faq', 'sponsors', 'gallery'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`border-b-2 py-4 text-xs font-bold tracking-wide uppercase transition-colors whitespace-nowrap ${
                      activeTab === tab
                        ? 'border-cyan-500 text-slate-900'
                        : 'border-transparent text-slate-400 hover:border-slate-350 hover:text-slate-600'
                    }`}
                  >
                    {tab === 'racepack' ? 'Race Pack' : tab === 'route' ? 'Route Map' : tab}
                  </button>
                ))}
              </nav>
            </div>

            {/* TAB PANELS */}
            <div className="rounded-2xl border border-slate-100 bg-white p-6 md:p-8 shadow-xs">
              
              {/* Tab 1: Overview */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <h3 className="font-sans text-lg font-extrabold text-slate-900">Event Overview</h3>
                  <p className="font-sans text-xs text-slate-500 leading-relaxed whitespace-pre-line">
                    {event.description}
                  </p>

                  <div className="grid gap-6 border-t border-slate-100 pt-6 sm:grid-cols-2">
                    <div>
                      <h4 className="font-sans text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                        <CheckCircle className="h-4.5 w-4.5 text-cyan-500" />
                        <span>Included in Registration</span>
                      </h4>
                      <ul className="mt-3.5 space-y-2 text-xs text-slate-500">
                        <li className="flex items-center space-x-2">
                          <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                          <span>Official High-performance Event Jersey</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                          <span>Cast Finisher Medal (upon finishing within CUT)</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                          <span>Bib with embedded RFID Timing Chip</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                          <span>Personalized Digital Finisher Certificate</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                          <span>Hydration drinks & snacks at all water stations</span>
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-sans text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                        <HeartPulse className="h-4.5 w-4.5 text-cyan-500" />
                        <span>Race Medical Support</span>
                      </h4>
                      <p className="mt-3 text-xs text-slate-500 leading-relaxed">
                        Dedicated professional ambulances and stationary doctor zones are pre-positioned along the entire corridor at 2.5KM intervals. Dynamic medical runners are equipped with automated defibrillators (AEDs) patrolling continuously.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Race Pack */}
              {activeTab === 'racepack' && (
                <div className="space-y-6">
                  <h3 className="font-sans text-lg font-extrabold text-slate-900">Race Pack Collection Guidelines</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Registered participants are required to collect their official race bibs, event jersey, and timing chip pack prior to race morning.
                  </p>

                  <div className="rounded-2xl bg-cyan-50/50 border border-cyan-100 p-5 mt-4">
                    <p className="text-xs font-bold text-cyan-900">Required Documents for Collection:</p>
                    <ul className="mt-2.5 space-y-1.5 text-xs text-cyan-800 list-disc list-inside">
                      <li>Your official Ticket barcode (printed or on EventHub digital profile).</li>
                      <li>Government-issued original Photo ID card (KTP / Passport / Driver License).</li>
                      <li>Signed medical authorization form (can be downloaded online).</li>
                    </ul>
                  </div>

                  <div className="pt-4">
                    <h4 className="font-sans text-xs font-bold text-slate-900">Collection Location details:</h4>
                    <p className="mt-1.5 text-xs text-slate-500">
                      Magelang Armada Square Mall / Sanur Beach Hub Center, open from 10:00 AM to 08:00 PM WIB daily. Same-day collections on race mornings are strictly prohibited to avoid congestion.
                    </p>
                  </div>
                </div>
              )}

              {/* Tab 3: Rules */}
              {activeTab === 'rules' && (
                <div className="space-y-6">
                  <h3 className="font-sans text-lg font-extrabold text-slate-900">Official Tournament Rules</h3>
                  <ul className="space-y-4">
                    {event.rules.map((rule, idx) => (
                      <li key={idx} className="flex items-start space-x-3 text-xs text-slate-500 leading-relaxed">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-700">
                          {idx + 1}
                        </span>
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tab 4: Route Map */}
              {activeTab === 'route' && (
                <div className="space-y-6">
                  <h3 className="font-sans text-lg font-extrabold text-slate-900">Race Course & Elevation</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Designed to combine speed and magnificent visual landmarks, course directions are certified according to World Athletics specifications.
                  </p>

                  {/* Elevation course vector visualization */}
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">ELEVATION PROFILE & GRADIENTS</p>
                    <div className="mt-6 flex h-32 items-end justify-between space-x-1.5">
                      {Array.from({ length: 24 }).map((_, idx) => {
                        const heights = [10, 15, 20, 25, 40, 50, 45, 30, 20, 15, 12, 10, 30, 60, 80, 100, 75, 50, 30, 20, 15, 12, 10, 8];
                        const ht = heights[idx] || 15;
                        return (
                          <div 
                            key={idx} 
                            style={{ height: `${ht}%` }} 
                            className="bg-cyan-500 hover:bg-cyan-400 transition-all rounded-t-sm w-full relative group cursor-pointer"
                          >
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block bg-slate-950 text-white text-[9px] font-mono px-1 rounded">
                              {Math.floor(ht * 3.5)}m
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-2.5 flex justify-between text-[10px] font-mono font-medium text-slate-400">
                      <span>START 0 KM</span>
                      <span>KM 10</span>
                      <span>KM 21 (HALF)</span>
                      <span>KM 32</span>
                      <span>FINISH candi 42K</span>
                    </div>
                  </div>

                  {/* Geographical Location Map */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Archipelago Map Context</p>
                      <span className="text-[9.5px] font-bold text-cyan-600 uppercase font-mono tracking-wider bg-cyan-50/50 px-2 py-0.5 rounded-md border border-cyan-100/30">
                        {event.city}, {event.province} • Coordinate: {event.latitude?.toFixed(4)}° S, {event.longitude?.toFixed(4)}° E
                      </span>
                    </div>
                    <IndonesiaMap 
                      events={events}
                      activeEventId={event.id}
                      height="h-[360px]"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 text-xs">
                    <div className="rounded-xl border border-slate-100 p-4">
                      <p className="font-bold text-slate-900">Water Stations (WS)</p>
                      <p className="mt-1 text-slate-500">WS stationed at every 2.5 KM intervals equipped with cold mineral water, Pocari Sweat, and fresh bananas.</p>
                    </div>
                    <div className="rounded-xl border border-slate-100 p-4">
                      <p className="font-bold text-slate-900">Sponge Stations</p>
                      <p className="mt-1 text-slate-500">Cooled sponges will be provided starting from KM 15 to assist athletes with temperature regulation.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 5: Schedule */}
              {activeTab === 'schedule' && (
                <div className="space-y-6">
                  <h3 className="font-sans text-lg font-extrabold text-slate-900">Event Schedule Timeline</h3>
                  
                  <div className="relative border-l-2 border-slate-150 pl-5 space-y-6 ml-3">
                    <div className="relative">
                      <div className="absolute -left-8.5 top-0 h-5 w-5 rounded-full border-4 border-white bg-cyan-500 shadow-sm" />
                      <p className="font-mono text-xs font-bold text-cyan-600">04:00 WIB</p>
                      <p className="font-sans text-xs font-bold text-slate-900 mt-1">Gaggage Drop & Race Village Gates Open</p>
                    </div>

                    <div className="relative">
                      <div className="absolute -left-8.5 top-0 h-5 w-5 rounded-full border-4 border-white bg-slate-350 bg-cyan-500 shadow-sm" />
                      <p className="font-mono text-xs font-bold text-cyan-600">04:30 WIB</p>
                      <p className="font-sans text-xs font-bold text-slate-900 mt-1">Warming Up & Elite Runners Line Up</p>
                    </div>

                    <div className="relative">
                      <div className="absolute -left-8.5 top-0 h-5 w-5 rounded-full border-4 border-white bg-cyan-500 shadow-sm" />
                      <p className="font-mono text-xs font-bold text-cyan-600">05:00 WIB</p>
                      <p className="font-sans text-xs font-bold text-slate-900 mt-1">Official Flag-Off Full Marathon (42K)</p>
                    </div>

                    <div className="relative">
                      <div className="absolute -left-8.5 top-0 h-5 w-5 rounded-full border-4 border-white bg-slate-350 bg-cyan-400 shadow-sm" />
                      <p className="font-mono text-xs font-bold text-cyan-600">05:30 WIB</p>
                      <p className="font-sans text-xs font-bold text-slate-900 mt-1">Flag-Off Half Marathon (21K)</p>
                    </div>

                    <div className="relative">
                      <div className="absolute -left-8.5 top-0 h-5 w-5 rounded-full border-4 border-white bg-slate-350 bg-cyan-400 shadow-sm" />
                      <p className="font-mono text-xs font-bold text-cyan-600">06:00 WIB</p>
                      <p className="font-sans text-xs font-bold text-slate-900 mt-1">Flag-Off 10K Category</p>
                    </div>

                    <div className="relative">
                      <div className="absolute -left-8.5 top-0 h-5 w-5 rounded-full border-4 border-white bg-slate-350 bg-slate-400 shadow-sm" />
                      <p className="font-mono text-xs font-bold text-slate-600">12:00 WIB</p>
                      <p className="font-sans text-xs font-bold text-slate-900 mt-1">Closing & Award Ceremony</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 6: FAQ */}
              {activeTab === 'faq' && (
                <div className="space-y-6">
                  <h3 className="font-sans text-lg font-extrabold text-slate-900">Frequently Asked Questions</h3>
                  <div className="space-y-4">
                    {event.faq.map((item, idx) => (
                      <div key={idx} className="rounded-xl border border-slate-100 p-4">
                        <p className="font-sans text-xs font-extrabold text-slate-900">{item.question}</p>
                        <p className="mt-2 font-sans text-xs text-slate-400 leading-normal">{item.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 7: Sponsors */}
              {activeTab === 'sponsors' && (
                <div className="space-y-6">
                  <h3 className="font-sans text-lg font-extrabold text-slate-900">Official Partners & Sponsors</h3>
                  <p className="text-xs text-slate-400">Supported by premium brands committed to boosting athletics ecosystem development inside Indonesia.</p>
                  
                  <div className="mt-8 grid gap-4 grid-cols-2 sm:grid-cols-3">
                    {event.sponsors.map((sp, idx) => (
                      <div 
                        key={idx} 
                        className="flex h-20 items-center justify-center rounded-2xl border border-slate-100 p-4 hover:border-slate-300 transition-colors bg-slate-50/50"
                      >
                        <span className="font-sans text-xs font-bold tracking-tight text-slate-600 text-center uppercase">
                          {sp}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 8: Gallery */}
              {activeTab === 'gallery' && (
                <div className="space-y-6">
                  <h3 className="font-sans text-lg font-extrabold text-slate-900">Event Gallery</h3>
                  <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                    {event.gallery.map((gImg, idx) => (
                      <div key={idx} className="relative h-44 rounded-2xl overflow-hidden group">
                        <img 
                          src={gImg} 
                          alt="Atmosphere" 
                          className="h-full w-full object-cover transition-transform group-hover:scale-105 duration-300"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

          </div>

          {/* RIGHT COL: Sticky Booking Card option box (stays on scroll) */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-3xl border border-slate-100 bg-white p-6 shadow-md shadow-slate-200/40">
              
              <div className="border-b border-slate-50 pb-4">
                <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">TICKET SELECTOR</p>
                <h3 className="mt-1 font-sans text-base font-extrabold text-slate-900">Select Category</h3>
              </div>

              {/* Category radio grid list */}
              <div className="mt-5 space-y-3">
                {event.categories.map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  const ratioCount = cat.registeredCount / cat.quota;
                  const isSoldOut = cat.registeredCount >= cat.quota;

                  return (
                    <div
                      key={cat.id}
                      onClick={() => !isSoldOut && setSelectedCategory(cat.id)}
                      className={`relative rounded-2xl border p-4 cursor-pointer transition-all ${
                        isSoldOut 
                          ? 'opacity-50 border-slate-100 bg-slate-50 cursor-not-allowed'
                          : isSelected
                            ? 'border-cyan-500 bg-cyan-50/10 ring-1 ring-cyan-500'
                            : 'border-slate-100 hover:border-slate-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-sans text-xs font-extrabold text-slate-800 leading-tight">
                            {cat.name}
                          </p>
                          <p className="mt-1 font-mono text-[11px] font-bold text-cyan-600">
                            {cat.price === 0 ? 'FREE' : `IDR ${(cat.price).toLocaleString('id-ID')}`}
                          </p>
                        </div>
                        <div className={`h-4.5 w-4.5 rounded-full border flex items-center justify-center ${
                          isSelected ? 'border-cyan-500 bg-cyan-500 text-white' : 'border-slate-200 bg-white'
                        }`}>
                          {isSelected && <span className="text-[9px]">✓</span>}
                        </div>
                      </div>

                      {/* Display remaining indicator in category cards */}
                      <div className="mt-3.5 flex items-center justify-between text-[10px] font-medium text-slate-400">
                        <span>Slots: {cat.quota - cat.registeredCount} remaining</span>
                        <span>{Math.floor(ratioCount * 100)}% sold</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Dynamic highlights for jersey inclusion, timing card */}
              {selectedCatObj && (
                <div className="mt-6 rounded-2xl bg-slate-50 p-4 border border-slate-100/50">
                  <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">INCLUSIONS</p>
                  
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[10px] font-bold text-slate-600">
                    <div className={`rounded-lg p-1.5 ${selectedCatObj.jerseyIncluded ? 'bg-cyan-50 text-cyan-700' : 'bg-slate-100 text-slate-400 line-through'}`}>
                      Jersey
                    </div>
                    <div className={`rounded-lg p-1.5 ${selectedCatObj.medalIncluded ? 'bg-cyan-50 text-cyan-700' : 'bg-slate-100 text-slate-400 line-through'}`}>
                      Medal
                    </div>
                    <div className={`rounded-lg p-1.5 ${selectedCatObj.racePackIncluded ? 'bg-cyan-50 text-cyan-700' : 'bg-slate-100 text-slate-400 line-through'}`}>
                      Bag Pack
                    </div>
                  </div>
                </div>
              )}

              {/* Pricing final summary and Trigger checkout Button */}
              <div className="mt-6 pt-4 border-t border-slate-50">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wide">Total Price</span>
                  <span className="font-mono text-sm font-extrabold text-slate-900" id="detail-total-price">
                    {selectedCatObj ? `IDR ${selectedCatObj.price.toLocaleString('id-ID')}` : 'IDR 0'}
                  </span>
                </div>

                <button
                  onClick={() => selectedCategory && onNavigate('checkout', event.id, selectedCategory)}
                  disabled={!selectedCategory}
                  className="w-full rounded-2xl bg-slate-900 hover:bg-slate-800 disabled:bg-slate-150 text-white font-sans text-xs font-bold p-4 shadow-md transition-opacity"
                  id="start-registration-btn"
                >
                  Register Now
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Desktop Floating Left Share Rail */}
      <div className="fixed left-6 top-1/2 -translate-y-1/2 z-40 hidden xl:flex flex-col items-center space-y-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200/65 dark:border-slate-800/80 shadow-2xl animate-in fade-in slide-in-from-left-4 duration-300">
        <div className="flex flex-col items-center space-y-1 pb-2 border-b border-slate-100 dark:border-slate-800/65 w-full text-center">
          <Share2 className="h-4 w-4 mx-auto text-slate-400 dark:text-slate-500 animate-pulse" />
          <span className="font-sans text-[8px] font-extrabold tracking-widest text-slate-400 dark:text-slate-500 uppercase">
            {labels.shareTitle}
          </span>
        </div>

        {/* WhatsApp Button */}
        <div className="relative flex items-center group">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md shadow-emerald-500/10 hover:bg-emerald-650 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            id="desktop-share-wa"
          >
            <MessageCircle className="h-4.5 w-4.5 fill-white/10" />
          </a>
          <div className="absolute left-14 opacity-0 scale-75 pointer-events-none group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 origin-left whitespace-nowrap bg-slate-950 dark:bg-slate-850 text-white text-[10px] uppercase tracking-wider font-extrabold px-3 py-1.5 rounded-xl shadow-md border border-slate-800/10 dark:border-slate-700/50">
            {labels.whatsapp}
          </div>
        </div>

        {/* Twitter / X Button */}
        <div className="relative flex items-center group">
          <a
            href={twitterUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-950 text-white shadow-md shadow-slate-900/15 hover:scale-105 active:scale-95 dark:bg-slate-950 border border-transparent dark:border-white/10 transition-all cursor-pointer"
            id="desktop-share-tw"
          >
            <Twitter className="h-4 w-4 text-white" />
          </a>
          <div className="absolute left-14 opacity-0 scale-75 pointer-events-none group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 origin-left whitespace-nowrap bg-slate-950 dark:bg-slate-850 text-white text-[10px] uppercase tracking-wider font-extrabold px-3 py-1.5 rounded-xl shadow-md border border-slate-800/10 dark:border-slate-700/50">
            {labels.twitter}
          </div>
        </div>

        {/* Facebook Button */}
        <div className="relative flex items-center group">
          <a
            href={facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white shadow-md shadow-blue-600/15 hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            id="desktop-share-fb"
          >
            <Facebook className="h-4.5 w-4.5 fill-white/10" />
          </a>
          <div className="absolute left-14 opacity-0 scale-75 pointer-events-none group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 origin-left whitespace-nowrap bg-slate-950 dark:bg-slate-850 text-white text-[10px] uppercase tracking-wider font-extrabold px-3 py-1.5 rounded-xl shadow-md border border-slate-800/10 dark:border-slate-700/50">
            {labels.facebook}
          </div>
        </div>

        {/* Copy Link Button */}
        <div className="relative flex items-center group">
          <button
            onClick={handleCopyLink}
            className={`flex h-10 w-10 items-center justify-center rounded-full text-white shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer ${
              copied ? 'bg-emerald-500 shadow-emerald-500/10' : 'bg-sky-500 hover:bg-sky-600 shadow-sky-500/10'
            }`}
            id="desktop-share-copy"
          >
            {copied ? <Check className="h-4.5 w-4.5 text-white" /> : <Link2 className="h-4.5 w-4.5 text-white" />}
          </button>
          <div className="absolute left-14 opacity-0 scale-75 pointer-events-none group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 origin-left whitespace-nowrap bg-slate-950 dark:bg-slate-850 text-white text-[10px] uppercase tracking-wider font-extrabold px-3 py-1.5 rounded-xl shadow-md border border-slate-800/10 dark:border-slate-700/50">
            {copied ? labels.copied : labels.copy}
          </div>
        </div>
      </div>

      {/* Mobile Floating Share Speed Dial Trigger (Bottom Right) */}
      <div className="fixed bottom-6 right-6 z-40 xl:hidden flex flex-col items-end space-y-3">
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.8 }}
              transition={{ type: 'spring', damping: 15, stiffness: 220 }}
              className="flex flex-col items-end space-y-3 mb-1"
            >
              {/* WhatsApp option */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2.5 outline-hidden"
                onClick={() => setMenuOpen(false)}
                id="mobile-share-wa"
              >
                <span className="bg-slate-950/85 dark:bg-slate-850/90 backdrop-blur-md text-white text-[9px] uppercase tracking-wider font-extrabold px-2.5 py-1.5 rounded-xl shadow-md border border-white/5 dark:border-slate-800">
                  {labels.whatsapp}
                </span>
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 active:scale-95 transition-transform">
                  <MessageCircle className="h-5 w-5 fill-white/10" />
                </div>
              </a>

              {/* Twitter / X option */}
              <a
                href={twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2.5 outline-hidden"
                onClick={() => setMenuOpen(false)}
                id="mobile-share-tw"
              >
                <span className="bg-slate-950/85 dark:bg-slate-850/90 backdrop-blur-md text-white text-[9px] uppercase tracking-wider font-extrabold px-2.5 py-1.5 rounded-xl shadow-md border border-white/5 dark:border-slate-800">
                  Twitter / X
                </span>
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-900 dark:bg-slate-950 text-white shadow-lg shadow-slate-900/20 active:scale-95 transition-transform">
                  <Twitter className="h-4 w-4 text-white" />
                </div>
              </a>

              {/* Facebook option */}
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2.5 outline-hidden"
                onClick={() => setMenuOpen(false)}
                id="mobile-share-fb"
              >
                <span className="bg-slate-950/85 dark:bg-slate-850/90 backdrop-blur-md text-white text-[9px] uppercase tracking-wider font-extrabold px-2.5 py-1.5 rounded-xl shadow-md border border-white/5 dark:border-slate-800">
                  Facebook
                </span>
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-600/20 active:scale-95 transition-transform">
                  <Facebook className="h-5 w-5 fill-white/10" />
                </div>
              </a>

              {/* Copy Link option */}
              <button
                onClick={() => {
                  handleCopyLink();
                  setTimeout(() => setMenuOpen(false), 1205);
                }}
                className="flex items-center space-x-2.5 cursor-pointer outline-hidden border-none bg-transparent"
                id="mobile-share-copy"
              >
                <span className="bg-slate-950/85 dark:bg-slate-850/90 backdrop-blur-md text-white text-[9px] uppercase tracking-wider font-extrabold px-2.5 py-1.5 rounded-xl shadow-md border border-white/5 dark:border-slate-800 font-sans">
                  {copied ? labels.copied : labels.copy}
                </span>
                <div className={`flex h-11 w-11 items-center justify-center rounded-full text-white shadow-lg active:scale-95 transition-all ${
                  copied ? 'bg-emerald-500 shadow-emerald-500/20 animate-bounce' : 'bg-sky-500 shadow-sky-500/20'
                }`}>
                  {copied ? <Check className="h-5 w-5 text-white" /> : <Link2 className="h-5 w-5 text-white" />}
                </div>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Trigger Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className={`flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-xl shadow-cyan-500/20 active:scale-95 transition-all outline-hidden cursor-pointer ${
            menuOpen ? 'rotate-45 bg-slate-900 text-white dark:bg-slate-850' : ''
          }`}
          id="mobile-share-trigger"
        >
          <Share2 className="h-5 w-5" />
        </button>
      </div>

    </div>
  );
};
