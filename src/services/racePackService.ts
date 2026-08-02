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

export async function findParticipantForRpc(searchTerm: string): Promise<Participant | null> {
  const cleanTerm = searchTerm.trim();
  
  // 1. qrToken
  const qrQ = query(collection(db, 'participants'), where('qrToken', '==', cleanTerm), limit(1));
  const qrSnap = await getDocs(qrQ);
  if (!qrSnap.empty) return { id: qrSnap.docs[0].id, ...qrSnap.docs[0].data() } as Participant;

  // 2. bibNumber
  const bibQ = query(collection(db, 'participants'), where('bibNumber', '==', cleanTerm), limit(1));
  const bibSnap = await getDocs(bibQ);
  if (!bibSnap.empty) return { id: bibSnap.docs[0].id, ...bibSnap.docs[0].data() } as Participant;

  // 3. email
  const emailQ = query(collection(db, 'participants'), where('email', '==', cleanTerm.toLowerCase()), limit(1));
  const emailSnap = await getDocs(emailQ);
  if (!emailSnap.empty) return { id: emailSnap.docs[0].id, ...emailSnap.docs[0].data() } as Participant;

  // 4. Participant ID directly
  try {
    const docSnap = await getDoc(doc(db, 'participants', cleanTerm));
    if (docSnap.exists()) return { id: docSnap.id, ...docSnap.data() } as Participant;
  } catch(e) {}

  return null;
}

export async function checkInParticipantByQr(
  searchTerm: string,
  adminUid: string,
  adminEmail: string,
  bibNumber?: string
): Promise<{ success: boolean; participant?: Participant; eventName?: string; categoryName?: string; message: string }> {
  
  const partData = await findParticipantForRpc(searchTerm);

  if (!partData) {
    return { success: false, message: 'Data peserta tidak ditemukan (QR / BIB / Email tidak valid).' };
  }
  
  // Fetch event and category names
  let eventName = 'EventHub Running Event';
  let categoryName = partData.categoryId; // Fallback to ID
  
  try {
    const eventSnap = await getDoc(doc(db, 'events', partData.eventId));
    if (eventSnap.exists()) {
      eventName = eventSnap.data().name;
    }
    const catSnap = await getDoc(doc(db, 'events', partData.eventId, 'categories', partData.categoryId));
    if (catSnap.exists()) {
      categoryName = catSnap.data().name;
    }
  } catch(e) {}

  if (partData.checkInStatus) {
    return {
      success: false,
      participant: partData,
      eventName,
      categoryName,
      message: `Peserta atas nama ${partData.fullName} (BIB: ${partData.bibNumber || '-'}) SUDAH melakukan pengambilan Race Pack pada ${partData.checkInTime}.`
    };
  }

  const now = new Date().toISOString();
  const finalBibNumber = bibNumber || partData.bibNumber;

  const updateData: any = {
    checkInStatus: true,
    checkInTime: now,
    updatedAt: now,
  };

  if (finalBibNumber) {
    updateData.bibNumber = finalBibNumber;
  }

  await updateDoc(doc(db, 'participants', partData.id), updateData);

  // Update race pack collected status
  const packQ = query(collection(db, 'race_packs'), where('participantId', '==', partData.id), limit(1));
  const packSnap = await getDocs(packQ);
  if (!packSnap.empty) {
    await updateDoc(doc(db, 'race_packs', packSnap.docs[0].id), {
      pickupStatus: 'COLLECTED',
      bibNumber: finalBibNumber || '',
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
      bibNumber: finalBibNumber || '',
      qrToken: partData.qrToken,
      pickupStatus: 'COLLECTED',
      collectedAt: now,
      collectedBy: adminEmail,
      instructions: 'Pengambilan Race Pack Langsung di Lokasi Event',
      createdAt: now,
      updatedAt: now,
    });
  }

  await logAuditEvent(adminUid, adminEmail, 'ADMIN', 'RPC_COLLECTION', 'participants', partData.id, {
    bibNumber: finalBibNumber,
    fullName: partData.fullName
  });

  // Trigger RPC Email
  triggerRpcEmail(partData.id).catch(() => {});

  return {
    success: true,
    participant: { ...partData, checkInStatus: true, checkInTime: now, bibNumber: finalBibNumber },
    eventName,
    categoryName,
    message: `Pengambilan Race Pack BERHASIL untuk ${partData.fullName} (BIB: ${finalBibNumber || 'Belum Diatur'}).`
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

export async function triggerRpcEmail(participantId: string): Promise<void> {
  try {
    const partSnap = await getDoc(doc(db, 'participants', participantId));
    if (!partSnap.exists()) return;
    const participant = partSnap.data() as Participant;

    const eventSnap = await getDoc(doc(db, 'events', participant.eventId));
    let eventName = 'EventHub Running Event';
    if (eventSnap.exists()) {
      eventName = eventSnap.data().name;
    }

    await fetch('/api/notifications/send-rpc-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipientEmail: participant.email,
        participantName: participant.fullName,
        bibNumber: participant.bibNumber,
        eventName: eventName,
        checkInTime: participant.checkInTime,
      }),
    }).catch(err => console.warn('RPC Notification background notice:', err));
  } catch (e) {
    console.warn('Could not dispatch automated RPC email notification:', e);
  }
}
