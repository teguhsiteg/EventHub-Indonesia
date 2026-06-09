import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, IndonesianEvent, Registration, Coupon, Withdrawal, 
  SystemAnnouncement, AppNotification, GlobalSettings, Category, SimulatedEmail,
  OrganizerEmailSettings
} from '../types';
import { auth, db } from '../lib/firebase';
import { 
  collection, doc, onSnapshot, setDoc, updateDoc, deleteDoc, 
  query, where, getDocs, addDoc, getDoc, serverTimestamp
} from 'firebase/firestore';
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, browserPopupRedirectResolver } from 'firebase/auth';

interface AppContextType {
  currentUser: User | null;
  userRole: 'super_admin' | 'organizer' | 'participant';
  changeRole: (role: 'super_admin' | 'organizer' | 'participant') => void;
  updateCurrentUser: (userData: Partial<User>) => void;
  deleteUserAccount: () => void;
  login: () => void;
  logout: () => void;
  
  events: IndonesianEvent[];
  addEvent: (event: Omit<IndonesianEvent, 'id' | 'registeredParticipantsCount' | 'viewsCount'> & { categories: Category[] }) => Promise<IndonesianEvent>;
  updateEvent: (event: IndonesianEvent) => void;
  deleteEvent: (id: string) => void;
  incrementViews: (eventId: string) => void;
  
  registrations: Registration[];
  addRegistration: (registration: Omit<Registration, 'id' | 'ticketNumber' | 'bibNumber' | 'createdAt' | 'checkInStatus'>) => Promise<Registration>;
  updateCheckInStatus: (regId: string, status: Registration['checkInStatus']) => void;
  updatePaymentStatus: (regId: string, status: Registration['paymentInfo']['status']) => void;
  deleteRegistration: (id: string) => void;
  
  coupons: Coupon[];
  addCoupon: (coupon: Omit<Coupon, 'id' | 'usedCount'>) => void;
  updateCoupon: (coupon: Coupon) => void;
  useCoupon: (code: string) => Promise<Coupon | null>;
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
  role: { id: 'Peran', en: 'Role' },
  participant: { id: 'Peserta', en: 'Participant' },
  organizer: { id: 'Penyelenggara', en: 'Event Organizer' },
  super_admin: { id: 'Super Admin', en: 'Super Admin' },
  faq_title: { id: 'Pertanyaan yang Sering Diajukan', en: 'Frequently Asked Questions' },
  faq_desc: { id: 'Segala hal yang perlu Anda ketahui.', en: 'Everything you need to know.' },
  faq_subtitle: { id: 'Ada Pertanyaan?', en: 'Got Questions?' },
  all_questions: { id: 'Semua Pertanyaan', en: 'All Questions' },
  for_participants: { id: 'Untuk Peserta', en: 'For Participants' },
  for_organizers: { id: 'Untuk Penyelenggara', en: 'For Organizers' },
  hero_tag: { id: 'PLATFORM MANAJEMEN EVENT OLAHRAGA TERINTEGRASI #1', en: '#1 INTEGRATED SPORT EVENT MANAGEMENT PLATFORM' },
  hero_title_1: { id: 'Taklukkan Batasmu di ', en: 'Push Your Limits Across ' },
  hero_title_2: { id: 'Event Olahraga Terbesar Nusantara', en: 'The Archipelago\'s Biggest Races' },
  hero_desc: { id: 'Platform registrasi otomatis.', en: 'Automated registration platform.' },
  btn_register_explore: { id: 'Mulai Jelajah', en: 'Start Exploring' },
  btn_host_event: { id: 'Buat Event Baru', en: 'Host an Event' },
  how_it_works: { id: 'Cara Kerja EventHubID', en: 'How EventHubID Works' },
  step1_title: { id: '1. Jelajahi Turnamen', en: '1. Browse Tournaments' },
  step2_title: { id: '2. Registrasi Kilat', en: '2. Express Checkout' },
  step3_title: { id: '3. Scan QR On-Site', en: '3. On-Site Check-In' },
  step1_desc: { id: 'Temukan ratusan turnamen di peta interaktif.', en: 'Discover hundreds of tournaments on the interactive map.' },
  step2_desc: { id: 'Registrasi dalam hitungan menit secara aman.', en: 'Secure registration in minutes.' },
  step3_desc: { id: 'Gunakan tiket QR di dashboard Anda.', en: 'Present your interactive Ticket QR code on your dashboard.' },
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
  no_events_found: { id: 'Tidak ada event olahraga yang cocok...', en: 'No sporting tournaments matched...' },
  location: { id: 'Lokasi', en: 'Location' },
  date: { id: 'Tanggal', en: 'Date' },
  quota: { id: 'Kuota', en: 'Quota' },
  price: { id: 'Harga', en: 'Price' },
  slot_remaining: { id: 'sisa slot', en: 'slots left' },
  days: { id: 'Hari', en: 'Days' },
  hours: { id: 'Jam', en: 'Hours' },
  mins: { id: 'Menit', en: 'Mins' },
  secs: { id: 'Detik', en: 'Secs' },
  all: { id: 'Semua', en: 'All' },
  running: { id: 'Lari', en: 'Running' },
  cycling: { id: 'Sepeda', en: 'Cycling' },
  swimming: { id: 'Renang', en: 'Swimming' },
  triathlon: { id: 'Triatlon', en: 'Triathlon' }
};

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  // In dev mode, we might just want to log it instead of completely bombing the app if it's snapshot listener issues
  // But the instructions say "throw a new Error(JSON.stringify(errInfo))"
  throw new Error(JSON.stringify(errInfo));
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<'super_admin' | 'organizer' | 'participant'>('participant');
  
  const [events, setEvents] = useState<IndonesianEvent[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [announcements, setAnnouncements] = useState<SystemAnnouncement[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [emails, setEmails] = useState<SimulatedEmail[]>([]);
  const [globalSettings, setGlobalSettings] = useState<GlobalSettings>(DEFAULT_SETTINGS);
  const [organizerEmailSettings, setOrganizerEmailSettings] = useState<OrganizerEmailSettings>({
    registrationConfirmation: true,
    paymentReceipt: true,
    paymentReminder: true,
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem('eh_theme') as 'light' | 'dark') || 'light');
  const [language, setLanguageState] = useState<'id' | 'en'>(() => (localStorage.getItem('eh_language') as 'id' | 'en') || 'id');

  useEffect(() => {
    localStorage.setItem('eh_theme', theme);
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
  const setLanguage = (lang: 'id' | 'en') => {
    setLanguageState(lang);
    localStorage.setItem('eh_language', lang);
  };
  const t = (key: string): string => TRANSLATIONS[key] ? TRANSLATIONS[key][language] : key;

  // Firebase Auth integration
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userDocRef);
        let userData: User;
        
        if (userSnap.exists()) {
          userData = userSnap.data() as User;
        } else {
          userData = {
            id: user.uid,
            name: user.displayName || 'User',
            email: user.email || '',
            role: 'participant',
            avatar: user.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
          };
          await setDoc(userDocRef, userData);
        }
        
        setCurrentUser(userData);
        setUserRole(userData.role);
      } else {
        setCurrentUser(null);
        setUserRole('participant');
      }
    });
    return () => unsub();
  }, []);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider, browserPopupRedirectResolver);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const changeRole = async (role: 'super_admin' | 'organizer' | 'participant') => {
    if (!currentUser) return;
    try {
      await updateDoc(doc(db, 'users', currentUser.id), { role });
      setUserRole(role);
      setCurrentUser({ ...currentUser, role });
      addNotification('Role Switched!', `You are now acting as ${role}`, 'system');
    } catch (e) {
      console.error(e);
    }
  };

  const updateCurrentUser = async (userData: Partial<User>) => {
    if (!currentUser) return;
    await updateDoc(doc(db, 'users', currentUser.id), userData);
  };

  const deleteUserAccount = async () => {
    if (!currentUser) return;
    await deleteDoc(doc(db, 'users', currentUser.id));
    await logout();
  };

  // Setup Firestore listeners
  useEffect(() => {
    const unsubs = [
      onSnapshot(collection(db, 'events'), (snap) => setEvents(snap.docs.map(d => d.data() as IndonesianEvent)), (error) => handleFirestoreError(error, OperationType.LIST, 'events')),
      onSnapshot(collection(db, 'registrations'), (snap) => setRegistrations(snap.docs.map(d => d.data() as Registration)), (error) => handleFirestoreError(error, OperationType.LIST, 'registrations')),
      onSnapshot(collection(db, 'coupons'), (snap) => setCoupons(snap.docs.map(d => d.data() as Coupon)), (error) => handleFirestoreError(error, OperationType.LIST, 'coupons')),
      onSnapshot(collection(db, 'withdrawals'), (snap) => setWithdrawals(snap.docs.map(d => d.data() as Withdrawal)), (error) => handleFirestoreError(error, OperationType.LIST, 'withdrawals')),
      onSnapshot(collection(db, 'announcements'), (snap) => setAnnouncements(snap.docs.map(d => d.data() as SystemAnnouncement)), (error) => handleFirestoreError(error, OperationType.LIST, 'announcements')),
      onSnapshot(collection(db, 'emails'), (snap) => setEmails(snap.docs.map(d => d.data() as SimulatedEmail)), (error) => handleFirestoreError(error, OperationType.LIST, 'emails'))
    ];
    return () => unsubs.forEach(u => u());
  }, []);

  const addNotification = (title: string, message: string, type: AppNotification['type']) => {
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      title,
      message,
      date: new Date().toISOString(),
      read: false,
      type
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const addEvent = async (eventInput: Omit<IndonesianEvent, 'id' | 'registeredParticipantsCount' | 'viewsCount'> & { categories: Category[] }) => {
    const docRef = doc(collection(db, 'events'));
    const newEvent: IndonesianEvent = {
        ...eventInput,
        id: docRef.id,
        registeredParticipantsCount: 0,
        viewsCount: 1,
        isFeatured: false
    };
    await setDoc(docRef, newEvent);
    addNotification('Event Created!', `Your event "${newEvent.title}" has been created successfully.`, 'system');
    return newEvent;
  };

  const updateEvent = async (updated: IndonesianEvent) => {
    await updateDoc(doc(db, 'events', updated.id), { ...updated });
    addNotification('Event Updated', `Event "${updated.title}" updated successfully.`, 'system');
  };

  const deleteEvent = async (id: string) => {
    await deleteDoc(doc(db, 'events', id));
    addNotification('Event Deleted', `Successfully deleted tournament.`, 'system');
  };

  const incrementViews = async (eventId: string) => {
    const e = events.find(e => e.id === eventId);
    if(e) {
      await updateDoc(doc(db, 'events', eventId), { viewsCount: e.viewsCount + 1 });
    }
  };

  const generateBIB = (catId: string, currentRegCount: number): string => {
    const index = currentRegCount + 1;
    if (catId.includes('5k')) return `5${String(index).padStart(4, '0')}`;
    if (catId.includes('10k') || catId.includes('sprint')) return `10${String(index).padStart(4, '0')}`;
    if (catId.includes('21k') || catId.includes('olympic')) return `21${String(index).padStart(4, '0')}`;
    if (catId.includes('42k') || catId.includes('100k') || catId.includes('3day')) return `42${String(index).padStart(4, '0')}`;
    return `88${String(index).padStart(4, '0')}`;
  };

  const sendSimulatedEmail = async (to: string, subject: string, body: string, type: SimulatedEmail['type'], metadata?: SimulatedEmail['metadata']) => {
    const ref = doc(collection(db, 'emails'));
    const newMail: SimulatedEmail = {
      id: ref.id,
      to,
      subject,
      body,
      createdAt: new Date().toISOString(),
      type,
      read: false,
      metadata
    };
    await setDoc(ref, newMail);
  };

  const deleteEmail = async (id: string) => {
    await deleteDoc(doc(db, 'emails', id));
  };

  const markEmailAsRead = async (id: string) => {
    await updateDoc(doc(db, 'emails', id), { read: true });
  };

  const clearAllEmails = async () => {
    for(const e of emails) {
      await deleteDoc(doc(db, 'emails', e.id));
    }
  };

  const addRegistration = async (regInput: Omit<Registration, 'id' | 'ticketNumber' | 'bibNumber' | 'createdAt' | 'checkInStatus'>) => {
    const ref = doc(collection(db, 'registrations'));
    const id = ref.id;
    
    const event = events.find(e => e.id === regInput.eventId);
    let ticketNum = 'TKT-GEN-' + Math.floor(100 + Math.random() * 900);
    let bibNum = '999';

    if (event) {
      const categoryIndex = event.categories.findIndex(c => c.id === regInput.categoryId);
      if (categoryIndex !== -1) {
        const cat = event.categories[categoryIndex];
        bibNum = generateBIB(cat.id, cat.registeredCount);
        
        // Update Event stats
        const updatedCats = [...event.categories];
        updatedCats[categoryIndex] = { ...cat, registeredCount: cat.registeredCount + 1 };
        await updateDoc(doc(db, 'events', event.id), {
          registeredParticipantsCount: event.registeredParticipantsCount + 1,
          categories: updatedCats
        });
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

    await setDoc(ref, newReg);
    addNotification('Registration Success!', `You are registered for ${newReg.eventTitle}`, 'registration_success');
    return newReg;
  };

  const updateCheckInStatus = async (regId: string, status: Registration['checkInStatus']) => {
    const updates: any = { checkInStatus: status };
    if (status === 'checked_in') updates.checkedInAt = new Date().toISOString();
    if (status === 'race_pack_collected') updates.racePackCollectedAt = new Date().toISOString();
    await updateDoc(doc(db, 'registrations', regId), updates);
  };

  const updatePaymentStatus = async (regId: string, status: Registration['paymentInfo']['status']) => {
    const reg = registrations.find(r => r.id === regId);
    if(reg) {
       await updateDoc(doc(db, 'registrations', regId), {
         paymentInfo: { ...reg.paymentInfo, status }
       });
       if(status === 'paid') {
           addNotification('Payment Success', `Payment for invoice ${regId} has been successfully credited.`, 'payment_success');
       }
    }
  };

  const deleteRegistration = async (id: string) => {
    await deleteDoc(doc(db, 'registrations', id));
  };

  const addCoupon = async (couponInput: Omit<Coupon, 'id' | 'usedCount'>) => {
    const ref = doc(collection(db, 'coupons'));
    const newCoupon: Coupon = { ...couponInput, id: ref.id, usedCount: 0 };
    await setDoc(ref, newCoupon);
  };

  const useCoupon = async (code: string): Promise<Coupon | null> => {
    const cleanedCode = code.trim().toUpperCase();
    const coupon = coupons.find(c => c.code.toUpperCase() === cleanedCode);
    if (!coupon) return null;
    if (coupon.usedCount >= coupon.quota) return null;
    await updateDoc(doc(db, 'coupons', coupon.id), { usedCount: coupon.usedCount + 1 });
    return { ...coupon, usedCount: coupon.usedCount + 1 };
  };

  const deleteCoupon = async (id: string) => {
    await deleteDoc(doc(db, 'coupons', id));
  };

  const updateCoupon = async (updated: Coupon) => {
    await updateDoc(doc(db, 'coupons', updated.id), { ...updated });
  };

  const requestWithdrawal = async (amount: number, bankName: string, accountNumber: string, holderName: string) => {
    if(!currentUser) return;
    const ref = doc(collection(db, 'withdrawals'));
    const newWd: Withdrawal = {
      id: ref.id,
      organizerId: currentUser.id,
      organizerName: currentUser.name,
      amount,
      date: new Date().toISOString().split('T')[0],
      status: 'pending',
      bankName,
      accountNumber,
      accountHolderName: holderName
    };
    await setDoc(ref, newWd);
  };

  const updateWithdrawStatus = async (id: string, status: Withdrawal['status']) => {
    await updateDoc(doc(db, 'withdrawals', id), { status });
  };

  const addAnnouncement = async (title: string, message: string, target: SystemAnnouncement['targetRole']) => {
    const ref = doc(collection(db, 'announcements'));
    const newAnn: SystemAnnouncement = { id: ref.id, title, message, date: new Date().toISOString().split('T')[0], targetRole: target };
    await setDoc(ref, newAnn);
  };

  const updateAnnouncement = async (updated: SystemAnnouncement) => {
    await updateDoc(doc(db, 'announcements', updated.id), { ...updated });
  };

  const deleteAnnouncement = async (id: string) => {
    await deleteDoc(doc(db, 'announcements', id));
  };

  const updateGlobalSettings = (settings: GlobalSettings) => setGlobalSettings(settings);

  const updateOrganizerEmailSettings = (settings: Partial<OrganizerEmailSettings>) => {
    setOrganizerEmailSettings(prev => ({...prev, ...settings}));
  };

  return (
    <AppContext.Provider value={{
      currentUser, userRole, changeRole, updateCurrentUser, deleteUserAccount, login, logout,
      events, addEvent, updateEvent, deleteEvent, incrementViews,
      registrations, addRegistration, updateCheckInStatus, updatePaymentStatus, deleteRegistration,
      coupons, addCoupon, updateCoupon, useCoupon, deleteCoupon,
      withdrawals, requestWithdrawal, updateWithdrawStatus,
      announcements, addAnnouncement, updateAnnouncement, deleteAnnouncement,
      notifications, addNotification, markNotificationsAsRead,
      globalSettings, updateGlobalSettings,
      organizerEmailSettings, updateOrganizerEmailSettings,
      theme, toggleTheme,
      language, setLanguage, t,
      emails, sendSimulatedEmail, deleteEmail, markEmailAsRead, clearAllEmails
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
