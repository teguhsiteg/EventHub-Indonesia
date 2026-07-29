import { db } from '../config/firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  query, 
  where, 
  limit 
} from 'firebase/firestore';
import { Certificate, RaceResult } from '../types';

export async function getCertificateByParticipant(participantId: string): Promise<Certificate | null> {
  const q = query(collection(db, 'certificates'), where('participantId', '==', participantId), limit(1));
  const snap = await getDocs(q);
  if (!snap.empty) {
    return { id: snap.docs[0].id, ...snap.docs[0].data() } as Certificate;
  }
  return null;
}

export async function issueCertificateForFinisher(
  result: RaceResult,
  eventName: string,
  categoryName: string
): Promise<Certificate> {
  const existing = await getCertificateByParticipant(result.participantId);
  if (existing) return existing;

  const certRef = doc(collection(db, 'certificates'));
  const certNum = `CERT-2026-${Math.floor(100000 + Math.random() * 900000)}`;

  const cert: Certificate = {
    id: certRef.id,
    certificateNumber: certNum,
    participantId: result.participantId,
    resultId: result.id,
    eventName,
    categoryName,
    participantName: result.participantName,
    bibNumber: result.bibNumber,
    finishTime: result.chipTime || result.gunTime,
    rank: result.rank,
    categoryRank: result.categoryRank,
    issuedAt: new Date().toISOString(),
  };

  await setDoc(certRef, cert);
  return cert;
}
