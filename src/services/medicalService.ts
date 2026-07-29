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
  limit 
} from 'firebase/firestore';
import { MedicalAssessment } from '../types';
import { logAuditEvent } from './auditService';

export async function getMedicalAssessmentByParticipant(participantId: string): Promise<MedicalAssessment | null> {
  const q = query(collection(db, 'medical_assessments'), where('participantId', '==', participantId), limit(1));
  const snap = await getDocs(q);
  if (!snap.empty) {
    return { id: snap.docs[0].id, ...snap.docs[0].data() } as MedicalAssessment;
  }
  return null;
}

export async function submitMedicalAssessment(
  participantId: string,
  userId: string,
  eventId: string,
  conditions: string[],
  allergies: string,
  emergencyContactVerified: boolean,
  declarationAccepted: boolean
): Promise<MedicalAssessment> {
  const existing = await getMedicalAssessmentByParticipant(participantId);
  const now = new Date().toISOString();

  if (existing) {
    const medRef = doc(db, 'medical_assessments', existing.id);
    const updated: Partial<MedicalAssessment> = {
      medicalConditions: conditions,
      allergies,
      emergencyContactVerified,
      declarationAccepted,
      status: 'SUBMITTED',
      updatedAt: now,
    };
    await updateDoc(medRef, updated);
    return { ...existing, ...updated } as MedicalAssessment;
  } else {
    const medRef = doc(collection(db, 'medical_assessments'));
    const newAssessment: MedicalAssessment = {
      id: medRef.id,
      participantId,
      userId,
      eventId,
      medicalConditions: conditions,
      allergies,
      emergencyContactVerified,
      declarationAccepted,
      status: 'SUBMITTED',
      createdAt: now,
      updatedAt: now,
    };
    await setDoc(medRef, newAssessment);
    return newAssessment;
  }
}

export async function reviewMedicalAssessment(
  assessmentId: string,
  status: 'APPROVED' | 'REJECTED',
  notes: string,
  reviewerUid: string,
  reviewerEmail: string
): Promise<void> {
  const medRef = doc(db, 'medical_assessments', assessmentId);
  await updateDoc(medRef, {
    status,
    notes,
    reviewedBy: reviewerEmail,
    reviewedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  await logAuditEvent(reviewerUid, reviewerEmail, 'ADMIN', 'REVIEW_MEDICAL_ASSESSMENT', 'medical_assessments', assessmentId, { status });
}
