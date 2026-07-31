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
  orderBy
} from 'firebase/firestore';
import { RacePack, Participant } from '../types';
import { logAuditEvent } from './auditService';

export async function getParticipantRacePack(participantId: string): Promise<RacePack | null> {
  const q = query(collection(db, 'race_packs'), where('participantId', '==', participantId), limit(1));
  const snap = await getDocs(q);
  if (!snap.empty) {
    return { id: snap.docs[0].id, ...snap.docs[0].data() } as RacePack;
  }
  return null;
}

export async function checkInParticipantByQr(
  qrToken: string,
  adminUid: string,
  adminEmail: string
): Promise<{ success: boolean; participant?: Participant; message: string }> {
  const q = query(collection(db, 'participants'), where('qrToken', '==', qrToken), limit(1));
  const snap = await getDocs(q);

  if (snap.empty) {
    return { success: false, message: 'QR Code tidak valid atau peserta tidak ditemukan.' };
  }

  const partDoc = snap.docs[0];
  const partData = { id: partDoc.id, ...partDoc.data() } as Participant;

  if (partData.checkInStatus) {
    return {
      success: false,
      participant: partData,
      message: `Peserta atas nama ${partData.fullName} (BIB: ${partData.bibNumber}) SUDAH melakukan check-in pada ${partData.checkInTime}.`
    };
  }

  const now = new Date().toISOString();
  await updateDoc(doc(db, 'participants', partData.id), {
    checkInStatus: true,
    checkInTime: now,
    updatedAt: now,
  });

  // Update race pack collected status
  const packQ = query(collection(db, 'race_packs'), where('participantId', '==', partData.id), limit(1));
  const packSnap = await getDocs(packQ);
  if (!packSnap.empty) {
    await updateDoc(doc(db, 'race_packs', packSnap.docs[0].id), {
      pickupStatus: 'COLLECTED',
      collectedAt: now,
      collectedBy: adminEmail,
      updatedAt: now,
    });
  } else {
    const packRef = doc(collection(db, 'race_packs'));
    await setDoc(packRef, {
      id: packRef.id,
      participantId: partData.id,
      eventId: partData.eventId,
      bibNumber: partData.bibNumber || '',
      qrToken: partData.qrToken,
      pickupStatus: 'COLLECTED',
      collectedAt: now,
      collectedBy: adminEmail,
      instructions: 'Pengambilan Race Pack Langsung di Lokasi Event',
      createdAt: now,
      updatedAt: now,
    });
  }

  await logAuditEvent(adminUid, adminEmail, 'ADMIN', 'CHECK_IN_PARTICIPANT', 'participants', partData.id, {
    bibNumber: partData.bibNumber,
    fullName: partData.fullName
  });

  return {
    success: true,
    participant: { ...partData, checkInStatus: true, checkInTime: now },
    message: `Check-in BERHASIL untuk ${partData.fullName} (BIB: ${partData.bibNumber}). Race Pack diserahkan.`
  };
}

export async function getRecentCheckIns(limitCount: number = 20): Promise<Participant[]> {
  const q = query(
    collection(db, 'participants'), 
    where('checkInStatus', '==', true), 
    orderBy('checkInTime', 'desc'), 
    limit(limitCount)
  );
  
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Participant));
}
