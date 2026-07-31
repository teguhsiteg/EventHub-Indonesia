import { db } from '../config/firebase';
import { collection, addDoc, getDocs, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { EventRequest, EventRequestStatus } from '../types';

export const createEventRequest = async (requestData: Omit<EventRequest, 'id' | 'status' | 'createdAt'>): Promise<EventRequest> => {
  const requestsRef = collection(db, 'event_requests');
  
  const newRequest = {
    ...requestData,
    status: 'PENDING' as EventRequestStatus,
    createdAt: new Date().toISOString()
  };

  const docRef = await addDoc(requestsRef, newRequest);

  return {
    ...newRequest,
    id: docRef.id
  };
};

export const getEventRequests = async (): Promise<EventRequest[]> => {
  const requestsRef = collection(db, 'event_requests');
  const q = query(requestsRef, orderBy('createdAt', 'desc'));
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as EventRequest[];
};

export const updateEventRequestStatus = async (requestId: string, status: EventRequestStatus): Promise<void> => {
  const docRef = doc(db, 'event_requests', requestId);
  await updateDoc(docRef, {
    status
  });
};
