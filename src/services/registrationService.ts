import { db } from '../config/firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  limit,
  runTransaction,
  increment 
} from 'firebase/firestore';
import { Registration, Participant, Payment, EventCategory, EventItem } from '../types';
import { logAuditEvent } from './auditService';

export interface RegistrationFormData {
  fullName: string;
  nik: string;
  email: string;
  phone: string;
  birthDate: string;
  gender: 'MALE' | 'FEMALE';
  address: string;
  city: string;
  province: string;
  bloodType: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'UNSPECIFIED';
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
  jerseySize: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'XXXL';
}

// Generate category bib prefix (e.g., Trail 50K -> TR50, Fun Run 5K -> FR05)
function generateCategoryPrefix(categoryName: string, distance: string): string {
  const cleanDist = distance.replace(/[^0-9]/g, '').padStart(2, '0');
  const words = categoryName.trim().toUpperCase().split(' ');
  let prefix = 'RC';
  if (words.length >= 2) {
    prefix = `${words[0][0]}${words[1][0]}`;
  } else if (words.length === 1 && words[0].length >= 2) {
    prefix = words[0].substring(0, 2);
  }
  return `${prefix}${cleanDist}`;
}

export async function createRegistration(
  userId: string,
  eventId: string,
  categoryId: string,
  formData: RegistrationFormData
): Promise<{ registration: Registration; participant: Participant; payment: Payment }> {
  // 1. Check existing registration to prevent duplicates
  const existingQ = query(
    collection(db, 'registrations'),
    where('userId', '==', userId),
    where('eventId', '==', eventId),
    where('categoryId', '==', categoryId)
  );
  const existingSnap = await getDocs(existingQ);
  if (!existingSnap.empty) {
    const existing = existingSnap.docs[0].data() as Registration;
    if (existing.status !== 'CANCELLED') {
      throw new Error('Anda telah terdaftar pada kategori lomba ini untuk event ini.');
    }
  }

  // 2. Fetch category and event data
  const categoryRef = doc(db, 'event_categories', categoryId);
  const categorySnap = await getDoc(categoryRef);
  if (!categorySnap.exists()) {
    throw new Error('Kategori event tidak ditemukan.');
  }
  const category = categorySnap.data() as EventCategory;

  if (category.registeredCount >= category.quota) {
    throw new Error('Kuota pendaftaran untuk kategori ini sudah habis.');
  }

  const eventSnap = await getDoc(doc(db, 'events', eventId));
  if (!eventSnap.exists()) {
    throw new Error('Event tidak ditemukan.');
  }
  const event = eventSnap.data() as EventItem;

  // 3. Generate IDs and BIB Number
  const now = new Date();
  const timestamp = now.getTime();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const regNumber = `REG-${now.getFullYear()}-${randomSuffix}`;
  const invoiceId = `INV-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${randomSuffix}`;

  const categoryPrefix = generateCategoryPrefix(category.name, category.distance);
  
  // Find highest existing BIB in this category to prevent duplicate
  const bibQ = query(
    collection(db, 'participants'),
    where('eventId', '==', eventId),
    where('categoryId', '==', categoryId)
  );
  const bibSnap = await getDocs(bibQ);
  const count = bibSnap.size + 1;
  const bibNumber = `${categoryPrefix}-${String(count).padStart(4, '0')}`;

  const qrToken = `RACEPRO_QR_${eventId.substring(0, 5)}_${bibNumber}_${randomSuffix}`;

  const regRef = doc(collection(db, 'registrations'));
  const partRef = doc(collection(db, 'participants'));
  const payRef = doc(collection(db, 'payments'));

  const registration: Registration = {
    id: regRef.id,
    registrationNumber: regNumber,
    userId,
    eventId,
    categoryId,
    status: 'WAITING_PAYMENT',
    amount: category.price,
    invoiceId,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };

  const participant: Participant = {
    id: partRef.id,
    userId,
    registrationId: regRef.id,
    eventId,
    categoryId,
    fullName: formData.fullName,
    nik: formData.nik,
    email: formData.email,
    phone: formData.phone,
    birthDate: formData.birthDate,
    gender: formData.gender,
    address: formData.address,
    city: formData.city,
    province: formData.province,
    bloodType: formData.bloodType,
    emergencyContactName: formData.emergencyContactName,
    emergencyContactPhone: formData.emergencyContactPhone,
    emergencyContactRelation: formData.emergencyContactRelation,
    jerseySize: formData.jerseySize,
    bibNumber,
    qrToken,
    checkInStatus: false,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };

  const paymentExpiredAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours expiry
  const payment: Payment = {
    id: payRef.id,
    registrationId: regRef.id,
    userId,
    invoiceId,
    amount: category.price,
    status: category.price === 0 ? 'PAID' : 'PENDING',
    paymentMethod: category.price === 0 ? 'GRATIS' : 'TRANSFER_BANK / PAYMENT_GATEWAY',
    expiredAt: paymentExpiredAt,
    paidAt: category.price === 0 ? now.toISOString() : undefined,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };

  // Atomic creation using Firestore batch/set
  await setDoc(regRef, registration);
  await setDoc(partRef, participant);
  await setDoc(payRef, payment);

  // Update category registered count
  await updateDoc(categoryRef, {
    registeredCount: increment(1)
  });

  // Create initial empty medical assessment record
  const medRef = doc(collection(db, 'medical_assessments'));
  await setDoc(medRef, {
    id: medRef.id,
    participantId: partRef.id,
    userId,
    eventId,
    medicalConditions: [],
    allergies: 'Tidak Ada',
    emergencyContactVerified: true,
    declarationAccepted: true,
    status: 'NOT_STARTED',
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  });

  await logAuditEvent(userId, formData.email, 'PARTICIPANT', 'CREATE_REGISTRATION', 'registrations', regRef.id, {
    regNumber,
    bibNumber,
    eventName: event.name,
    categoryName: category.name
  });

  // Trigger automated registration confirmation email
  try {
    fetch('/api/notifications/send-registration-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipientEmail: formData.email,
        participantName: formData.fullName,
        registrationNumber: regNumber,
        bibNumber,
        eventName: event.name,
        categoryName: category.name,
        eventDate: new Date(event.startDate).toLocaleDateString('id-ID', { dateStyle: 'full' }),
        location: event.location,
        qrToken,
      }),
    }).catch(err => console.warn('Notification trigger background notice:', err));
  } catch (e) {
    console.warn('Could not dispatch automated registration email notification:', e);
  }

  return { registration, participant, payment };
}

export async function getUserRegistrations(userId: string): Promise<Registration[]> {
  const q = query(collection(db, 'registrations'), where('userId', '==', userId));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Registration));
}

export async function getAllRegistrationsAdmin(): Promise<Registration[]> {
  const snap = await getDocs(collection(db, 'registrations'));
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Registration));
}

export async function getParticipantByRegistrationId(regId: string): Promise<Participant | null> {
  const q = query(collection(db, 'participants'), where('registrationId', '==', regId), limit(1));
  const snap = await getDocs(q);
  if (!snap.empty) {
    return { id: snap.docs[0].id, ...snap.docs[0].data() } as Participant;
  }
  return null;
}

export async function getParticipantByUserIdAndEvent(userId: string, eventId: string): Promise<Participant | null> {
  const q = query(
    collection(db, 'participants'),
    where('userId', '==', userId),
    where('eventId', '==', eventId),
    limit(1)
  );
  const snap = await getDocs(q);
  if (!snap.empty) {
    return { id: snap.docs[0].id, ...snap.docs[0].data() } as Participant;
  }
  return null;
}

export async function getParticipantByQrToken(qrToken: string): Promise<Participant | null> {
  const q = query(collection(db, 'participants'), where('qrToken', '==', qrToken), limit(1));
  const snap = await getDocs(q);
  if (!snap.empty) {
    return { id: snap.docs[0].id, ...snap.docs[0].data() } as Participant;
  }
  return null;
}
