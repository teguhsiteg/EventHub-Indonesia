/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, IndonesianEvent, Registration, Coupon, Withdrawal, 
  SystemAnnouncement, AppNotification, GlobalSettings, Category, SimulatedEmail,
  OrganizerEmailSettings
} from '../types';
import { 
  INITIAL_EVENTS, INITIAL_REGISTRATIONS, INITIAL_COUPONS, 
  INITIAL_WITHDRAWALS, INITIAL_ANNOUNCEMENTS 
} from '../data/initialData';

interface AppContextType {
  currentUser: User;
  userRole: 'super_admin' | 'organizer' | 'participant';
  changeRole: (role: 'super_admin' | 'organizer' | 'participant') => void;
  updateCurrentUser: (userData: Partial<User>) => void;
  deleteUserAccount: () => void;
  
  events: IndonesianEvent[];
  addEvent: (event: Omit<IndonesianEvent, 'id' | 'registeredParticipantsCount' | 'viewsCount'> & { categories: Category[] }) => IndonesianEvent;
  updateEvent: (event: IndonesianEvent) => void;
  deleteEvent: (id: string) => void;
  incrementViews: (eventId: string) => void;
  
  registrations: Registration[];
  addRegistration: (registration: Omit<Registration, 'id' | 'ticketNumber' | 'bibNumber' | 'createdAt' | 'checkInStatus'>) => Registration;
  updateCheckInStatus: (regId: string, status: Registration['checkInStatus']) => void;
  updatePaymentStatus: (regId: string, status: Registration['paymentInfo']['status']) => void;
  deleteRegistration: (id: string) => void;
  
  coupons: Coupon[];
  addCoupon: (coupon: Omit<Coupon, 'id' | 'usedCount'>) => void;
  updateCoupon: (coupon: Coupon) => void;
  useCoupon: (code: string) => Coupon | null;
  deleteCoupon: (id: string) => void;
  
  withdrawals: Withdrawal[];
  requestWithdrawal: (amount: number, bankName: string, accountNumber: string, holderName: string) => void;
  updateWithdrawStatus: (id: string, status: Withdrawal['status']) => void;
  
  announcements: SystemAnnouncement[];
  addAnnouncement: (title: string, message: string, target: SystemAnnouncement['targetRole']) => void;
  updateAnnouncement: (announcement: SystemAnnouncement) => void;
  deleteAnnouncement: (id: string) => void;
  
  notifications: AppNotification[];
  addNotification: (title: string, message: string, type: AppNotification['type']) => void;
  markNotificationsAsRead: () => void;
  
  globalSettings: GlobalSettings;
  updateGlobalSettings: (settings: GlobalSettings) => void;
  
  organizerEmailSettings: OrganizerEmailSettings;
  updateOrganizerEmailSettings: (settings: Partial<OrganizerEmailSettings>) => void;

  theme: 'light' | 'dark';
  toggleTheme: () => void;

  language: 'id' | 'en';
  setLanguage: (lang: 'id' | 'en') => void;
  t: (key: string) => string;

  emails: SimulatedEmail[];
  sendSimulatedEmail: (to: string, subject: string, body: string, type: SimulatedEmail['type'], metadata?: SimulatedEmail['metadata']) => void;
  deleteEmail: (id: string) => void;
  markEmailAsRead: (id: string) => void;
  clearAllEmails: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const SEED_VERSION = 'eventhub_v1.2';

const DEFAULT_SETTINGS: GlobalSettings = {
  platformName: 'EventHub Indonesia',
  platformFeePct: 3.5,
  minWithdrawalAmount: 100000,
  smsNotificationEnabled: true,
  emailNotificationEnabled: true,
  whatsAppNotificationsEnabled: true
};

const TRANSLATIONS: Record<string, Record<'id' | 'en', string>> = {
  // Navigation
  home: { id: 'Beranda', en: 'Home' },
  explore: { id: 'Eksplorasi', en: 'Explore' },
  dashboard: { id: 'Dasbor Saya', en: 'My Dashboard' },
  
  // Roles
  role: { id: 'Peran', en: 'Role' },
  participant: { id: 'Peserta', en: 'Participant' },
  organizer: { id: 'Penyelenggara', en: 'Event Organizer' },
  super_admin: { id: 'Super Admin', en: 'Super Admin' },
  
  // FAQ section
  faq_title: { id: 'Pertanyaan yang Sering Diajukan', en: 'Frequently Asked Questions' },
  faq_desc: { id: 'Segala hal yang perlu Anda ketahui sebagai penggemar olahraga, pelari maraton, atau penyelenggara acara profesional di EventHubID.', en: 'Everything you need to know as a sports enthusiast, marathon runner, or professional event organizer on EventHubID.' },
  faq_subtitle: { id: 'Ada Pertanyaan?', en: 'Got Questions?' },
  all_questions: { id: 'Semua Pertanyaan', en: 'All Questions' },
  for_participants: { id: 'Untuk Peserta', en: 'For Participants' },
  for_organizers: { id: 'Untuk Penyelenggara', en: 'For Organizers' },
  
  // Hero section
  hero_tag: { id: 'PLATFORM MANAJEMEN EVENT OLAHRAGA TERINTEGRASI #1', en: '#1 INTEGRATED SPORT EVENT MANAGEMENT PLATFORM' },
  hero_title_1: { id: 'Taklukkan Batasmu di ', en: 'Push Your Limits Across ' },
  hero_title_2: { id: 'Event Olahraga Terbesar Nusantara', en: 'The Archipelago\'s Biggest Races' },
  hero_desc: { id: 'Platform registrasi otomatis dengan validasi rute presisi, pembagian nomor seri BIB cerdas, serta integrasi e-KTP dan e-Passport aman.', en: 'Automated registration platform with precise route track mapping, smart BIB series division, escrow ticketing, and secured credentials.' },
  btn_register_explore: { id: 'Mulai Jelajah', en: 'Start Exploring' },
  btn_host_event: { id: 'Buat Event Baru', en: 'Host an Event' },
  how_it_works: { id: 'Cara Kerja EventHubID', en: 'How EventHubID Works' },
  step1_title: { id: '1. Jelajahi Turnamen', en: '1. Browse Tournaments' },
  step2_title: { id: '2. Registrasi Kilat', en: '2. Express Checkout' },
  step3_title: { id: '3. Scan QR On-Site', en: '3. On-Site Check-In' },
  step1_desc: { id: 'Temukan ratusan turnamen di peta interaktif dari lari, sepeda, hingga triatlon.', en: 'Discover hundreds of tournaments on the interactive map from running, cycling, to triathlons.' },
  step2_desc: { id: 'Registrasi dalam hitungan menit secara aman dengan pilihan metode pembayaran instan terlengkap.', en: 'Secure registration in minutes using the most complete instant local and international payment methods.' },
  step3_desc: { id: 'Gunakan tiket QR di dashboard Anda saat pengambilan paket lomba secara instan tanpa cetak fisik.', en: 'Present your interactive Ticket QR code on your dashboard for fast, completely digital on-the-spot race pack retrieval.' },
  
  // Map / Marketplace
  explore_desc: { id: 'Cari dan daftarkan diri Anda di turnamen balap terbaik di seluruh nusantara.', en: 'Browse and register for premium racing tournaments across the archipelago.' },
  live_map: { id: 'Peta Interaktif Nusantara', en: 'Archipelago Interactive Live Map' },
  featured_events: { id: 'Turnamen Unggulan', en: 'Featured Tournaments' },
  all_events: { id: 'Semua Event Olahraga', en: 'All Sport Events' },
  register_now: { id: 'Daftar Sekarang', en: 'Register Now' },
  event_detail: { id: 'Detail Event', en: 'Event Detail' },
  countdown: { id: 'Hitung Mundur Acara', en: 'Event Start Countdown' },
  news_bar: { id: 'Siaran Resmi Sistem', en: 'Official System Broadcast' },
  dismiss: { id: 'Tutup', en: 'Dismiss' },
  search_placeholder: { id: 'Cari rute, kota pemandangan, nama lari...', en: 'Search routes, scenic cities, race names...' },
  no_events_found: { id: 'Tidak ada event olahraga yang cocok dengan pencarian Anda.', en: 'No sporting tournaments matched your criteria.' },
  
  // Dates and locations
  location: { id: 'Lokasi', en: 'Location' },
  date: { id: 'Tanggal', en: 'Date' },
  quota: { id: 'Kuota', en: 'Quota' },
  price: { id: 'Harga', en: 'Price' },
  slot_remaining: { id: 'sisa slot', en: 'slots left' },
  
  // Time units
  days: { id: 'Hari', en: 'Days' },
  hours: { id: 'Jam', en: 'Hours' },
  mins: { id: 'Menit', en: 'Mins' },
  secs: { id: 'Detik', en: 'Secs' },
  
  // Statuses / Filters
  all: { id: 'Semua', en: 'All' },
  running: { id: 'Lari', en: 'Running' },
  cycling: { id: 'Sepeda', en: 'Cycling' },
  swimming: { id: 'Renang', en: 'Swimming' },
  triathlon: { id: 'Triatlon', en: 'Triathlon' }
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load state from localStorage or seed
  const [userRole, setUserRole] = useState<'super_admin' | 'organizer' | 'participant'>(() => {
    const saved = localStorage.getItem('eh_role');
    return (saved as any) || 'participant';
  });

  const [events, setEvents] = useState<IndonesianEvent[]>(() => {
    const ver = localStorage.getItem('eh_seed_version');
    if (ver !== SEED_VERSION) {
      localStorage.setItem('eh_seed_version', SEED_VERSION);
      localStorage.setItem('eh_events', JSON.stringify(INITIAL_EVENTS));
      return INITIAL_EVENTS;
    }
    const saved = localStorage.getItem('eh_events');
    return saved ? JSON.parse(saved) : INITIAL_EVENTS;
  });

  const [registrations, setRegistrations] = useState<Registration[]>(() => {
    const ver = localStorage.getItem('eh_seed_version');
    if (ver !== SEED_VERSION) {
      localStorage.setItem('eh_registrations', JSON.stringify(INITIAL_REGISTRATIONS));
      return INITIAL_REGISTRATIONS;
    }
    const saved = localStorage.getItem('eh_registrations');
    return saved ? JSON.parse(saved) : INITIAL_REGISTRATIONS;
  });

  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    const ver = localStorage.getItem('eh_seed_version');
    if (ver !== SEED_VERSION) {
      localStorage.setItem('eh_coupons', JSON.stringify(INITIAL_COUPONS));
      return INITIAL_COUPONS;
    }
    const saved = localStorage.getItem('eh_coupons');
    return saved ? JSON.parse(saved) : INITIAL_COUPONS;
  });

  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>(() => {
    const ver = localStorage.getItem('eh_seed_version');
    if (ver !== SEED_VERSION) {
      localStorage.setItem('eh_withdrawals', JSON.stringify(INITIAL_WITHDRAWALS));
      return INITIAL_WITHDRAWALS;
    }
    const saved = localStorage.getItem('eh_withdrawals');
    return saved ? JSON.parse(saved) : INITIAL_WITHDRAWALS;
  });

  const [announcements, setAnnouncements] = useState<SystemAnnouncement[]>(() => {
    const ver = localStorage.getItem('eh_seed_version');
    if (ver !== SEED_VERSION) {
      localStorage.setItem('eh_announcements', JSON.stringify(INITIAL_ANNOUNCEMENTS));
      return INITIAL_ANNOUNCEMENTS;
    }
    const saved = localStorage.getItem('eh_announcements');
    return saved ? JSON.parse(saved) : INITIAL_ANNOUNCEMENTS;
  });

  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const [emails, setEmails] = useState<SimulatedEmail[]>(() => {
    const saved = localStorage.getItem('eh_simulated_emails');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (err) {}
    }
    return [
      {
        id: 'email-welcome',
        to: 'budi.santoso@gmail.com',
        subject: '✉️ [EventHub] Verifikasi Email Akun Anda Berhasil!',
        body: `
<h2>Halo Budi Santoso,</h2>
<p>Selamat datang di <strong>EventHub Indonesia</strong>! Akun Anda telah berhasil didaftarkan dan diverifikasi secara aman oleh sistem keamanan terintegritas kami.</p>
<p>Anda sekarang dapat mendaftarkan diri di berbagai event olahraga terkemuka kami, mulai dari lari maraton, sepeda balap, hingga triatlon seluruh nusantara.</p>
<div style="background: #f1f5f9; padding: 15px; border-radius: 12px; margin: 20px 0; font-family: monospace; font-size: 12px;">
  <strong>Detail Akun Atlet:</strong><br/>
  • Nama Lengkap: Budi Santoso<br/>
  • Email Terdaftar: budi.santoso@gmail.com<br/>
  • Status Verifikasi: AKTIF (Verified Athlete)<br/>
  • ID IDN: IDN-99420-BUDI
</div>
<p>Salam Olahraga,<br/><strong>Tim EventHubID</strong></p>
        `,
        createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(), // 3 days ago
        type: 'verification',
        read: false
      },
      {
        id: 'email-inv-01',
        to: 'budi.santoso@gmail.com',
        subject: '🧾 [Invoice] Tagihan Pembayaran Tiket Lomba #TX-EHB55441',
        body: `
<h2>Pemberitahuan Pendaftaran &amp; Tagihan Pembayaran</h2>
<p>Terima kasih telah mendaftar di <strong>Borobudur Marathon 2026</strong>. Pendaftaran Anda saat ini dalam status <strong>MENUNGGU PEMBAYARAN</strong>.</p>
<p>Segera lakukan pembayaran sebelum batas waktu berakhir untuk mengamankan slot limit kuota Anda.</p>
<div style="border: 1px solid #e1e8f0; border-radius: 12px; padding: 15px; margin: 15px 0;">
  <h3 style="margin-top: 0; color: #0f172a;">Rincian Pesanan #TX-EHB55441</h3>
  <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
    <tr>
      <td style="padding: 6px 0; color: #64748b;">Event:</td>
      <td style="padding: 6px 0; font-weight: bold; text-align: right;">Borobudur Marathon 2026</td>
    </tr>
    <tr>
      <td style="padding: 6px 0; color: #64748b;">Kategori:</td>
      <td style="padding: 6px 0; font-weight: bold; text-align: right;">10K Challenge</td>
    </tr>
    <tr>
      <td style="padding: 6px 0; color: #64748b;">Harga Slot:</td>
      <td style="padding: 6px 0; text-align: right;">Rp 300.000</td>
    </tr>
    <tr style="border-top: 1px solid #e2e8f0;">
      <td style="padding: 8px 0; font-weight: bold; color: #0284c7;">Total Pembayaran:</td>
      <td style="padding: 8px 0; font-weight: bold; font-size: 16px; color: #0284c7; text-align: right;">Rp 300.000</td>
    </tr>
  </table>
</div>
<p>Metode pembayaran yang dipilih: <strong>Midtrans VA Bank Transfer</strong>.</p>
<p>Salam Olahraga,<br/><strong>EventHub Billing Engine</strong></p>
        `,
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
        type: 'invoice',
        read: false
      }
    ];
  });

  const [globalSettings, setGlobalSettings] = useState<GlobalSettings>(() => {
    const saved = localStorage.getItem('eh_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const [organizerEmailSettings, setOrganizerEmailSettings] = useState<OrganizerEmailSettings>(() => {
    const saved = localStorage.getItem('eh_organizer_email_settings');
    return saved ? JSON.parse(saved) : {
      registrationConfirmation: true,
      paymentReceipt: true,
      paymentReminder: true,
    };
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('eh_theme');
    return (saved as 'light' | 'dark') || 'light';
  });

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    localStorage.setItem('eh_theme', theme);
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const [language, setLanguageState] = useState<'id' | 'en'>(() => {
    const saved = localStorage.getItem('eh_language');
    return (saved as 'id' | 'en') || 'id';
  });

  const setLanguage = (lang: 'id' | 'en') => {
    setLanguageState(lang);
    localStorage.setItem('eh_language', lang);
  };

  const t = (key: string): string => {
    if (TRANSLATIONS[key]) {
      return TRANSLATIONS[key][language];
    }
    return key;
  };

  // Current logged in user config matching selected role, synchronized with local storage if modified
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const savedRole = localStorage.getItem('eh_role') || 'participant';
    const savedUser = localStorage.getItem(`eh_custom_user_${savedRole}`);
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (err) {
        // Fallback
      }
    }
    if (savedRole === 'participant') {
      return {
        id: 'user-001',
        name: 'Budi Santoso',
        email: 'budi.santoso@gmail.com',
        role: 'participant',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
        whatsapp: '081234567890'
      };
    } else if (savedRole === 'organizer') {
      return {
        id: 'org-yayasan-marathon',
        name: 'Yayasan Borobudur Marathon',
        email: 'contact@borobudurmarathon.co.id',
        role: 'organizer',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
        whatsapp: '08190000444'
      };
    } else {
      return {
        id: 'admin-001',
        name: 'EventHub Super Master',
        email: 'master@eventhub.id',
        role: 'super_admin',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150'
      };
    }
  });

  // Update current user meta on role change or load custom edits
  useEffect(() => {
    const savedUser = localStorage.getItem(`eh_custom_user_${userRole}`);
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
        return;
      } catch (err) {
        // Fallback
      }
    }

    if (userRole === 'participant') {
      setCurrentUser({
        id: 'user-001',
        name: 'Budi Santoso',
        email: 'budi.santoso@gmail.com',
        role: 'participant',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
        whatsapp: '081234567890'
      });
    } else if (userRole === 'organizer') {
      setCurrentUser({
        id: 'org-yayasan-marathon',
        name: 'Yayasan Borobudur Marathon',
        email: 'contact@borobudurmarathon.co.id',
        role: 'organizer',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
        whatsapp: '08190000444'
      });
    } else {
      setCurrentUser({
        id: 'admin-001',
        name: 'EventHub Super Master',
        email: 'master@eventhub.id',
        role: 'super_admin',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150'
      });
    }
  }, [userRole]);

  // Synchronize with local storage on state change
  useEffect(() => {
    localStorage.setItem('eh_role', userRole);
  }, [userRole]);

  useEffect(() => {
    localStorage.setItem('eh_events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('eh_registrations', JSON.stringify(registrations));
  }, [registrations]);

  useEffect(() => {
    localStorage.setItem('eh_coupons', JSON.stringify(coupons));
  }, [coupons]);

  useEffect(() => {
    localStorage.setItem('eh_withdrawals', JSON.stringify(withdrawals));
  }, [withdrawals]);

  useEffect(() => {
    localStorage.setItem('eh_announcements', JSON.stringify(announcements));
  }, [announcements]);

  useEffect(() => {
    localStorage.setItem('eh_settings', JSON.stringify(globalSettings));
  }, [globalSettings]);

  useEffect(() => {
    localStorage.setItem('eh_organizer_email_settings', JSON.stringify(organizerEmailSettings));
  }, [organizerEmailSettings]);

  const updateOrganizerEmailSettings = (settings: Partial<OrganizerEmailSettings>) => {
    setOrganizerEmailSettings(prev => ({ ...prev, ...settings }));
  };

  useEffect(() => {
    localStorage.setItem('eh_simulated_emails', JSON.stringify(emails));
  }, [emails]);

  // Actions
  const changeRole = (role: 'super_admin' | 'organizer' | 'participant') => {
    setUserRole(role);
    addNotification(
      'Role Switched!',
      `You are now acting as the ${role.replace('_', ' ').toUpperCase()}`,
      'system'
    );
  };

  const addEvent = (eventInput: Omit<IndonesianEvent, 'id' | 'registeredParticipantsCount' | 'viewsCount'> & { categories: Category[] }) => {
    const id = `evt-${Date.now()}`;
    const newEvent: IndonesianEvent = {
      ...eventInput,
      id,
      registeredParticipantsCount: 0,
      viewsCount: 1,
      isFeatured: false
    };
    setEvents(prev => [newEvent, ...prev]);
    addNotification('Event Created!', `Your event "${newEvent.title}" has been created successfully.`, 'system');
    return newEvent;
  };

  const updateEvent = (updated: IndonesianEvent) => {
    setEvents(prev => prev.map(e => e.id === updated.id ? updated : e));
    addNotification('Event Updated', `Event "${updated.title}" updated successfully.`, 'system');
  };

  const deleteEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
    addNotification('Event Deleted', `Successfully deleted tournament.`, 'system');
  };

  const incrementViews = (eventId: string) => {
    setEvents(prev => prev.map(e => {
      if (e.id === eventId) {
        return { ...e, viewsCount: e.viewsCount + 1 };
      }
      return e;
    }));
  };

  // Automated smart BIB generation helper
  const generateBIB = (catId: string, currentRegCount: number): string => {
    // Generate BIB numbers based on class
    // 5K -> 5000 + count
    // 10K -> 10000 + count
    // 21K -> 21000 + count
    // 42K -> 42000 + count
    // Trail / others based on letters
    const index = currentRegCount + 1;
    if (catId.includes('5k')) {
      return `5${String(index).padStart(4, '0')}`;
    } else if (catId.includes('10k') || catId.includes('sprint')) {
      return `10${String(index).padStart(4, '0')}`;
    } else if (catId.includes('21k') || catId.includes('olympic')) {
      return `21${String(index).padStart(4, '0')}`;
    } else if (catId.includes('42k') || catId.includes('100k') || catId.includes('3day')) {
      return `42${String(index).padStart(4, '0')}`;
    } else {
      return `88${String(index).padStart(4, '0')}`;
    }
  };

  const sendSimulatedEmail = (
    to: string, 
    subject: string, 
    body: string, 
    type: SimulatedEmail['type'], 
    metadata?: SimulatedEmail['metadata']
  ) => {
    const id = `mail-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newMail: SimulatedEmail = {
      id,
      to,
      subject,
      body,
      createdAt: new Date().toISOString(),
      type,
      read: false,
      metadata
    };
    setEmails(prev => [newMail, ...prev]);
  };

  const deleteEmail = (id: string) => {
    setEmails(prev => prev.filter(m => m.id !== id));
  };

  const markEmailAsRead = (id: string) => {
    setEmails(prev => prev.map(m => m.id === id ? { ...m, read: true } : m));
  };

  const clearAllEmails = () => {
    setEmails([]);
  };

  const addRegistration = (regInput: Omit<Registration, 'id' | 'ticketNumber' | 'bibNumber' | 'createdAt' | 'checkInStatus'>) => {
    const id = `TX-EHB${Math.floor(10000 + Math.random() * 90000)}`;
    
    // Find event and update stats
    const event = events.find(e => e.id === regInput.eventId);
    let updatedEvents = [...events];
    let ticketNum = 'TKT-GEN-' + Math.floor(100 + Math.random() * 900);
    let bibNum = '999';

    if (event) {
      const categoryIndex = event.categories.findIndex(c => c.id === regInput.categoryId);
      if (categoryIndex !== -1) {
        const cat = event.categories[categoryIndex];
        const updatedCat = { ...cat, registeredCount: cat.registeredCount + 1 };
        const updatedCats = [...event.categories];
        updatedCats[categoryIndex] = updatedCat;
        
        bibNum = generateBIB(cat.id, cat.registeredCount);
        
        updatedEvents = events.map(e => e.id === event.id ? { 
          ...e, 
          registeredParticipantsCount: e.registeredParticipantsCount + 1,
          categories: updatedCats 
        } : e);
      }
      ticketNum = `TKT-${event.title.substring(0,3).toUpperCase()}-${regInput.categoryId.substring(0,3).toUpperCase()}-${3000 + event.registeredParticipantsCount}`;
    }

    const newReg: Registration = {
      ...regInput,
      id,
      ticketNumber: ticketNum,
      bibNumber: bibNum,
      createdAt: new Date().toISOString(),
      checkInStatus: 'registered'
    };

    setRegistrations(prev => [newReg, ...prev]);
    setEvents(updatedEvents);

    // Add immediate triggers for ticket success notifications
    addNotification(
      'Registration Success!',
      `You are successfully registered for ${newReg.eventTitle} (${newReg.categoryName}).`,
      'registration_success'
    );

    // 1. Send Registration Confirmation Email
    if (organizerEmailSettings.registrationConfirmation) {
      sendSimulatedEmail(
        newReg.personalInfo.email,
        `📝 [EventHub] Konfirmasi Pendaftaran Lomba: ${newReg.eventTitle}`,
        `
<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.6; color: #334155;">
  <div style="background: #0284c7; color: white; padding: 24px; text-align: center; border-radius: 16px 16px 0 0;">
    <h1 style="margin: 0; font-size: 18px; font-weight: bold; text-transform: uppercase;">Konfirmasi Pendaftaran Event</h1>
    <p style="margin: 4px 0 0 0; font-size: 13px;">${newReg.eventTitle}</p>
  </div>
  <div style="padding: 24px; background: white; border: 1px solid #e2e8f0; border-radius: 0 0 16px 16px;">
    <h2 style="margin-top: 0; color: #0f172a; font-size: 18px;">Halo ${newReg.personalInfo.firstName} ${newReg.personalInfo.lastName},</h2>
    <p>Registrasi Anda untuk mengikuti olahraga tournament <strong>${newReg.eventTitle}</strong> telah sukses direkam oleh sistem kami!</p>
    
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin: 20px 0;">
      <h3 style="margin-top: 0; font-size: 14px; text-transform: uppercase; color: #0284c7; letter-spacing: 0.05em;">Lembar Formulir Pendaftar:</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 12.5px;">
        <tr>
          <td style="padding: 5px 0; color: #64748b; width: 140px;">Kategori Lomba:</td>
          <td style="padding: 5px 0; font-weight: bold;">${newReg.categoryName}</td>
        </tr>
        <tr>
          <td style="padding: 5px 0; color: #64748b;">Ukuran Jersey:</td>
          <td style="padding: 5px 0; font-weight: bold;">${newReg.jerseyInfo.size} (${newReg.jerseyInfo.cutType})</td>
        </tr>
        <tr>
          <td style="padding: 5px 0; color: #64748b;">Golongan Darah:</td>
          <td style="padding: 5px 0; font-weight: bold;">${newReg.medicalInfo.bloodType || '-'}</td>
        </tr>
        <tr>
          <td style="padding: 5px 0; color: #64748b;">Nomor WhatsApp:</td>
          <td style="padding: 5px 0; font-weight: bold;">${newReg.personalInfo.whatsApp}</td>
        </tr>
        <tr>
          <td style="padding: 5px 0; color: #64748b;">Kontak Darurat:</td>
          <td style="padding: 5px 0; font-weight: bold;">${newReg.emergencyInfo.name} (${newReg.emergencyInfo.relationship} - ${newReg.emergencyInfo.phoneNumber})</td>
        </tr>
        <tr>
          <td style="padding: 5px 0; color: #64748b;">Status Pembayaran:</td>
          <td style="padding: 5px 0; font-weight: bold; color: ${newReg.paymentInfo.status === 'paid' ? '#10b981' : '#f59e0b'};">
            ${newReg.paymentInfo.status === 'paid' ? 'LUNAS (Paid)' : 'MENUNGGU PEMBAYARAN (Pending)'}
          </td>
        </tr>
      </table>
    </div>
    
    <p style="font-size: 12px; color: #64748b;">Buku Panduan Teknis Lomba (Race Guidebook) akan segera kami kirimkan 7 hari sebelum acara berlangsung. Tetap jaga kondisi fisik Anda!</p>
    
    <div style="border-top: 1px solid #f1f5f9; padding-top: 16px; margin-top: 24px; text-align: center; font-size: 11px; color: #94a3b8;">
      © 2026 EventHub Indonesia. Sports Tournament Ecosystem
    </div>
  </div>
</div>
      `,
      'registration',
      { eventName: newReg.eventTitle, invoiceId: newReg.id }
    );
    }

    if (newReg.paymentInfo.status === 'paid') {
      addNotification(
        'Payment Verified!',
        `Payment of Rp ${(newReg.paymentInfo.finalAmount).toLocaleString('id-ID')} received. Your ticket code is ${newReg.ticketNumber}.`,
        'payment_success'
      );

      // 2. Send Official Receipt Email instantly
      if (organizerEmailSettings.paymentReceipt) {
        sendSimulatedEmail(
          newReg.personalInfo.email,
          `💳 [EventHub] Bukti Pembayaran Kuitansi Resmi Lunas - Invoice #${newReg.id}`,
          `
<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.6; color: #334155;">
  <div style="background: #10b981; color: white; padding: 24px; text-align: center; border-radius: 16px 16px 0 0;">
    <div style="display: inline-block; background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 50px; font-size: 11px; text-transform: uppercase; font-family: monospace; font-weight: bold; margin-bottom: 8px;">Official Receipt</div>
    <h1 style="margin: 0; font-size: 18px; font-weight: bold; text-transform: uppercase;">Bukti Pembayaran Kuitansi Resmi</h1>
    <p style="margin: 4px 0 0 0; font-size: 12.5px;">E-Ticket Code: ${newReg.ticketNumber}</p>
  </div>
  <div style="padding: 24px; background: white; border: 1px solid #e2e8f0; border-radius: 0 0 16px 16px;">
    <h2 style="margin-top: 0; color: #0f172a; font-size: 18px;">Halo ${newReg.personalInfo.firstName} ${newReg.personalInfo.lastName},</h2>
    <p>Pembayaran Anda untuk <strong>${newReg.eventTitle}</strong> telah sukses diterima dan status kepesertaan Anda dinyatakan <strong>SEDANG AKTIF (CONFIRMED)</strong>.</p>
    
    <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; padding: 18px; margin: 20px 0;">
      <div style="color: #065f46; font-weight: bold; font-size: 14px; text-align: center; border-bottom: 1px solid #a7f3d0; padding-bottom: 8px; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.05em;">KUITANSI LUNAS (PAID)</div>
      
      <table style="width: 100%; border-collapse: collapse; font-size: 12.5px; color: #047857;">
        <tr>
          <td style="padding: 4px 0; color: #047857; opacity: 0.8;">No. Kuitansi:</td>
          <td style="padding: 4px 0; font-weight: bold; text-align: right;">REC-${newReg.id.replace('TX-', '')}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; color: #047857; opacity: 0.8;">Nomor Invoice:</td>
          <td style="padding: 4px 0; font-weight: bold; text-align: right;">${newReg.id}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; color: #047857; opacity: 0.8;">Nomor BIB Dada:</td>
          <td style="padding: 4px 0; font-weight: bold; text-align: right; font-size: 14px; color: #047857;">${newReg.bibNumber}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; color: #047857; opacity: 0.8;">Jumlah Bayar:</td>
          <td style="padding: 4px 0; font-weight: bold; text-align: right;">Rp ${newReg.paymentInfo.finalAmount.toLocaleString('id-ID')}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; color: #047857; opacity: 0.8;">Tanggal Lunas:</td>
          <td style="padding: 4px 0; font-weight: bold; text-align: right; font-family: monospace;">${new Date().toLocaleString('id-ID')}</td>
        </tr>
      </table>
    </div>

    <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; margin-top: 20px;">
      <h4 style="margin: 0 0 8px 0; font-size: 13px; color: #0f172a; text-transform: uppercase;">Langkah Selanjutnya:</h4>
      <p style="font-size: 12px; margin: 0; color: #64748b; leading-relaxed: 1.5;">
        Tunjukkan <strong>Barcode QR Ticket (${newReg.ticketNumber})</strong> yang ada dalam dashboard Anda saat pengambilan Race Pack Lomba (Jersey, BIB, Timing Chip) di lokasi acara sesuai jadwal.
      </p>
    </div>

    <div style="border-top: 1px solid #f1f5f9; padding-top: 16px; margin-top: 24px; text-align: center; font-size: 11px; color: #94a3b8;">
      © 2026 EventHub Indonesia. Sports Tournament Ecosystem
    </div>
  </div>
</div>
        `,
        'receipt',
        { eventName: newReg.eventTitle, invoiceId: newReg.id, amount: newReg.paymentInfo.finalAmount, ticketNumber: newReg.ticketNumber, bibNumber: newReg.bibNumber }
      );
      }
    } else {
      // 3. Send Invoice Billing Email for pending registrations
      if (organizerEmailSettings.paymentReminder) {
        sendSimulatedEmail(
          newReg.personalInfo.email,
          `🧾 [EventHub] Tagihan Pembayaran Invoice #${newReg.id}`,
          `
<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.6; color: #334155;">
  <div style="background: #f59e0b; color: white; padding: 24px; text-align: center; border-radius: 16px 16px 0 0;">
    <h1 style="margin: 0; font-size: 18px; font-weight: bold; text-transform: uppercase;">Tagihan Pembayaran (Invoice)</h1>
    <p style="margin: 4px 0 0 0; font-size: 13px;">Nomor Tagihan: #${newReg.id}</p>
  </div>
  <div style="padding: 24px; background: white; border: 1px solid #e2e8f0; border-radius: 0 0 16px 16px;">
    <h2 style="margin-top: 0; color: #0f172a; font-size: 18px;">Halo ${newReg.personalInfo.firstName} ${newReg.personalInfo.lastName},</h2>
    <p>Silakan selesaikan pembayaran tagihan registrasi Anda agar slot peserta di <strong>${newReg.eventTitle}</strong> resmi menjadi milik Anda.</p>
    
    <div style="background: #fffbeb; border: 1px solid #fef3c7; border-radius: 12px; padding: 18px; margin: 20px 0;">
      <h3 style="margin-top: 0; font-size: 13px; text-transform: uppercase; color: #d97706; letter-spacing: 0.05em;">Rincian Invoice Tagihan:</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Event & Kategori:</td>
          <td style="padding: 6px 0; font-weight: bold; text-align: right;">${newReg.eventTitle} - ${newReg.categoryName}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Metode Pembayaran:</td>
          <td style="padding: 6px 0; font-weight: bold; text-align: right; text-transform: uppercase;">${newReg.paymentInfo.method.replace('_', ' ')}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Potongan Kupon:</td>
          <td style="padding: 6px 0; font-weight: bold; color: #ef4444; text-align: right;">- Rp ${newReg.paymentInfo.discountAmount.toLocaleString('id-ID')}</td>
        </tr>
        <tr style="border-top: 1px solid #fcd34d;">
          <td style="padding: 8px 0; font-weight: bold; color: #b45309;">Total Tagihan:</td>
          <td style="padding: 8px 0; font-weight: bold; font-size: 16px; color: #b45309; text-align: right;">Rp ${newReg.paymentInfo.finalAmount.toLocaleString('id-ID')}</td>
        </tr>
      </table>
    </div>

    <div style="background: #f8fafc; border: 1px dashed #cbd5e1; padding: 16px; text-align: center; border-radius: 8px; font-size: 13px;">
      <p style="margin: 0 0 8px 0; color: #64748b;">Segera lakukan pembayaran otomatis aman melalui dashboard Anda:</p>
      <div style="font-weight: bold; font-size: 15px; color: #0284c7; margin-bottom: 4px;">Instruksi Midtrans Secure Gateway</div>
      <p style="margin: 0; font-size: 11px; color: #94a3b8;">Sistem akan memverifikasi dana transfer secara real-time dalam 1-2 detik setelah pembayaran masuk.</p>
    </div>

    <div style="border-top: 1px solid #f1f5f9; padding-top: 16px; margin-top: 24px; text-align: center; font-size: 11px; color: #94a3b8;">
      © 2026 EventHub Indonesia. Sports Tournament Ecosystem
    </div>
  </div>
</div>
        `,
        'invoice',
        { eventName: newReg.eventTitle, invoiceId: newReg.id, amount: newReg.paymentInfo.finalAmount }
      );
      }
  }

  return newReg;
  };

  const updateCheckInStatus = (regId: string, status: Registration['checkInStatus']) => {
    setRegistrations(prev => prev.map(r => {
      if (r.id === regId) {
        const extra: Partial<Registration> = {};
        if (status === 'checked_in') extra.checkedInAt = new Date().toISOString();
        if (status === 'race_pack_collected') extra.racePackCollectedAt = new Date().toISOString();
        
        return { ...r, checkInStatus: status, ...extra };
      }
      return r;
    }));
    
    // Add brief alert
    const reg = registrations.find(r => r.id === regId);
    if (reg) {
      addNotification(
        'Status Synced',
        `Participant ${reg.personalInfo.firstName} is marked as ${status.replace('_', ' ').toUpperCase()}`,
        'system'
      );
    }
  };

  const updatePaymentStatus = (regId: string, status: Registration['paymentInfo']['status']) => {
    setRegistrations(prev => prev.map(r => {
      if (r.id === regId) {
        return {
          ...r,
          paymentInfo: { ...r.paymentInfo, status }
        };
      }
      return r;
    }));

    const reg = registrations.find(r => r.id === regId);
    if (reg && status === 'paid') {
      addNotification(
        'Payment Success',
        `Payment for invoice ${regId} has been successfully credited via Midtrans.`,
        'payment_success'
      );

      // Send simulated receipt e-mail
      if (organizerEmailSettings.paymentReceipt) {
        sendSimulatedEmail(
          reg.personalInfo.email,
          `💳 [EventHub] Bukti Pembayaran Kuitansi Resmi Lunas - Invoice #${reg.id}`,
          `
<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.6; color: #334155;">
  <div style="background: #10b981; color: white; padding: 24px; text-align: center; border-radius: 16px 16px 0 0;">
    <div style="display: inline-block; background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 50px; font-size: 11px; text-transform: uppercase; font-family: monospace; font-weight: bold; margin-bottom: 8px;">Official Receipt</div>
    <h1 style="margin: 0; font-size: 18px; font-weight: bold; text-transform: uppercase;">Bukti Pembayaran Kuitansi Resmi</h1>
    <p style="margin: 4px 0 0 0; font-size: 12.5px;">E-Ticket Code: ${reg.ticketNumber}</p>
  </div>
  <div style="padding: 24px; background: white; border: 1px solid #e2e8f0; border-radius: 0 0 16px 16px;">
    <h2 style="margin-top: 0; color: #0f172a; font-size: 18px;">Halo ${reg.personalInfo.firstName} ${reg.personalInfo.lastName},</h2>
    <p>Pembayaran tagihan Anda untuk <strong>${reg.eventTitle}</strong> telah sukses diterima dan status kepesertaan Anda dinyatakan <strong>SEDANG AKTIF (CONFIRMED)</strong>.</p>
    
    <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; padding: 18px; margin: 20px 0;">
      <div style="color: #065f46; font-weight: bold; font-size: 14px; text-align: center; border-bottom: 1px solid #a7f3d0; padding-bottom: 8px; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.05em;">KUITANSI LUNAS (PAID)</div>
      
      <table style="width: 100%; border-collapse: collapse; font-size: 12.5px; color: #047857;">
        <tr>
          <td style="padding: 4px 0; color: #047857; opacity: 0.8;">No. Kuitansi:</td>
          <td style="padding: 4px 0; font-weight: bold; text-align: right;">REC-${reg.id.replace('TX-', '')}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; color: #047857; opacity: 0.8;">Nomor Invoice:</td>
          <td style="padding: 4px 0; font-weight: bold; text-align: right;">${reg.id}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; color: #047857; opacity: 0.8;">Nomor BIB Dada:</td>
          <td style="padding: 4px 0; font-weight: bold; text-align: right; font-size: 14px; color: #047857;">${reg.bibNumber}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; color: #047857; opacity: 0.8;">Jumlah Bayar:</td>
          <td style="padding: 4px 0; font-weight: bold; text-align: right;">Rp ${reg.paymentInfo.finalAmount.toLocaleString('id-ID')}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; color: #047857; opacity: 0.8;">Tanggal Lunas:</td>
          <td style="padding: 4px 0; font-weight: bold; text-align: right; font-family: monospace;">${new Date().toLocaleString('id-ID')}</td>
        </tr>
      </table>
    </div>

    <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; margin-top: 20px;">
      <h4 style="margin: 0 0 8px 0; font-size: 13px; color: #0f172a; text-transform: uppercase;">Langkah Selanjutnya:</h4>
      <p style="font-size: 12px; margin: 0; color: #64748b; leading-relaxed: 1.5;">
        Tunjukkan <strong>Barcode QR Ticket (${reg.ticketNumber})</strong> yang ada dalam dashboard Anda saat pengambilan Race Pack Lomba (Jersey, BIB, Timing Chip) di lokasi acara sesuai jadwal.
      </p>
    </div>

    <div style="border-top: 1px solid #f1f5f9; padding-top: 16px; margin-top: 24px; text-align: center; font-size: 11px; color: #94a3b8;">
      © 2026 EventHub Indonesia. Sports Tournament Ecosystem
    </div>
  </div>
</div>
        `,
        'receipt',
        { eventName: reg.eventTitle, invoiceId: reg.id, amount: reg.paymentInfo.finalAmount, ticketNumber: reg.ticketNumber, bibNumber: reg.bibNumber }
      );
      }
    }
  };

  const deleteRegistration = (id: string) => {
    setRegistrations(prev => prev.filter(r => r.id !== id));
    addNotification('Participant Removed', `Registration #${id} has been manually cancelled.`, 'system');
  };

  // Coupons
  const addCoupon = (couponInput: Omit<Coupon, 'id' | 'usedCount'>) => {
    const newCoupon: Coupon = {
      ...couponInput,
      id: `cp-${Date.now()}`,
      usedCount: 0
    };
    setCoupons(prev => [newCoupon, ...prev]);
  };

  const useCoupon = (code: string): Coupon | null => {
    const cleanedCode = code.trim().toUpperCase();
    const couponIndex = coupons.findIndex(c => c.code.toUpperCase() === cleanedCode);
    if (couponIndex === -1) return null;
    
    const coupon = coupons[couponIndex];
    if (coupon.usedCount >= coupon.quota) return null;
    
    // Increment coupon used count
    const updatedCoupons = [...coupons];
    updatedCoupons[couponIndex] = { ...coupon, usedCount: coupon.usedCount + 1 };
    setCoupons(updatedCoupons);
    return coupon;
  };

  const deleteCoupon = (id: string) => {
    setCoupons(prev => prev.filter(c => c.id !== id));
  };

  const updateCoupon = (updated: Coupon) => {
    setCoupons(prev => prev.map(c => c.id === updated.id ? updated : c));
    addNotification('Coupon Modified', `Voucher campaign "${updated.code}" modified successfully.`, 'system');
  };

  // Cash / Withdrawals
  const requestWithdrawal = (amount: number, bankName: string, accountNumber: string, holderName: string) => {
    const id = `WD-${Math.floor(100 + Math.random() * 900)}`;
    const newWd: Withdrawal = {
      id,
      organizerId: currentUser.id,
      organizerName: currentUser.name,
      amount,
      date: new Date().toISOString().split('T')[0],
      status: 'pending',
      bankName,
      accountNumber,
      accountHolderName: holderName
    };
    setWithdrawals(prev => [newWd, ...prev]);
    addNotification('Withdrawal Requested', `Your request for Rp ${amount.toLocaleString('id-ID')} has been submitted.`, 'system');
  };

  const updateWithdrawStatus = (id: string, status: Withdrawal['status']) => {
    setWithdrawals(prev => prev.map(w => w.id === id ? { ...w, status } : w));
    const wd = withdrawals.find(w => w.id === id);
    if (wd) {
      addNotification(
        'Withdrawal Update',
        `Your withdrawal request of Rp ${wd.amount.toLocaleString('id-ID')} has been ${status}.`,
        'system'
      );
    }
  };

  const addAnnouncement = (title: string, message: string, target: SystemAnnouncement['targetRole']) => {
    const id = `ann-${Date.now()}`;
    const newAnn: SystemAnnouncement = { id, title, message, date: new Date().toISOString().split('T')[0], targetRole: target };
    setAnnouncements(prev => [newAnn, ...prev]);
    addNotification('New Announcement Broadcasted', `Announcement "${title}" is live.`, 'system');
  };

  const updateAnnouncement = (updated: SystemAnnouncement) => {
    setAnnouncements(prev => prev.map(a => a.id === updated.id ? updated : a));
    addNotification('Broadcast Updated', `Announcement bulletin modified.`, 'system');
  };

  const deleteAnnouncement = (id: string) => {
    setAnnouncements(prev => prev.filter(a => a.id !== id));
    addNotification('Broadcast Revoked', `Successfully removed announcement.`, 'system');
  };

  const addNotification = (title: string, message: string, type: AppNotification['type']) => {
    const id = `notif-${Date.now()}`;
    const newNotif: AppNotification = { id, title, message, date: new Date().toISOString(), read: false, type };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const updateCurrentUser = (userData: Partial<User>) => {
    setCurrentUser(prev => {
      const updated = { ...prev, ...userData };
      localStorage.setItem(`eh_custom_user_${prev.role}`, JSON.stringify(updated));
      
      const emailToUse = updated.email || prev.email;
      const nameToUse = updated.name || prev.name;
      const waToUse = updated.whatsapp || prev.whatsapp || '-';

      sendSimulatedEmail(
        emailToUse,
        '🛡️ [EventHub] Verifikasi Profil Akun Atlet Berhasil Diperbarui',
        `
<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.6; color: #334155;">
  <div style="background: #0ea5e9; color: white; padding: 24px; text-align: center; border-radius: 16px 16px 0 0;">
    <h1 style="margin: 0; font-size: 20px; font-weight: 800; letter-spacing: 0.05em;">EVENTHUB INDONESIA</h1>
    <p style="margin: 4px 0 0 0; font-size: 11px; opacity: 0.9; text-transform: uppercase; font-family: monospace;">Secured Athlete Verification Center</p>
  </div>
  
  <div style="padding: 24px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 0 0 16px 16px;">
    <h2 style="margin-top: 0; color: #0f172a; font-size: 18px;">Halo ${nameToUse},</h2>
    <p>Kami menginformasikan bahwa data profil akun Anda pada platform <strong>EventHub</strong> telah berhasil diperbarui dan diverifikasi ulang secara aman.</p>
    
    <div style="background: #f8fafc; border-left: 4px solid #0ea5e9; padding: 16px; margin: 20px 0; border-radius: 0 8px 8px 0;">
      <h4 style="margin: 0 0 8px 0; color: #0284c7; font-size: 13px; text-transform: uppercase;">Detail Informasi Terverifikasi:</h4>
      <table style="width: 100%; font-size: 12px; border-collapse: collapse;">
        <tr>
          <td style="padding: 4px 0; color: #64748b; width: 130px;">Nama Atlet:</td>
          <td style="padding: 4px 0; font-weight: bold; color: #334155;">${nameToUse}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; color: #64748b;">Email:</td>
          <td style="padding: 4px 0; font-weight: bold; color: #334155;">${emailToUse}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; color: #64748b;">Nomor WhatsApp:</td>
          <td style="padding: 4px 0; font-weight: bold; color: #334155;">${waToUse}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; color: #64748b;">Tanggal Log:</td>
          <td style="padding: 4px 0; font-family: monospace; color: #334155;">${new Date().toLocaleString('id-ID')}</td>
        </tr>
      </table>
    </div>

    <p style="font-size: 12px; color: #64748b;">Jika Anda merasa tidak melakukan perubahan ini, silakan hubungi tim keamanan EventHub melalui email cs@eventhub.id untuk perlindungan akun instan.</p>
    
    <div style="border-t: 1px solid #f1f5f9; padding-top: 16px; margin-top: 24px; text-align: center; font-size: 11px; color: #94a3b8;">
      © 2026 EventHub Indonesia. Sports Tournament Ecosystem
    </div>
  </div>
</div>
        `,
        'verification'
      );

      return updated;
    });
    addNotification('Profil Diperbarui', 'Informasi profil Anda telah berhasil disimpan.', 'system');
  };

  const deleteUserAccount = () => {
    const userEmail = currentUser.email.toLowerCase();
    
    // Clear registrations for this user's email
    setRegistrations(prev => {
      const remaining = prev.filter(r => r.personalInfo.email.toLowerCase() !== userEmail);
      localStorage.setItem('eh_registrations', JSON.stringify(remaining));
      return remaining;
    });

    // Remove custom modified user profiles
    localStorage.removeItem('eh_custom_user_participant');
    localStorage.removeItem('eh_custom_user_organizer');
    localStorage.removeItem('eh_custom_user_super_admin');
    localStorage.removeItem('eh_role');

    // Reset current user state back to participant default Budi
    setCurrentUser({
      id: 'user-001',
      name: 'Budi Santoso',
      email: 'budi.santoso@gmail.com',
      role: 'participant',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
      whatsapp: '081234567890'
    });

    setUserRole('participant');
    addNotification('Akun Berhasil Dihapus', 'Seluruh data profil dan riwayat pendaftaran Anda telah dihapus secara permanen.', 'system');
  };

  const updateGlobalSettings = (settings: GlobalSettings) => {
    setGlobalSettings(settings);
    addNotification('Settings Modified', 'Global system parameters updated.', 'system');
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      userRole,
      changeRole,
      updateCurrentUser,
      deleteUserAccount,
      events,
      addEvent,
      updateEvent,
      deleteEvent,
      incrementViews,
      registrations,
      addRegistration,
      updateCheckInStatus,
      updatePaymentStatus,
      deleteRegistration,
      coupons,
      addCoupon,
      updateCoupon,
      useCoupon,
      deleteCoupon,
      withdrawals,
      requestWithdrawal,
      updateWithdrawStatus,
      announcements,
      addAnnouncement,
      updateAnnouncement,
      deleteAnnouncement,
      notifications,
      addNotification,
      markNotificationsAsRead,
      globalSettings,
      updateGlobalSettings,
      organizerEmailSettings,
      updateOrganizerEmailSettings,
      theme,
      toggleTheme,
      language,
      setLanguage,
      t,
      emails,
      sendSimulatedEmail,
      deleteEmail,
      markEmailAsRead,
      clearAllEmails
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
