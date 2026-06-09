/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Plus, Calendar, Users, DollarSign, Activity, Settings, 
  MapPin, CheckCircle, Search, Download, Trash, RefreshCw, 
  FileText, Landmark, ShieldCheck, PieChart, TrendingUp, Sparkles, Edit, Mail
} from 'lucide-react';
import { Category, IndonesianEvent } from '../types';

export const OrganizerDashboard: React.FC = () => {
  const { 
    events, registrations, addEvent, updateEvent, deleteEvent,
    addRegistration, deleteRegistration, updateCheckInStatus, 
    withdrawals, requestWithdrawal, globalSettings,
    organizerEmailSettings, updateOrganizerEmailSettings
  } = useApp();

  const [activeMenu, setActiveMenu] = useState<'overview' | 'events' | 'participants' | 'checkin' | 'reports' | 'settings'>('overview');

  // Filter registrations belonging to organizer events (for this mock, all registrations fit under our global organizer database)
  const organizerEvents = events;
  const organizerRegs = registrations;

  // Search, filter state for participant list
  const [participantSearch, setParticipantSearch] = useState('');
  const [participantCategoryFilter, setParticipantCategoryFilter] = useState('all');

  // Check-In module state
  const [checkInSearch, setCheckInSearch] = useState('');

  // Settle funds form states
  const [settlementAmount, setSettlementAmount] = useState<number>(50000000);
  const [bankName, setBankName] = useState('BCA');
  const [accountNum, setAccountNum] = useState('8001239845');
  const [accountHolder, setAccountHolder] = useState('Yayasan Borobudur Marathon');
  const [settlementSuccessMsg, setSettlementSuccessMsg] = useState('');

  // 1. ADD/EDIT EVENT STATES
  const [editingEvent, setEditingEvent] = useState<IndonesianEvent | null>(null);
  const [showManualRegForm, setShowManualRegForm] = useState(false);
  const [manualReg, setManualReg] = useState({
    eventId: '',
    categoryId: '',
    firstName: '',
    lastName: '',
    email: '',
    gender: 'male' as 'male' | 'female',
    identityType: 'KTP' as 'KTP' | 'Passport',
    identityNumber: '',
    phoneNumber: '',
    bloodType: 'O',
    medicalNotes: '',
    emergencyName: '',
    emergencyPhone: '',
    emergencyRelationship: 'Spouse',
    jerseySize: 'M',
  });

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    slug: '',
    description: '',
    category: 'Running' as IndonesianEvent['category'],
    banner: 'https://images.unsplash.com/photo-1530541930197-ff16ac917b0e?auto=format&fit=crop&q=80&w=800',
    location: '',
    googleMapsUrl: '',
    province: '',
    city: '',
    date: '',
    registrationOpen: '',
    registrationClose: '',
    quota: 1000,
    sponsors: ['Pocari Sweat', 'Garmin', 'Polygon'],
    rules: ['Be on time', 'BIB visible', 'Observe cut-off times'],
    latitude: -6.1754,
    longitude: 106.8272,
  });

  // Category management inside create event form
  const [newEventCategories, setNewEventCategories] = useState<Category[]>([
    {
      id: 'cat-5k',
      name: '5K Fun Series',
      price: 250000,
      quota: 400,
      registeredCount: 0,
      jerseyIncluded: true,
      medalIncluded: true,
      racePackIncluded: true
    },
    {
      id: 'cat-10k',
      name: '10K Professional Challenger',
      price: 450000,
      quota: 600,
      registeredCount: 0,
      jerseyIncluded: true,
      medalIncluded: true,
      racePackIncluded: true
    }
  ]);

  const [newCatName, setNewCatName] = useState('');
  const [newCatPrice, setNewCatPrice] = useState<number>(300000);
  const [newCatQuota, setNewCatQuota] = useState<number>(200);

  const handleAddCategoryToNewEvent = () => {
    if (!newCatName.trim()) return;
    const cleanId = 'cat-' + newCatName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const cat: Category = {
      id: cleanId,
      name: newCatName,
      price: newCatPrice,
      quota: newCatQuota,
      registeredCount: 0,
      jerseyIncluded: true,
      medalIncluded: true,
      racePackIncluded: true
    };
    setNewEventCategories(prev => [...prev, cat]);
    setNewCatName('');
  };

  const handleStartEdit = (evt: IndonesianEvent) => {
    setEditingEvent(evt);
    setNewEvent({
      title: evt.title,
      slug: evt.slug,
      description: evt.description,
      category: evt.category,
      banner: evt.banner,
      location: evt.location,
      googleMapsUrl: evt.googleMapsUrl || '',
      province: evt.province,
      city: evt.city,
      date: evt.date,
      registrationOpen: evt.registrationOpen || '',
      registrationClose: evt.registrationClose || '',
      quota: evt.quota,
      sponsors: evt.sponsors || [],
      rules: evt.rules || [],
      latitude: evt.latitude,
      longitude: evt.longitude,
    });
    setNewEventCategories(evt.categories);
    setShowCreateForm(true);
  };

  const handleStartCreate = () => {
    setEditingEvent(null);
    setNewEvent({
      title: '',
      slug: '',
      description: '',
      category: 'Running',
      banner: 'https://images.unsplash.com/photo-1530541930197-ff16ac917b0e?auto=format&fit=crop&q=80&w=800',
      location: '',
      googleMapsUrl: '',
      province: '',
      city: '',
      date: '',
      registrationOpen: '',
      registrationClose: '',
      quota: 1000,
      sponsors: ['Pocari Sweat', 'Garmin', 'Polygon'],
      rules: ['Be on time', 'BIB visible', 'Observe cut-off times'],
      latitude: -6.1754,
      longitude: 106.8272,
    });
    setNewEventCategories([
      {
        id: 'cat-5k',
        name: '5K Fun Series',
        price: 250000,
        quota: 400,
        registeredCount: 0,
        jerseyIncluded: true,
        medalIncluded: true,
        racePackIncluded: true
      },
      {
        id: 'cat-10k',
        name: '10K Professional Challenger',
        price: 450000,
        quota: 600,
        registeredCount: 0,
        jerseyIncluded: true,
        medalIncluded: true,
        racePackIncluded: true
      }
    ]);
    setShowCreateForm(true);
  };

  const handleManualRegSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualReg.eventId || !manualReg.categoryId || !manualReg.firstName || !manualReg.lastName) return;

    const targetEvent = events.find(evt => evt.id === manualReg.eventId);
    const targetCategory = targetEvent?.categories.find(c => c.id === manualReg.categoryId);

    if (!targetEvent || !targetCategory) return;

    addRegistration({
      eventId: manualReg.eventId,
      eventTitle: targetEvent.title,
      categoryId: manualReg.categoryId,
      categoryName: targetCategory.name,
      personalInfo: {
        firstName: manualReg.firstName,
        lastName: manualReg.lastName,
        email: manualReg.email,
        gender: manualReg.gender,
        whatsapp: manualReg.phoneNumber,
        birthDate: '1995-01-01',
      },
      identityInfo: {
        identityType: manualReg.identityType,
        identityNumber: manualReg.identityNumber,
        citizenship: 'Indonesia'
      },
      medicalInfo: {
        bloodType: manualReg.bloodType,
        allergies: 'None',
        medicalConditions: manualReg.medicalNotes || 'None'
      },
      emergencyInfo: {
        name: manualReg.emergencyName,
        phoneNumber: manualReg.emergencyPhone,
        relationship: manualReg.emergencyRelationship
      },
      jerseyInfo: {
        size: manualReg.jerseySize,
        cutType: 'Unisex'
      },
      paymentInfo: {
        method: 'On-Site Cash / Manual Injected',
        invoiceNumber: `INV-${Date.now()}`,
        baseAmount: targetCategory.price,
        couponDiscount: 0,
        platformFee: 0,
        finalAmount: targetCategory.price,
        status: 'paid',
        paidAt: new Date().toISOString()
      },
      add_on: {
        shuttleBusId: 'none',
        shuttleBusRoute: 'none',
        shuttleBusPrice: 0,
        carbonNeutralDonateAmount: 0
      }
    });

    // Reset Form
    setShowManualRegForm(false);
    setManualReg({
      eventId: '',
      categoryId: '',
      firstName: '',
      lastName: '',
      email: '',
      gender: 'male',
      identityType: 'KTP',
      identityNumber: '',
      phoneNumber: '',
      bloodType: 'O',
      medicalNotes: '',
      emergencyName: '',
      emergencyPhone: '',
      emergencyRelationship: 'Spouse',
      jerseySize: 'M',
    });
  };

  const handleCreateEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title.trim() || !newEvent.city.trim()) return;

    if (editingEvent) {
      updateEvent({
        ...editingEvent,
        ...newEvent,
        slug: newEvent.title.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        categories: newEventCategories,
      });
      setEditingEvent(null);
    } else {
      addEvent({
        ...newEvent,
        slug: newEvent.title.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        categories: newEventCategories,
        gallery: [
          'https://images.unsplash.com/photo-1541614101331-1a5a3a194e92?auto=format&fit=crop&q=80&w=600'
        ],
        faq: [
          { question: 'Is baggage storage free?', answer: 'Yes, secure baggage drop area available.' }
        ]
      });
    }

    // Reset Form
    setShowCreateForm(false);
    setNewEvent({
      title: '',
      slug: '',
      description: '',
      category: 'Running',
      banner: 'https://images.unsplash.com/photo-1530541930197-ff16ac917b0e?auto=format&fit=crop&q=80&w=800',
      location: '',
      googleMapsUrl: '',
      province: '',
      city: '',
      date: '',
      registrationOpen: '',
      registrationClose: '',
      quota: 1000,
      sponsors: ['Pocari Sweat', 'Garmin', 'Polygon'],
      rules: ['Be on time', 'BIB visible', 'Observe cut-off times'],
      latitude: -6.1754,
      longitude: 106.8272,
    });
  };

  // 2. STATISTICS COMPUTATION
  const cumulativeRevenue = useMemo(() => {
    return organizerRegs
      .filter(r => r.paymentInfo.status === 'paid')
      .reduce((sum, r) => sum + r.paymentInfo.finalAmount, 0);
  }, [organizerRegs]);

  const stats = useMemo(() => {
    const totalRegsCount = organizerRegs.length;
    const checkedInCount = organizerRegs.filter(r => r.checkInStatus === 'checked_in' || r.checkInStatus === 'finished').length;
    
    // Total events combined capacity quota
    const totalSlots = organizerEvents.reduce((acc, e) => acc + e.quota, 0);
    const occupiedSlots = organizerEvents.reduce((acc, e) => acc + e.registeredParticipantsCount, 0);

    return {
      regs: totalRegsCount,
      revenue: cumulativeRevenue,
      checkedIn: checkedInCount,
      checkInRatio: totalRegsCount > 0 ? (checkedInCount / totalRegsCount) * 100 : 0,
      remainingSlots: totalSlots - occupiedSlots
    };
  }, [organizerEvents, organizerRegs, cumulativeRevenue]);

  // 3. FILTER PARTICIPANT LIST
  const filteredParticipantsList = useMemo(() => {
    return organizerRegs.filter(p => {
      const pName = `${p.personalInfo.firstName} ${p.personalInfo.lastName}`.toLowerCase();
      const pEmail = p.personalInfo.email.toLowerCase();
      const pBIB = p.bibNumber.toLowerCase();
      const q = participantSearch.trim().toLowerCase();

      const queryMatches = !q || pName.includes(q) || pEmail.includes(q) || pBIB.includes(q);
      const categoryMatches = participantCategoryFilter === 'all' || p.categoryId === participantCategoryFilter;

      return queryMatches && categoryMatches;
    });
  }, [organizerRegs, participantSearch, participantCategoryFilter]);

  // 4. FILTER CHECKIN LIST
  const checkInFilteredList = useMemo(() => {
    return organizerRegs.filter(p => {
      const pName = `${p.personalInfo.firstName} ${p.personalInfo.lastName}`.toLowerCase();
      const pBIB = p.bibNumber.toLowerCase();
      const q = checkInSearch.trim().toLowerCase();

      return !q || pName.includes(q) || pBIB.includes(q);
    });
  }, [organizerRegs, checkInSearch]);

  // Export mock trigger
  const handleSimulateExport = (format: 'Excel' | 'CSV' | 'PDF') => {
    const dataBlob = new Blob([JSON.stringify(organizerRegs, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `EventHub_Participants_Export.${format.toLowerCase()}`;
    link.click();
  };

  const handleWithdrawalRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (settlementAmount < globalSettings.minWithdrawalAmount) {
      setSettlementSuccessMsg(`Minimum withdrawal amount is IDR ${globalSettings.minWithdrawalAmount.toLocaleString('id-ID')}`);
      return;
    }
    requestWithdrawal(settlementAmount, bankName, accountNum, accountHolder);
    setSettlementSuccessMsg(`Successful. Requested settlement of IDR ${settlementAmount.toLocaleString('id-ID')} pending Super Admin clearance.`);
  };

  return (
    <div className="bg-slate-950 min-h-screen text-slate-150">
      
      {/* Sleek Subheader Indicator for Darkmode admin panels */}
      <div className="bg-slate-900 border-b border-slate-800/80 px-4 py-3 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="h-2 w-2 rounded-full bg-cyan-400 shrink-0" />
          <span className="font-mono text-xs font-bold text-slate-400">ORGANIZER CONTROL SUITE</span>
        </div>
        <div className="flex items-center space-x-4 text-xs font-bold text-slate-400">
          <span>Active Event: Borobudur Marathon 2026</span>
          <span className="rounded-full bg-slate-800 border border-slate-700 px-2.5 py-0.5 text-cyan-400">Escrow Secured</span>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-5">
          
          {/* Left Pinned Sidebar */}
          <div className="lg:col-span-1 space-y-1.5" id="organizer-sidebar">
            {[
              { id: 'overview', label: 'Overview', icon: Activity },
              { id: 'events', label: 'Created Events', icon: Calendar },
              { id: 'participants', label: 'Participants', icon: Users },
              { id: 'checkin', label: 'Check-In System', icon: CheckCircle },
              { id: 'reports', label: 'Reports & Charts', icon: PieChart },
              { id: 'settings', label: 'Settings & Cash', icon: Settings },
            ].map((menu) => {
              const Icon = menu.icon;
              const isActive = activeMenu === menu.id;
              return (
                <button
                  key={menu.id}
                  onClick={() => {
                    setActiveMenu(menu.id as any);
                    setShowCreateForm(false);
                  }}
                  className={`flex w-full items-center space-x-3 rounded-2xl p-4 text-left text-xs font-bold tracking-wide uppercase transition-all ${
                    isActive
                      ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/10'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-850'
                  }`}
                >
                  <Icon className="h-4.5 w-4.5" />
                  <span>{menu.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right Workspace container */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* ======================================= */}
            {/* MODULE 1: OVERVIEW PANELS */}
            {activeMenu === 'overview' && !showCreateForm && (
              <div className="space-y-6">
                
                {/* Statistics Bento Row */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  
                  {/* Revenue */}
                  <div className="rounded-3xl border border-slate-800/80 bg-slate-900 p-5 flex flex-col justify-between h-32">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gross Income</span>
                      <DollarSign className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="font-mono text-xl font-extrabold text-white">
                        IDR {stats.revenue.toLocaleString('id-ID')}
                      </p>
                      <p className="text-[10px] text-slate-400 font-semibold mt-1">Net: Rp {(stats.revenue * 0.965).toLocaleString('id-ID')} (-3.5% Platform fee)</p>
                    </div>
                  </div>

                  {/* Registrations */}
                  <div className="rounded-3xl border border-slate-800/80 bg-slate-900 p-5 flex flex-col justify-between h-32">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Registrants</span>
                      <Users className="h-5 w-5 text-cyan-400" />
                    </div>
                    <div>
                      <p className="font-mono text-xl font-extrabold text-white">
                        {stats.regs} Runners
                      </p>
                      <p className="text-[10px] text-slate-400 font-semibold mt-1">Target cap: 15.000 slots</p>
                    </div>
                  </div>

                  {/* Checkin Ratio */}
                  <div className="rounded-3xl border border-slate-800/80 bg-slate-900 p-5 flex flex-col justify-between h-32">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Live Check-In</span>
                      <CheckCircle className="h-5 w-5 text-cyan-400 animate-pulse" />
                    </div>
                    <div>
                      <p className="font-mono text-xl font-extrabold text-white">
                        {stats.checkedIn} Checked-In
                      </p>
                      <div className="mt-2.5 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-cyan-400 rounded-full" 
                          style={{ width: `${stats.checkInRatio}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Remaining slots */}
                  <div className="rounded-3xl border border-slate-800/80 bg-slate-900 p-5 flex flex-col justify-between h-32">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Unsold slots</span>
                      <Activity className="h-5 w-5 text-orange-400" />
                    </div>
                    <div>
                      <p className="font-mono text-xl font-extrabold text-white">
                        {stats.remainingSlots.toLocaleString('id-ID')} Slots
                      </p>
                      <p className="text-[10px] text-slate-400 font-semibold mt-1">Average sale speed: 12 tkt/day</p>
                    </div>
                  </div>

                </div>

                {/* Live Activity registered log feed */}
                <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
                  <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">REALTIME PAYMENTS LOG</h3>
                  
                  <div className="space-y-3.5">
                    {organizerRegs.slice(0, 5).map((r) => (
                      <div key={r.id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/40 border border-slate-850 text-xs">
                        <div className="flex items-center space-x-3.5">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-[10px] ${
                            r.paymentInfo.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {r.personalInfo.firstName.substring(0,2).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-white font-bold">{r.personalInfo.firstName} {r.personalInfo.lastName}</p>
                            <p className="text-[10px] text-slate-450 mt-0.5">{r.categoryName} • NIK: {r.identityInfo.identityNumber.substring(0,6)}***</p>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="font-mono text-white font-bold">Rp {r.paymentInfo.finalAmount.toLocaleString('id-ID')}</p>
                          <p className="text-[9.5px] text-emerald-400 font-semibold mt-0.5 uppercase tracking-wider">VERIFIED SUCCESS</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* ======================================= */}
            {/* MODULE 2: CREATED EVENTS & CREATE EVENT FLOW */}
            {activeMenu === 'events' && !showCreateForm && (
              <div className="space-y-6">
                
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-sans text-sm font-bold uppercase tracking-wider text-slate-300">Created races catalog</h3>
                  <button
                    onClick={handleStartCreate}
                    className="inline-flex items-center space-x-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-4 py-2 text-xs font-extrabold"
                  >
                    <Plus className="h-4.5 w-4.5" />
                    <span>Create Event</span>
                  </button>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  {organizerEvents.map(evt => (
                    <div key={evt.id} className="rounded-3xl border border-slate-800 bg-slate-900 overflow-hidden text-xs">
                      <div className="relative h-40">
                        <img src={evt.banner} alt={evt.title} className="h-full w-full object-cover opacity-85" />
                        <span className="absolute top-4 left-4 rounded-full bg-slate-950/80 px-2.5 py-1 text-[9px] font-bold text-cyan-400 tracking-wider">
                          {evt.category.toUpperCase()}
                        </span>
                      </div>
                      <div className="p-5 space-y-4">
                        <h4 className="font-sans text-sm font-extrabold text-white">{evt.title}</h4>
                        
                        <div className="space-y-1.5 text-[11px] text-slate-400 font-semibold">
                          <p className="flex items-center space-x-1.5"><MapPin className="h-3.5 w-3.5" /><span>{evt.city}, {evt.province}</span></p>
                          <p className="flex items-center space-x-1.5"><Calendar className="h-3.5 w-3.5" /><span>{evt.date}</span></p>
                        </div>

                        <div className="border-t border-slate-800 pt-3 flex items-center justify-between font-mono text-[10px] font-bold text-slate-500">
                          <span>Registrants: {evt.registeredParticipantsCount} / {evt.quota}</span>
                          <span>Views: {evt.viewsCount}</span>
                        </div>

                        {/* EDIT / DELETE ACTION BUTTONS */}
                        <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
                          <button
                            onClick={() => handleStartEdit(evt)}
                            className="inline-flex items-center space-x-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-cyan-400 px-2.5 py-1.5 font-bold"
                          >
                            <Edit className="h-3.5 w-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => deleteEvent(evt.id)}
                            className="inline-flex items-center space-x-1 rounded-lg bg-red-950/20 hover:bg-red-900/30 text-red-400 px-2.5 py-1.5 font-bold border border-red-900/30"
                          >
                            <Trash className="h-3.5 w-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            )}

            {/* CREATE EVENT WIZARD FORM IN ORG PANEL */}
            {showCreateForm && (
              <form onSubmit={handleCreateEventSubmit} className="rounded-3xl border border-slate-800 bg-slate-900 p-6 md:p-8 space-y-6 text-xs text-slate-350">
                
                <div className="border-b border-slate-800 pb-4">
                  <h3 className="font-sans text-sm font-extrabold text-white leading-none">Draft New Event Profile</h3>
                  <p className="mt-1 text-[11px] text-slate-400">Host your running tournament, marathon or cycling tour.</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400">Event Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Borobudur Ultra-Trail 2026"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                      required
                      className="mt-2 w-full rounded-xl border border-slate-150 bg-slate-950 p-3 font-semibold text-white focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400">Tournament Sport Type</label>
                    <select
                      value={newEvent.category}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, category: e.target.value as any }))}
                      className="mt-2 w-full rounded-xl border border-slate-150 bg-slate-950 p-3 font-semibold text-white focus:outline-hidden"
                    >
                      {['Running', 'Trail Run', 'Cycling', 'Triathlon', 'Festival', 'Seminar', 'Community'].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400">Main Banner Cover image (URL)</label>
                  <input
                    type="url"
                    value={newEvent.banner}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, banner: e.target.value }))}
                    className="mt-2 w-full rounded-xl border border-slate-150 bg-slate-950 p-3 text-white focus:outline-hidden"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400">Province</label>
                    <input
                      type="text"
                      placeholder="e.g. Jawa Tengah"
                      value={newEvent.province}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, province: e.target.value }))}
                      required
                      className="mt-2 w-full rounded-xl border border-slate-150 bg-slate-950 p-3"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400">City / Kabupaten</label>
                    <input
                      type="text"
                      placeholder="e.g. Magelang"
                      value={newEvent.city}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, city: e.target.value }))}
                      required
                      className="mt-2 w-full rounded-xl border border-slate-150 bg-slate-950 p-3"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400">Total Quota Capacity</label>
                    <input
                      type="number"
                      value={newEvent.quota}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, quota: Number(e.target.value) }))}
                      className="mt-2 w-full rounded-xl border border-slate-150 bg-slate-950 p-3"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400">Race Date</label>
                    <input
                      type="date"
                      value={newEvent.date}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, date: e.target.value }))}
                      required
                      className="mt-2 w-full rounded-xl border border-slate-150 bg-slate-950 p-3"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400">Registration Open Date</label>
                    <input
                      type="date"
                      value={newEvent.registrationOpen}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, registrationOpen: e.target.value }))}
                      className="mt-2 w-full rounded-xl border border-slate-150 bg-slate-950 p-3"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400">Registration Close Date</label>
                    <input
                      type="date"
                      value={newEvent.registrationClose}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, registrationClose: e.target.value }))}
                      className="mt-2 w-full rounded-xl border border-slate-150 bg-slate-950 p-3"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400">Complete Venue Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Candi Borobudur Lumbini grounds"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
                    className="mt-2 w-full rounded-xl border border-slate-150 bg-slate-950 p-3"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400">Geography Latitude (Decimal Degrees)</label>
                    <input
                      type="number"
                      step="any"
                      placeholder="e.g. -7.6079"
                      value={newEvent.latitude}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, latitude: Number(e.target.value) }))}
                      required
                      className="mt-2 w-full rounded-xl border border-slate-150 bg-slate-950 p-3"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400">Geography Longitude (Decimal Degrees)</label>
                    <input
                      type="number"
                      step="any"
                      placeholder="e.g. 110.2038"
                      value={newEvent.longitude}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, longitude: Number(e.target.value) }))}
                      required
                      className="mt-2 w-full rounded-xl border border-slate-150 bg-slate-950 p-3"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400">Event Description</label>
                  <textarea
                    rows={3}
                    value={newEvent.description}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                    className="mt-2 w-full rounded-xl border border-slate-150 bg-slate-950 p-3 resize-none"
                  />
                </div>

                {/* CATEGORY MANAGEMENT PANEL INSIDE CREATE FORMS */}
                <div className="border-t border-slate-850 pt-5 space-y-4">
                  <div>
                    <dt className="text-xs font-bold text-white uppercase tracking-wider">Race Class Category Management</dt>
                    <dd className="mt-1 text-[11px] font-normal text-slate-400">Add customizable ticket sub-categories (e.g. 5K, 10K, Half, Full Marathon).</dd>
                  </div>

                  <div className="space-y-2.5">
                    {newEventCategories.map((c, i) => (
                      <div key={i} className="flex justify-between items-center p-3 rounded-2xl border border-slate-800 bg-slate-950/40 font-mono text-[11px]">
                        <div>
                          <p className="text-white font-bold">{c.name}</p>
                          <p className="text-slate-400 text-[10px] mt-0.5">Quota: {c.quota} slots | Jersey & Medal included</p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="font-sans text-cyan-400 font-bold">Rp {c.price.toLocaleString('id-ID')}</span>
                          <button 
                            type="button" 
                            onClick={() => setNewEventCategories(prev => prev.filter((_, idx) => idx !== i))}
                            className="text-red-400 hover:text-red-500"
                          >
                            <Trash className="h-4 w-4 shrink-0" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add Class Mini Form */}
                  <div className="grid gap-3 sm:grid-cols-3 items-end p-4 rounded-3xl border border-slate-800 bg-slate-950/20">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400">Class Name</label>
                      <input 
                        type="text" 
                        placeholder="e.g. 21K Half Marathon" 
                        value={newCatName}
                        onChange={(e) => setNewCatName(e.target.value)}
                        className="mt-2 w-full rounded-xl border border-slate-150 bg-slate-950 p-2.5 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400">Quota</label>
                      <input 
                        type="number" 
                        value={newCatQuota}
                        onChange={(e) => setNewCatQuota(Number(e.target.value))}
                        className="mt-2 w-full rounded-xl border border-slate-150 bg-slate-950 p-2.5 text-white"
                      />
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="block text-[10px] font-bold text-slate-400">Entry price (IDR)</label>
                        <input 
                          type="number" 
                          value={newCatPrice}
                          onChange={(e) => setNewCatPrice(Number(e.target.value))}
                          className="mt-2 w-full rounded-xl border border-slate-150 bg-slate-950 p-2.5 text-white"
                        />
                      </div>
                      <button 
                        type="button"
                        onClick={handleAddCategoryToNewEvent}
                        className="rounded-xl bg-slate-800 text-white font-bold text-xs p-3 hover:bg-slate-700"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>

                {/* Form submissions action */}
                <div className="border-t border-slate-800 pt-6 flex justify-end space-x-3.5">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="rounded-xl border border-slate-800 p-3 bg-white hover:bg-slate-100 text-slate-950 font-bold"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold px-6 py-3 shadow-lg shadow-cyan-400/10"
                  >
                    Host Tournament
                  </button>
                </div>

              </form>
            )}

            {/* ======================================= */}
            {/* MODULE 3: PARTICIPANTS DIRECTORY TABLE */}
            {activeMenu === 'participants' && (
              <div className="space-y-6">
                
                <h3 className="font-sans text-sm font-bold uppercase tracking-wider text-slate-350 mb-1">Participants Database</h3>
                
                {/* Advanced Search Strip */}
                <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  
                  <div className="relative flex-1">
                    <Search className="absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Filter by Name, NIK, or BIB allocation..."
                      value={participantSearch}
                      onChange={(e) => setParticipantSearch(e.target.value)}
                      className="w-full rounded-xl border border-slate-150 bg-slate-950 py-2.5 pl-9 pr-4 font-semibold text-white focus:outline-hidden"
                      id="org-participant-search"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <select
                      value={participantCategoryFilter}
                      onChange={(e) => setParticipantCategoryFilter(e.target.value)}
                      className="rounded-xl border border-slate-150 bg-slate-950 text-slate-400 font-bold text-xs p-2.5"
                    >
                      <option value="all">Categories: All</option>
                      <option value="42k">Full Marathon (42K)</option>
                      <option value="21k">Half Marathon (21K)</option>
                      <option value="10k">10K Run</option>
                      <option value="trail-100k">100K Trail</option>
                      <option value="tri-olympic">Olympic Distance</option>
                    </select>

                    <button
                      onClick={() => handleSimulateExport('Excel')}
                      className="rounded-xl bg-slate-800 hover:bg-slate-750 px-3.5 py-2 text-xs font-bold text-white flex items-center space-x-1"
                    >
                      <Download className="h-4 w-4 text-slate-400 shrink-0" />
                      <span>XLS</span>
                    </button>

                    <button
                      onClick={() => handleSimulateExport('PDF')}
                      className="rounded-xl bg-slate-800 hover:bg-slate-750 px-3.5 py-2 text-xs font-bold text-white flex items-center space-x-1"
                    >
                      <Download className="h-4 w-4 text-slate-400 shrink-0" />
                      <span>PDF</span>
                    </button>

                    <button
                      onClick={() => setShowManualRegForm(!showManualRegForm)}
                      className="rounded-xl bg-cyan-500 hover:bg-cyan-400 px-3.5 py-2 text-xs font-extrabold text-slate-950 flex items-center space-x-1"
                    >
                      <Plus className="h-4 w-4 text-slate-950 shrink-0" />
                      <span>Manual Registration</span>
                    </button>
                  </div>

                </div>

                {showManualRegForm && (
                  <form onSubmit={handleManualRegSubmit} className="rounded-3xl border border-slate-800 bg-slate-900 p-6 md:p-8 space-y-4 text-xs text-slate-350">
                    <div className="border-b border-slate-800 pb-3">
                      <h4 className="font-sans text-sm font-bold text-white leading-none">Manual Participant Registration</h4>
                      <p className="mt-1 text-[11px] text-slate-400">Directly inject an athlete entry without checkout processes.</p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-400">Target Event Name</label>
                        <select
                          value={manualReg.eventId}
                          onChange={(e) => {
                            const eventVal = e.target.value;
                            const currentTarget = events.find(evt => evt.id === eventVal);
                            const firstCatId = currentTarget?.categories[0]?.id || '';
                            setManualReg(prev => ({ ...prev, eventId: eventVal, categoryId: firstCatId }));
                          }}
                          required
                          className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 font-bold text-white"
                        >
                          <option value="">-- Choose Campaign Event --</option>
                          {events.map(ev => (
                            <option key={ev.id} value={ev.id}>{ev.title}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-400">Race Category Class</label>
                        <select
                          value={manualReg.categoryId}
                          onChange={(e) => setManualReg(prev => ({ ...prev, categoryId: e.target.value }))}
                          required
                          className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 font-bold text-white"
                        >
                          <option value="">-- Choose Category Class --</option>
                          {events.find(e => e.id === manualReg.eventId)?.categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name} (Rp {cat.price.toLocaleString('id-ID')})</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-400">First Name</label>
                        <input
                          type="text"
                          required
                          value={manualReg.firstName}
                          onChange={(e) => setManualReg(prev => ({ ...prev, firstName: e.target.value }))}
                          className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-400">Last Name</label>
                        <input
                          type="text"
                          required
                          value={manualReg.lastName}
                          onChange={(e) => setManualReg(prev => ({ ...prev, lastName: e.target.value }))}
                          className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-400">E-mail Address</label>
                        <input
                          type="email"
                          required
                          value={manualReg.email}
                          onChange={(e) => setManualReg(prev => ({ ...prev, email: e.target.value }))}
                          className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-4">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-400">WhatsApp Phone</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 0812345678"
                          value={manualReg.phoneNumber}
                          onChange={(e) => setManualReg(prev => ({ ...prev, phoneNumber: e.target.value }))}
                          className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-400">ID Type</label>
                        <select
                          value={manualReg.identityType}
                          onChange={(e) => setManualReg(prev => ({ ...prev, identityType: e.target.value as any }))}
                          className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white"
                        >
                          <option value="KTP">KTP/NIK (Indonesian ID)</option>
                          <option value="Passport">Passport</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-400">ID / Passport Number</label>
                        <input
                          type="text"
                          required
                          placeholder="NIK Number"
                          value={manualReg.identityNumber}
                          onChange={(e) => setManualReg(prev => ({ ...prev, identityNumber: e.target.value }))}
                          className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-400">Jersey Size</label>
                        <select
                          value={manualReg.jerseySize}
                          onChange={(e) => setManualReg(prev => ({ ...prev, jerseySize: e.target.value }))}
                          className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white"
                        >
                          <option value="S">S</option>
                          <option value="M">M</option>
                          <option value="L">L</option>
                          <option value="XL">XL</option>
                          <option value="XXL">XXL</option>
                        </select>
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end space-x-2">
                      <button
                        type="button"
                        onClick={() => setShowManualRegForm(false)}
                        className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 hover:bg-slate-800 text-slate-350 font-bold"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-5 py-2.5 font-extrabold"
                      >
                        Admit Participant
                      </button>
                    </div>
                  </form>
                )}

                {/* Database Table layout */}
                <div className="rounded-3xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xs">
                  <div className="overflow-x-auto custom-scrollbar-dark leading-normal">
                    <table className="w-full text-left border-collapse font-sans text-xs">
                      <thead>
                        <tr className="bg-slate-950 font-bold uppercase text-[10px] text-slate-400 border-b border-slate-800">
                          <th className="p-4">BIB / ID</th>
                          <th className="p-4">Participant Name</th>
                          <th className="p-4">Race Class</th>
                          <th className="p-4">Identity Details</th>
                          <th className="p-4">Emergency Contact</th>
                          <th className="p-4 text-right">Status</th>
                          <th className="p-4 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 text-slate-300">
                        {filteredParticipantsList.map((p) => (
                          <tr key={p.id} className="hover:bg-slate-850 transition-colors">
                            <td className="p-4 font-mono font-bold">
                              <span className="rounded-md bg-cyan-900/40 text-cyan-400 px-2 py-0.5 border border-cyan-800/50">
                                {p.bibNumber}
                              </span>
                              <p className="text-[10px] text-slate-500 mt-1">{p.id}</p>
                            </td>
                            <td className="p-4">
                              <p className="font-bold text-white">{p.personalInfo.firstName} {p.personalInfo.lastName}</p>
                              <p className="text-[10px] text-slate-450 mt-0.5">{p.personalInfo.email}</p>
                            </td>
                            <td className="p-4 font-semibold text-slate-300">
                              {p.categoryName}
                              <p className="text-[10px] text-slate-500 mt-1">Jersey: {p.jerseyInfo.size} ({p.jerseyInfo.cutType})</p>
                            </td>
                            <td className="p-4 font-mono leading-relaxed text-slate-400">
                              <p>{p.identityInfo.identityType}: {p.identityInfo.identityNumber}</p>
                              <p className="text-[10px] text-slate-500 mt-0.5">Blood: {p.medicalInfo.bloodType}</p>
                            </td>
                            <td className="p-4">
                              <p className="font-semibold text-slate-350">{p.emergencyInfo.name}</p>
                              <p className="text-[10px] text-slate-500 mt-0.5">({p.emergencyInfo.relationship}) {p.emergencyInfo.phoneNumber}</p>
                            </td>
                            <td className="p-4 text-right">
                              <span className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider ${
                                p.checkInStatus === 'finished' 
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-800/40'
                                  : p.checkInStatus === 'checked_in'
                                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-800/40'
                                    : 'bg-amber-500/10 text-amber-400 border border-amber-800/40'
                              }`}>
                                {p.checkInStatus.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              <button
                                onClick={() => deleteRegistration(p.id)}
                                className="rounded-lg bg-red-950/20 hover:bg-red-900/30 text-red-400 p-1.5 border border-red-900/30"
                                title="Cancel Registration"
                              >
                                <Trash className="h-3.5 w-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {/* ======================================= */}
            {/* MODULE 4: CHECK-IN SCANNING SYSTEM */}
            {activeMenu === 'checkin' && (
              <div className="space-y-6">
                
                <div>
                  <h3 className="font-sans text-sm font-bold uppercase tracking-wider text-slate-350 leading-none">CHECK-IN & RACE PACK COUNTER</h3>
                  <p className="mt-1 text-xs text-slate-400">Simulate check-ins by scanning a code or searching profiles. Updates BIB and statistics immediately.</p>
                </div>

                {/* Checkin Search box */}
                <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4">
                  <div className="relative">
                    <Search className="absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Type BIB number or Athlete Name..."
                      value={checkInSearch}
                      onChange={(e) => setCheckInSearch(e.target.value)}
                      className="w-full rounded-xl border border-slate-150 bg-slate-950 py-2.5 pl-9 pr-4 font-semibold text-white focus:outline-hidden"
                      id="check-in-search"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  {checkInFilteredList.map((p) => (
                    <div key={p.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      
                      <div className="flex items-center space-x-3.5">
                        <div className="rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400 font-mono font-bold text-xs px-2.5 py-1.5 shrink-0">
                          BIB {p.bibNumber}
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-xs">{p.personalInfo.firstName} {p.personalInfo.lastName}</h4>
                          <p className="text-[10px] text-slate-400 mt-0.5">{p.categoryName} • NIK: {p.identityInfo.identityNumber}</p>
                        </div>
                      </div>

                      {/* Status select switches */}
                      <div className="flex flex-wrap items-center gap-2">
                        {[
                          { id: 'registered', label: 'Registered' },
                          { id: 'checked_in', label: 'Checked In' },
                          { id: 'race_pack_collected', label: 'Race Pack Collected' },
                          { id: 'finished', label: 'Finisher Status' },
                          { id: 'dnf', label: 'DNF' },
                        ].map((st) => {
                          const isCurrent = p.checkInStatus === st.id;
                          return (
                            <button
                              key={st.id}
                              onClick={() => {
                                updateCheckInStatus(p.id, st.id as any);
                              }}
                              className={`rounded-lg px-2.5 py-1.5 text-[10px] font-bold tracking-wide uppercase transition-colors ${
                                isCurrent
                                  ? 'bg-cyan-500 text-slate-950 font-extrabold'
                                  : 'bg-slate-800 hover:bg-slate-750 text-slate-400'
                              }`}
                            >
                              {st.label}
                            </button>
                          );
                        })}
                      </div>

                    </div>
                  ))}
                </div>

              </div>
            )}

            {/* ======================================= */}
            {/* MODULE 5: REPORTING & ANALYTICS CHARTS */}
            {activeMenu === 'reports' && (
              <div className="space-y-6">
                
                <h3 className="font-sans text-sm font-bold uppercase tracking-wider text-slate-350">Analytics Visualizations</h3>

                {/* Row 1: Revenue trend custom animated SVG graph */}
                <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">REVENUE PROGRESSION</p>
                      <h4 className="mt-1.5 text-sm font-bold text-white">Daily Sales Volumes (IDR Millions)</h4>
                    </div>
                    <TrendingUp className="h-5 w-5 text-cyan-400" />
                  </div>

                  {/* SVG Line / Bar chart representation cleanly typed */}
                  <div className="h-44 w-full pt-4">
                    <svg viewBox="0 0 500 120" className="w-full h-full overflow-visible">
                      <defs>
                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#22D3EE" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      
                      {/* Grid lines */}
                      <line x1="0" y1="20" x2="500" y2="20" stroke="#1E293B" strokeWidth="1" strokeDasharray="4 4" />
                      <line x1="0" y1="60" x2="500" y2="60" stroke="#1E293B" strokeWidth="1" strokeDasharray="4 4" />
                      <line x1="0" y1="100" x2="500" y2="100" stroke="#1E293B" strokeWidth="1" strokeDasharray="4 4" />

                      {/* Area beneath curve */}
                      <path 
                        d="M0,100 Q60,80 120,50 T240,65 T360,20 T480,10 L500,10 L500,110 L0,110 Z" 
                        fill="url(#chartGradient)" 
                      />

                      {/* Spline Path */}
                      <path 
                        d="M0,100 Q60,80 120,50 T240,65 T360,20 T480,10 L500,10" 
                        fill="none" 
                        stroke="#22D3EE" 
                        strokeWidth="3.5" 
                        strokeLinecap="round"
                      />

                      {/* Vertices */}
                      <circle cx="120" cy="50" r="4.5" fill="#22D3EE" stroke="#0F172A" strokeWidth="1.5" className="cursor-pointer" />
                      <circle cx="240" cy="65" r="4.5" fill="#22D3EE" stroke="#0F172A" strokeWidth="1.5" className="cursor-pointer" />
                      <circle cx="360" cy="20" r="4.5" fill="#22D3EE" stroke="#0F172A" strokeWidth="1.5" className="cursor-pointer" />
                      <circle cx="480" cy="10" r="4.5" fill="#22D3EE" stroke="#0F172A" strokeWidth="1.5" className="cursor-pointer" />
                    </svg>

                    <div className="mt-2.5 flex justify-between font-mono text-[9px] font-semibold text-slate-500">
                      <span>MON 01-Jun</span>
                      <span>WED 03-Jun</span>
                      <span>FRI 05-Jun</span>
                      <span>SUN (TODAY)</span>
                    </div>
                  </div>
                </div>

                {/* Demographics details info */}
                <div className="grid gap-6 sm:grid-cols-2 text-xs font-semibold">
                  
                  {/* Category shares */}
                  <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5">
                    <h4 className="text-[10px] font-bold uppercase text-slate-400 mb-4">CATEGORY ALLOCATIONS BREAKDOWN</h4>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between font-bold mb-1">
                          <span className="text-white">Full Marathon (42K)</span>
                          <span className="text-cyan-400">42% shares</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-cyan-400 rounded-full w-[42%]" />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between font-bold mb-1">
                          <span className="text-white">Half Marathon (21K)</span>
                          <span className="text-cyan-400">35% shares</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-cyan-400 rounded-full w-[35%]" />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between font-bold mb-1">
                          <span className="text-white">10K Run Series</span>
                          <span className="text-cyan-400">23% shares</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-cyan-400 rounded-full w-[23%]" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Gender and demographical splits */}
                  <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5 flex flex-col justify-between">
                    <div>
                      <h4 className="text-[10px] font-bold uppercase text-slate-400 mb-4">GENDER DEMOGRAPHIC SPLITS</h4>
                      <p className="text-[10px] text-slate-450 leading-normal">
                        Based on checked identity passports and NIK verification arrays, runners skew towards high male shares.
                      </p>
                    </div>

                    <div className="flex items-center space-x-10 mt-4">
                      <div className="text-center flex-1">
                        <p className="font-mono text-xl font-bold text-cyan-400">64%</p>
                        <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider mt-0.5">Male Runners</p>
                      </div>
                      <div className="text-center flex-1 border-l border-slate-800">
                        <p className="font-mono text-xl font-bold text-pink-400">36%</p>
                        <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider mt-0.5">Female Runners</p>
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* ======================================= */}
            {/* MODULE 6: SETTINGS, BANK PROFILE & WITHDRAWALS */}
            {activeMenu === 'settings' && (
              <div className="space-y-6">
                
                {/* Bank Settlements config form */}
                <form onSubmit={handleWithdrawalRequestSubmit} className="rounded-3xl border border-slate-800 bg-slate-900 p-6 md:p-8 space-y-6 text-xs text-slate-350">
                  <div>
                    <dt className="text-sm font-extrabold text-white flex items-center space-x-1.5 leading-none">
                      <Landmark className="h-5 w-5 text-cyan-400" />
                      <span>Bank Settlement Profile</span>
                    </dt>
                    <dd className="mt-1 text-slate-400">Min withdrawal: Rp {globalSettings.minWithdrawalAmount.toLocaleString('id-ID')}. Escrows are cleared daily at 23:59 WIB.</dd>
                  </div>

                  {settlementSuccessMsg && (
                    <div className="p-4 rounded-xl border border-cyan-800 bg-cyan-950/40 text-cyan-400 font-sans font-bold leading-normal">
                      {settlementSuccessMsg}
                    </div>
                  )}

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400">Bank Name Preference</label>
                      <select 
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        className="mt-2 w-full rounded-xl border border-slate-150 bg-slate-950 p-3 text-white focus:outline-hidden"
                      >
                        <option value="BCA">Bank Central Asia (BCA)</option>
                        <option value="Mandiri">Bank Mandiri</option>
                        <option value="BNI">Bank Negara Indonesia (BNI)</option>
                        <option value="BRI">Bank Rakyat Indonesia (BRI)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400">Account Number</label>
                      <input 
                        type="text" 
                        value={accountNum}
                        onChange={(e) => setAccountNum(e.target.value)}
                        required
                        className="mt-2 w-full rounded-xl border border-slate-150 bg-slate-950 p-3 text-white focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400">Account Holder Name</label>
                      <input 
                        type="text" 
                        value={accountHolder}
                        onChange={(e) => setAccountHolder(e.target.value)}
                        required
                        className="mt-2 w-full rounded-xl border border-slate-150 bg-slate-950 p-3 text-white focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400">Withdrawal Amount (IDR)</label>
                    <input 
                      type="number" 
                      value={settlementAmount}
                      onChange={(e) => setSettlementAmount(Number(e.target.value))}
                      className="mt-2 w-full rounded-xl border border-slate-150 bg-slate-950 p-3 font-mono font-bold text-white text-sm"
                    />
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      className="rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold px-6 py-3 shadow-md transition-colors"
                      id="request-settlement-btn"
                    >
                      Request Escrow Settlement
                    </button>
                  </div>
                </form>

                {/* Email Notification Settings section */}
                <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 md:p-8 space-y-6">
                  <div>
                    <h3 className="text-sm font-extrabold text-white flex items-center space-x-1.5 leading-none">
                      <Mail className="h-5 w-5 text-cyan-400" />
                      <span>Email Notification Settings</span>
                    </h3>
                    <p className="mt-1 text-xs text-slate-400">
                      Configure granular settings for automated simulated client notifications triggered by pendaftar or billing actions.
                    </p>
                  </div>

                  <div className="space-y-4 font-sans text-xs">
                    {/* Toggle: Registration Confirmation */}
                    <label 
                      htmlFor="toggle-reg-email"
                      className="flex items-start p-4 rounded-2xl bg-slate-950/40 border border-slate-850 hover:bg-slate-950/60 transition-colors cursor-pointer select-none"
                    >
                      <input 
                        id="toggle-reg-email"
                        type="checkbox" 
                        checked={organizerEmailSettings?.registrationConfirmation ?? true}
                        onChange={(e) => updateOrganizerEmailSettings({ registrationConfirmation: e.target.checked })}
                        className="mt-0.5 h-4 w-4 rounded-sm border-slate-800 text-cyan-400 focus:ring-cyan-400 accent-cyan-400"
                      />
                      <div className="ml-3.5 space-y-0.5">
                        <span className="block font-extrabold text-white">Event Registration Confirmation (Email Verifikasi / Pendaftaran)</span>
                        <span className="block text-slate-400">Send an automated technical instructions PDF / confirmation voucher immediately after participant joins.</span>
                      </div>
                    </label>

                    {/* Toggle: Payment Receipt */}
                    <label 
                      htmlFor="toggle-receipt-email"
                      className="flex items-start p-4 rounded-2xl bg-slate-950/40 border border-slate-850 hover:bg-slate-950/60 transition-colors cursor-pointer select-none"
                    >
                      <input 
                        id="toggle-receipt-email"
                        type="checkbox" 
                        checked={organizerEmailSettings?.paymentReceipt ?? true}
                        onChange={(e) => updateOrganizerEmailSettings({ paymentReceipt: e.target.checked })}
                        className="mt-0.5 h-4 w-4 rounded-sm border-slate-800 text-cyan-400 focus:ring-cyan-400 accent-cyan-400"
                      />
                      <div className="ml-3.5 space-y-0.5">
                        <span className="block font-extrabold text-white">Official Payments and Kuitansi Receipt (Email Kuitansi)</span>
                        <span className="block text-slate-400">Send an official tax-compliant ID receipt and QR check-in ticket immediately when payment status changes to success.</span>
                      </div>
                    </label>

                    {/* Toggle: Payment Reminder / Billing */}
                    <label 
                      htmlFor="toggle-reminder-email"
                      className="flex items-start p-4 rounded-2xl bg-slate-950/40 border border-slate-850 hover:bg-slate-950/60 transition-colors cursor-pointer select-none"
                    >
                      <input 
                        id="toggle-reminder-email"
                        type="checkbox" 
                        checked={organizerEmailSettings?.paymentReminder ?? true}
                        onChange={(e) => updateOrganizerEmailSettings({ paymentReminder: e.target.checked })}
                        className="mt-0.5 h-4 w-4 rounded-sm border-slate-800 text-cyan-400 focus:ring-cyan-450 accent-cyan-400"
                      />
                      <div className="ml-3.5 space-y-0.5">
                        <span className="block font-extrabold text-white">Payment Reminder & Billing Invoice (Email Invoice)</span>
                        <span className="block text-slate-400">Send pending payment invoice reminders prompting participants to pay via secure payment gateways.</span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Withdrawal History Log list */}
                <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
                  <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">SETTLEMENT TRANSACTION HISTORY</h3>
                  
                  <div className="space-y-3.5 text-xs text-slate-350">
                    {withdrawals.map((w) => (
                      <div key={w.id} className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/40 border border-slate-850">
                        <div>
                          <p className="font-mono text-white font-bold">{w.id} • IDR {w.amount.toLocaleString('id-ID')}</p>
                          <p className="text-[10px] text-slate-450 mt-1">Requested on {w.date} to {w.bankName} Account {w.accountNumber}</p>
                        </div>

                        <span className={`rounded-xl px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wider ${
                          w.status === 'approved' 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-900/40' 
                            : 'bg-amber-500/10 text-amber-500 border border-amber-900/40'
                        }`}>
                          {w.status.toUpperCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

          </div>

        </div>
      </div>

    </div>
  );
};
