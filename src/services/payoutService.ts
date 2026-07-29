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
  orderBy
} from 'firebase/firestore';
import { PayoutRequest, PayoutStatus } from '../types';
import { logAuditEvent } from './auditService';

export async function requestPayout(
  eventId: string,
  organizerId: string,
  amount: number,
  bankName: string,
  accountNumber: string,
  accountHolderName: string
): Promise<PayoutRequest> {
  const payoutRef = doc(collection(db, 'payouts'));
  const now = new Date().toISOString();
  
  const payout: PayoutRequest = {
    id: payoutRef.id,
    eventId,
    organizerId,
    amount,
    bankName,
    accountNumber,
    accountHolderName,
    status: 'PENDING',
    requestedAt: now,
  };

  await setDoc(payoutRef, payout);
  await logAuditEvent(organizerId, '', 'ORGANIZER', 'REQUEST_PAYOUT', 'payouts', payout.id, { amount });

  return payout;
}

export async function getAllPayoutsAdmin(): Promise<PayoutRequest[]> {
  const snap = await getDocs(query(collection(db, 'payouts'), orderBy('requestedAt', 'desc')));
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as PayoutRequest));
}

export async function approvePayout(
  payoutId: string,
  status: 'APPROVED' | 'PAID' | 'REJECTED',
  proofUrl: string,
  notes: string,
  adminUid: string,
  adminEmail: string
): Promise<void> {
  const payoutRef = doc(db, 'payouts', payoutId);
  const now = new Date().toISOString();

  await updateDoc(payoutRef, {
    status,
    proofUrl,
    notes,
    processedAt: now,
  });

  await logAuditEvent(adminUid, adminEmail, 'ADMIN', `UPDATE_PAYOUT_STATUS_${status}`, 'payouts', payoutId);
}
