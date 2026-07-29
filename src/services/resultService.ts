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
  orderBy, 
  limit 
} from 'firebase/firestore';
import { RaceResult, FinisherStatus } from '../types';
import { logAuditEvent } from './auditService';

export async function getPublicRaceResults(eventId?: string, categoryId?: string, searchQuery?: string): Promise<RaceResult[]> {
  let q = collection(db, 'race_results') as any;
  if (eventId) {
    q = query(collection(db, 'race_results'), where('eventId', '==', eventId));
  }
  const snap = await getDocs(q);
  let results = snap.docs.map(doc => ({ id: doc.id, ...(doc.data() as object) } as RaceResult));

  if (categoryId) {
    results = results.filter(r => r.categoryId === categoryId);
  }

  if (searchQuery && searchQuery.trim().length > 0) {
    const term = searchQuery.trim().toLowerCase();
    results = results.filter(r => 
      r.participantName.toLowerCase().includes(term) || 
      r.bibNumber.toLowerCase().includes(term)
    );
  }

  // Sort by category rank / chip time
  results.sort((a, b) => {
    if (a.status !== 'FINISH') return 1;
    if (b.status !== 'FINISH') return -1;
    return a.rank - b.rank;
  });

  return results;
}

export async function getResultByParticipantId(participantId: string): Promise<RaceResult | null> {
  const q = query(collection(db, 'race_results'), where('participantId', '==', participantId), limit(1));
  const snap = await getDocs(q);
  if (!snap.empty) {
    return { id: snap.docs[0].id, ...snap.docs[0].data() } as RaceResult;
  }
  return null;
}

export async function submitOrUpdateRaceResult(
  resultData: Omit<RaceResult, 'id' | 'createdAt' | 'updatedAt'>,
  actorUid: string,
  actorEmail: string
): Promise<RaceResult> {
  const existingQ = query(collection(db, 'race_results'), where('participantId', '==', resultData.participantId), limit(1));
  const snap = await getDocs(existingQ);
  const now = new Date().toISOString();

  if (!snap.empty) {
    const existingDoc = snap.docs[0];
    const updated = {
      ...resultData,
      updatedAt: now,
    };
    await updateDoc(doc(db, 'race_results', existingDoc.id), updated);
    await logAuditEvent(actorUid, actorEmail, 'ADMIN', 'UPDATE_RACE_RESULT', 'race_results', existingDoc.id);
    return { id: existingDoc.id, ...updated, createdAt: snap.docs[0].data().createdAt } as RaceResult;
  } else {
    const newRef = doc(collection(db, 'race_results'));
    const newResult: RaceResult = {
      ...resultData,
      id: newRef.id,
      createdAt: now,
      updatedAt: now,
    };
    await setDoc(newRef, newResult);
    await logAuditEvent(actorUid, actorEmail, 'ADMIN', 'CREATE_RACE_RESULT', 'race_results', newRef.id);
    return newResult;
  }
}
