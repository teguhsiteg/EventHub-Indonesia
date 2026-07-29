import { db } from '../config/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { AuditLog, UserRole } from '../types';

export async function logAuditEvent(
  actorId: string,
  actorEmail: string,
  actorRole: UserRole,
  action: string,
  resource: string,
  resourceId: string,
  metadata?: Record<string, any>
): Promise<void> {
  try {
    const auditData: Omit<AuditLog, 'id'> = {
      actorId,
      actorEmail,
      actorRole,
      action,
      resource,
      resourceId,
      metadata: metadata || {},
      createdAt: new Date().toISOString(),
    };

    await addDoc(collection(db, 'audit_logs'), auditData);
  } catch (error) {
    console.error('Failed to write audit log:', error);
  }
}
