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
import { Payment, PaymentStatus, Registration } from '../types';
import { logAuditEvent } from './auditService';

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
  participantId: string,
  status: 'APPROVE' | 'REJECT',
  adminUid: string,
  adminEmail: string
): Promise<void> {
  const payRef = doc(db, 'payments', paymentId);
  const regRef = doc(db, 'registrations', registrationId);
  const now = new Date().toISOString();

  if (status === 'APPROVE') {
    await updateDoc(payRef, {
      status: 'PAID',
      paidAt: now,
      updatedAt: now,
    });

    await updateDoc(regRef, {
      status: 'VERIFIED',
      updatedAt: now,
    });

    // Also update race pack status
    const packQ = query(collection(db, 'race_packs'), where('participantId', '==', participantId), limit(1));
    const packSnap = await getDocs(packQ);
    if (!packSnap.empty) {
      await updateDoc(doc(db, 'race_packs', packSnap.docs[0].id), {
        pickupStatus: 'READY',
        updatedAt: now,
      });
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
