import { db } from '../config/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { SystemSettings, Sponsor, GalleryItem, FAQItem, Announcement } from '../types';
import { collection, getDocs } from 'firebase/firestore';

export const DEFAULT_SYSTEM_SETTINGS: SystemSettings = {
  id: 'general',
  siteName: 'RacePro Indonesia',
  siteDescription: 'Platform Management Event Lomba & Olahraga Profesional',
  logoUrl: '/logo.svg',
  contactEmail: 'support@racepro.id',
  contactPhone: '+62 812 3456 7890',
  maintenanceMode: false,
  paymentGatewayConfigured: false,
  paymentGatewayName: 'Manual Transfer / Gateway Unconfigured',
  oauthConfigured: false,
  updatedAt: new Date().toISOString()
};

export async function getSystemSettings(): Promise<SystemSettings> {
  try {
    const docRef = doc(db, 'system_settings', 'general');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { ...DEFAULT_SYSTEM_SETTINGS, ...snap.data() } as SystemSettings;
    }
  } catch (e) {
    console.error('Error loading settings:', e);
  }
  return DEFAULT_SYSTEM_SETTINGS;
}

export async function updateSystemSettings(data: Partial<SystemSettings>): Promise<void> {
  const docRef = doc(db, 'system_settings', 'general');
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    await updateDoc(docRef, { ...data, updatedAt: new Date().toISOString() });
  } else {
    await setDoc(docRef, { ...DEFAULT_SYSTEM_SETTINGS, ...data, updatedAt: new Date().toISOString() });
  }
}

export async function getSponsors(): Promise<Sponsor[]> {
  try {
    const snap = await getDocs(collection(db, 'sponsors'));
    return snap.docs.map(d => ({ id: d.id, ...(d.data() as object) } as unknown as Sponsor));
  } catch (e) {
    return [];
  }
}

export async function getGalleries(): Promise<GalleryItem[]> {
  try {
    const snap = await getDocs(collection(db, 'galleries'));
    return snap.docs.map(d => ({ id: d.id, ...(d.data() as object) } as unknown as GalleryItem));
  } catch (e) {
    return [];
  }
}

export async function getFAQs(): Promise<FAQItem[]> {
  try {
    const snap = await getDocs(collection(db, 'faqs'));
    return snap.docs.map(d => ({ id: d.id, ...(d.data() as object) } as unknown as FAQItem));
  } catch (e) {
    return [];
  }
}

export async function getAnnouncements(): Promise<Announcement[]> {
  try {
    const snap = await getDocs(collection(db, 'announcements'));
    return snap.docs.map(d => ({ id: d.id, ...(d.data() as object) } as unknown as Announcement));
  } catch (e) {
    return [];
  }
}
