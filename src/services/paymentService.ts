import { db } from '../config/firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  updateDoc, 
  query, 
  where, 
  limit 
} from 'firebase/firestore';
import { Payment, PaymentStatus, Registration, EventCategory, Participant } from '../types';
import { logAuditEvent } from './auditService';
import { generateCategoryPrefix } from './registrationService';

export async function getPaymentByRegistrationId(regId: string): Promise<Payment | null> {
  const q = query(collection(db, 'payments'), where('registrationId', '==', regId), limit(1));
  const snap = await getDocs(q);
  if (!snap.empty) {
    return { id: snap.docs[0].id, ...snap.docs[0].data() } as Payment;
  }
  return null;
}

export async function getAllPaymentsAdmin(): Promise<Payment[]> {
  const snap = await getDocs(collection(db, 'payments'));
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Payment));
}

export async function submitPaymentProof(
  paymentId: string,
  registrationId: string,
  proofUrl: string,
  paymentMethod: string,
  actorUid: string,
  actorEmail: string
): Promise<void> {
  const payRef = doc(db, 'payments', paymentId);
  const regRef = doc(db, 'registrations', registrationId);

  const now = new Date().toISOString();
  await updateDoc(payRef, {
    proofUrl,
    paymentMethod,
    updatedAt: now,
  });

  await updateDoc(regRef, {
    status: 'PAYMENT_REVIEW',
    updatedAt: now,
  });

  await logAuditEvent(actorUid, actorEmail, 'PARTICIPANT', 'SUBMIT_PAYMENT_PROOF', 'payments', paymentId);
}

export async function verifyPaymentByAdmin(
  paymentId: string,
  registrationId: string,
  participantId: string, // Kept for backward compatibility, though we fetch all participants
  status: 'APPROVE' | 'REJECT',
  adminUid: string,
  adminEmail: string
): Promise<void> {
  const payRef = doc(db, 'payments', paymentId);
  const regRef = doc(db, 'registrations', registrationId);
  const now = new Date().toISOString();

  if (status === 'APPROVE') {
    // 1. Fetch Registration
    const regSnap = await getDoc(regRef);
    if (!regSnap.exists()) throw new Error('Registration not found');
    const registration = regSnap.data() as Registration;

    // 2. Fetch Category to get Prefix
    const catSnap = await getDoc(doc(db, 'event_categories', registration.categoryId));
    if (!catSnap.exists()) throw new Error('Category not found');
    const category = catSnap.data() as EventCategory;
    const categoryPrefix = generateCategoryPrefix(category.name, category.distance);

    // 3. Find highest existing BIB in this category
    const bibQ = query(
      collection(db, 'participants'),
      where('eventId', '==', registration.eventId),
      where('categoryId', '==', registration.categoryId)
    );
    const bibSnap = await getDocs(bibQ);
    
    // We only want to count participants that ALREADY HAVE a BIB number to avoid gaps
    const participantsWithBib = bibSnap.docs.filter(d => !!d.data().bibNumber).length;
    let nextBibCount = participantsWithBib + 1;

    // 4. Fetch all participants for this registration
    const partQ = query(collection(db, 'participants'), where('registrationId', '==', registrationId));
    const partSnap = await getDocs(partQ);
    
    // 5. Update each participant with a new BIB
    for (const pDoc of partSnap.docs) {
      const pData = pDoc.data() as Participant;
      if (!pData.bibNumber) {
        const newBib = `${categoryPrefix}-${String(nextBibCount).padStart(4, '0')}`;
        
        // Update QR Token with new BIB
        const parts = pData.qrToken.split('_');
        parts[3] = newBib; // Replace registrationId/index with newBib
        const newQrToken = parts.join('_');

        await updateDoc(doc(db, 'participants', pDoc.id), {
          bibNumber: newBib,
          qrToken: newQrToken,
          updatedAt: now
        });
        nextBibCount++;
      }
    }

    await updateDoc(payRef, {
      status: 'PAID',
      paidAt: now,
      updatedAt: now,
    });

    await updateDoc(regRef, {
      status: 'VERIFIED',
      updatedAt: now,
    });

    // Update race pack status for ALL participants in this registration
    for (const pDoc of partSnap.docs) {
      const packQ = query(collection(db, 'race_packs'), where('participantId', '==', pDoc.id), limit(1));
      const packSnap = await getDocs(packQ);
      if (!packSnap.empty) {
        await updateDoc(doc(db, 'race_packs', packSnap.docs[0].id), {
          pickupStatus: 'READY',
          updatedAt: now,
        });
      }
    }

    await logAuditEvent(adminUid, adminEmail, 'ADMIN', 'APPROVE_PAYMENT', 'payments', paymentId, { registrationId });
  } else {
    await updateDoc(payRef, {
      status: 'FAILED',
      updatedAt: now,
    });

    await updateDoc(regRef, {
      status: 'WAITING_PAYMENT',
      updatedAt: now,
    });

    await logAuditEvent(adminUid, adminEmail, 'ADMIN', 'REJECT_PAYMENT', 'payments', paymentId, { registrationId });
  }
}
