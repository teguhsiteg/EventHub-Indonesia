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

    // 2. Fetch all participants for this registration
    const partQ = query(collection(db, 'participants'), where('registrationId', '==', registrationId));
    const partSnap = await getDocs(partQ);
    const participants = partSnap.docs.map(d => ({ id: d.id, ...d.data() } as Participant));

    // 3. Group participants by categoryId
    const participantsByCategory: { [categoryId: string]: Participant[] } = {};
    for (const p of participants) {
      if (!participantsByCategory[p.categoryId]) {
        participantsByCategory[p.categoryId] = [];
      }
      participantsByCategory[p.categoryId].push(p);
    }

    // 4. Generate BIBs for each category group
    for (const categoryId of Object.keys(participantsByCategory)) {
      const catParticipants = participantsByCategory[categoryId];
      
      const catSnap = await getDoc(doc(db, 'event_categories', categoryId));
      if (!catSnap.exists()) continue;
      
      const category = catSnap.data() as EventCategory;
      const { generateCategoryPrefix } = await import('./registrationService');
      const categoryPrefix = generateCategoryPrefix(category.name, category.distance);

      // Find highest existing BIB in this category
      const bibQ = query(
        collection(db, 'participants'),
        where('eventId', '==', registration.eventId),
        where('categoryId', '==', categoryId)
      );
      const bibSnap = await getDocs(bibQ);
      
      const participantsWithBib = bibSnap.docs.filter(d => !!d.data().bibNumber).length;
      let nextBibCount = participantsWithBib + 1;

      // Assign BIB to each participant in this category group
      for (const pData of catParticipants) {
        if (!pData.bibNumber) {
          const newBib = `${categoryPrefix}-${String(nextBibCount).padStart(4, '0')}`;
          
          const parts = pData.qrToken.split('_');
          parts[3] = newBib; 
          const newQrToken = parts.join('_');

          await updateDoc(doc(db, 'participants', pData.id), {
            bibNumber: newBib,
            qrToken: newQrToken,
            updatedAt: now
          });
          nextBibCount++;
        }
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
