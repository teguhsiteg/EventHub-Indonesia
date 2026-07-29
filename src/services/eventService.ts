import { db } from '../config/firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  addDoc 
} from 'firebase/firestore';
import { EventItem, EventCategory, EventStatus } from '../types';
import { logAuditEvent } from './auditService';

export async function getPublicEvents(): Promise<EventItem[]> {
  try {
    const q = query(
      collection(db, 'events'),
      where('status', 'in', ['PUBLISHED', 'REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'ONGOING']),
      orderBy('startDate', 'asc'),
      limit(20)
    );
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as EventItem));
  } catch (err) {
    console.error('Error fetching public events:', err);
    // Fallback query if index is building or in basic status check
    const q = query(collection(db, 'events'), limit(20));
    const snap = await getDocs(q);
    return snap.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as EventItem))
      .filter(e => e.status !== 'DRAFT' && e.status !== 'ARCHIVED');
  }
}

export interface EventSearchParams {
  query?: string;
  location?: string;
  category?: string;
  status?: string;
  limitCount?: number;
}

export function generateEventKeywords(eventData: Partial<EventItem>): string[] {
  const parts: string[] = [
    eventData.name || '',
    eventData.location || '',
    eventData.address || '',
    eventData.organizerName || '',
    eventData.category || '',
    ...(eventData.categories || [])
  ];
  
  const text = parts.join(' ').toLowerCase();
  const tokens = text.split(/[\s,.\-_/()]+/);
  return Array.from(new Set(tokens.filter(t => t.length > 1)));
}

export async function searchEventsInFirestore(params: EventSearchParams): Promise<EventItem[]> {
  const {
    query: searchString = '',
    location: locationFilter = '',
    category: categoryFilter = '',
    status: statusFilter = 'ALL',
    limitCount = 25
  } = params;

  const normalizedSearch = searchString.trim().toLowerCase();
  const normalizedLocation = locationFilter.trim().toLowerCase();
  const normalizedCategory = categoryFilter.trim();

  const constraints: any[] = [];

  // 1. Status constraint
  if (statusFilter && statusFilter !== 'ALL') {
    constraints.push(where('status', '==', statusFilter));
  } else {
    // Only return non-draft public events
    constraints.push(where('status', 'in', ['PUBLISHED', 'REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'ONGOING', 'COMPLETED']));
  }

  // 2. Category constraint in Firestore
  if (normalizedCategory && normalizedCategory !== 'ALL') {
    constraints.push(where('categories', 'array-contains', normalizedCategory));
  }

  // 3. Keyword / Token search in Firestore if search keyword provided
  if (normalizedSearch) {
    const searchToken = normalizedSearch.split(/\s+/)[0];
    if (searchToken && searchToken.length > 1) {
      constraints.push(where('searchKeywords', 'array-contains', searchToken));
    }
  }

  // Always apply strict limit to avoid loading entire collection
  constraints.push(limit(limitCount));

  try {
    const q = query(collection(db, 'events'), ...constraints);
    const snap = await getDocs(q);
    let items = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as EventItem));

    // Secondary fine-grained filtering in case keyword token matches or if token wasn't indexed
    if (normalizedSearch || normalizedLocation || (normalizedCategory && normalizedCategory !== 'ALL')) {
      items = items.filter(e => {
        let matchesQuery = true;
        let matchesLocation = true;
        let matchesCategory = true;

        if (normalizedSearch) {
          const nameMatch = e.name?.toLowerCase().includes(normalizedSearch);
          const locMatch = e.location?.toLowerCase().includes(normalizedSearch);
          const descMatch = e.description?.toLowerCase().includes(normalizedSearch);
          const catMatch = e.category?.toLowerCase().includes(normalizedSearch) || e.categories?.some(c => c.toLowerCase().includes(normalizedSearch));
          const kwMatch = e.searchKeywords?.some(k => k.includes(normalizedSearch));
          matchesQuery = !!(nameMatch || locMatch || descMatch || catMatch || kwMatch);
        }

        if (normalizedLocation && normalizedLocation !== 'all') {
          matchesLocation = e.location?.toLowerCase().includes(normalizedLocation);
        }

        if (normalizedCategory && normalizedCategory !== 'ALL') {
          matchesCategory = (e.category === normalizedCategory) || (e.categories && e.categories.includes(normalizedCategory));
        }

        return matchesQuery && matchesLocation && matchesCategory;
      });
    }

    return items;
  } catch (err) {
    console.warn('Firestore constrained query fallback triggered:', err);
    // Fallback: Query up to limitCount documents and filter
    try {
      const fallbackQuery = query(collection(db, 'events'), limit(limitCount * 2));
      const snap = await getDocs(fallbackQuery);
      let items = snap.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as EventItem))
        .filter(e => e.status !== 'DRAFT' && e.status !== 'ARCHIVED');

      if (statusFilter && statusFilter !== 'ALL') {
        items = items.filter(e => e.status === statusFilter);
      }

      if (normalizedCategory && normalizedCategory !== 'ALL') {
        items = items.filter(e => e.category === normalizedCategory || e.categories?.includes(normalizedCategory));
      }

      if (normalizedLocation && normalizedLocation !== 'all') {
        items = items.filter(e => e.location?.toLowerCase().includes(normalizedLocation));
      }

      if (normalizedSearch) {
        items = items.filter(e => 
          e.name?.toLowerCase().includes(normalizedSearch) ||
          e.location?.toLowerCase().includes(normalizedSearch) ||
          e.description?.toLowerCase().includes(normalizedSearch) ||
          e.categories?.some(c => c.toLowerCase().includes(normalizedSearch))
        );
      }

      return items.slice(0, limitCount);
    } catch (fallbackErr) {
      console.error('Error fetching events in fallback:', fallbackErr);
      return [];
    }
  }
}

export async function getAllEventsForAdmin(): Promise<EventItem[]> {
  const snap = await getDocs(collection(db, 'events'));
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as EventItem));
}

export async function getEventsByOrganizer(organizerId: string): Promise<EventItem[]> {
  const q = query(collection(db, 'events'), where('organizerId', '==', organizerId));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as EventItem));
}

export async function getEventBySlug(slug: string): Promise<EventItem | null> {
  const q = query(collection(db, 'events'), where('slug', '==', slug), limit(1));
  const snap = await getDocs(q);
  if (!snap.empty) {
    const docSnap = snap.docs[0];
    return { id: docSnap.id, ...docSnap.data() } as EventItem;
  }
  return null;
}

export async function getEventById(id: string): Promise<EventItem | null> {
  const docRef = doc(db, 'events', id);
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    return { id: snap.id, ...snap.data() } as EventItem;
  }
  return null;
}

export async function getEventCategories(eventId: string): Promise<EventCategory[]> {
  const q = query(collection(db, 'event_categories'), where('eventId', '==', eventId));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as EventCategory));
}

export async function createEvent(
  eventData: Omit<EventItem, 'id' | 'createdAt' | 'updatedAt'>,
  actorUid: string,
  actorEmail: string
): Promise<EventItem> {
  const now = new Date().toISOString();
  const docRef = doc(collection(db, 'events'));
  const keywords = generateEventKeywords(eventData);

  const newEvent: EventItem = {
    ...eventData,
    searchKeywords: keywords,
    id: docRef.id,
    createdAt: now,
    updatedAt: now,
    createdBy: actorUid,
    updatedBy: actorUid,
  };

  await setDoc(docRef, newEvent);
  await logAuditEvent(actorUid, actorEmail, 'ADMIN', 'CREATE_EVENT', 'events', docRef.id, { name: eventData.name });

  return newEvent;
}

export async function updateEvent(
  eventId: string,
  eventData: Partial<EventItem>,
  actorUid: string,
  actorEmail: string
): Promise<void> {
  const docRef = doc(db, 'events', eventId);
  const keywords = generateEventKeywords(eventData);
  const updated = {
    ...eventData,
    ...(keywords.length > 0 ? { searchKeywords: keywords } : {}),
    updatedAt: new Date().toISOString(),
    updatedBy: actorUid,
  };
  await updateDoc(docRef, updated);
  await logAuditEvent(actorUid, actorEmail, 'ADMIN', 'UPDATE_EVENT', 'events', eventId);
}

export async function deleteEvent(
  eventId: string,
  actorUid: string,
  actorEmail: string
): Promise<void> {
  await deleteDoc(doc(db, 'events', eventId));
  await logAuditEvent(actorUid, actorEmail, 'ADMIN', 'DELETE_EVENT', 'events', eventId);
}

export async function createCategory(
  categoryData: Omit<EventCategory, 'id' | 'createdAt' | 'updatedAt' | 'registeredCount'>,
  actorUid: string,
  actorEmail: string
): Promise<EventCategory> {
  const now = new Date().toISOString();
  const docRef = doc(collection(db, 'event_categories'));
  const newCat: EventCategory = {
    ...categoryData,
    id: docRef.id,
    registeredCount: 0,
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(docRef, newCat);
  await logAuditEvent(actorUid, actorEmail, 'ADMIN', 'CREATE_CATEGORY', 'event_categories', docRef.id, { name: categoryData.name });
  return newCat;
}

export async function updateCategory(
  categoryId: string,
  data: Partial<EventCategory>,
  actorUid: string,
  actorEmail: string
): Promise<void> {
  const docRef = doc(db, 'event_categories', categoryId);
  await updateDoc(docRef, { ...data, updatedAt: new Date().toISOString() });
  await logAuditEvent(actorUid, actorEmail, 'ADMIN', 'UPDATE_CATEGORY', 'event_categories', categoryId);
}

export async function deleteCategory(
  categoryId: string,
  actorUid: string,
  actorEmail: string
): Promise<void> {
  await deleteDoc(doc(db, 'event_categories', categoryId));
  await logAuditEvent(actorUid, actorEmail, 'ADMIN', 'DELETE_CATEGORY', 'event_categories', categoryId);
}
