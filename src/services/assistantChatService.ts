import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  onSnapshot, 
  serverTimestamp,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface ChatMessage {
  id?: string;
  role: 'user' | 'bot';
  text: string;
  timestamp: any;
}

export interface ChatSession {
  id: string;
  sessionId: string;
  lastMessage: string;
  lastSender: 'user' | 'bot';
  messageCount: number;
  createdAt: any;
  updatedAt: any;
  userMeta?: {
    userAgent?: string;
    pathname?: string;
    referrer?: string;
  };
  messages?: ChatMessage[];
}

const SESSIONS_COLLECTION = 'assistant_chat_sessions';

/**
 * Menyimpan atau memperbarui pesan dalam sesi percakapan Asisten Guwigo
 */
export async function saveAssistantMessage(
  sessionId: string,
  role: 'user' | 'bot',
  text: string,
  userMeta?: { pathname?: string; referrer?: string }
): Promise<void> {
  try {
    const sessionRef = doc(db, SESSIONS_COLLECTION, sessionId);
    const msgId = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const msgRef = doc(collection(sessionRef, 'messages'), msgId);

    const now = new Date();

    // 1. Simpan pesan individu di sub-koleksi
    await setDoc(msgRef, {
      id: msgId,
      role,
      text,
      timestamp: now
    });

    // 2. Update metadata session
    await setDoc(sessionRef, {
      sessionId,
      lastMessage: text,
      lastSender: role,
      updatedAt: now,
      ...(role === 'user' && {
        userMeta: {
          userAgent: navigator.userAgent,
          pathname: userMeta?.pathname || window.location.pathname,
          referrer: document.referrer || ''
        }
      })
    }, { merge: true });

  } catch (error) {
    console.warn('Gagal menyimpan riwayat chat ke Firestore:', error);
  }
}

/**
 * Berlangganan (realtime) ke seluruh sesi chat untuk Admin Monitor
 */
export function subscribeToChatSessions(
  callback: (sessions: ChatSession[]) => void,
  maxSessions = 50
) {
  const q = query(
    collection(db, SESSIONS_COLLECTION),
    orderBy('updatedAt', 'desc'),
    limit(maxSessions)
  );

  return onSnapshot(q, (snapshot) => {
    const sessions: ChatSession[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ChatSession));
    callback(sessions);
  }, (error) => {
    console.error('Error listening to chat sessions:', error);
  });
}

/**
 * Berlangganan (realtime) ke pesan dalam sesi tertentu
 */
export function subscribeToSessionMessages(
  sessionId: string,
  callback: (messages: ChatMessage[]) => void
) {
  const q = query(
    collection(db, SESSIONS_COLLECTION, sessionId, 'messages'),
    orderBy('timestamp', 'asc')
  );

  return onSnapshot(q, (snapshot) => {
    const messages: ChatMessage[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ChatMessage));
    callback(messages);
  }, (error) => {
    console.error(`Error listening to messages for session ${sessionId}:`, error);
  });
}

/**
 * Hapus sesi percakapan oleh Admin
 */
export async function deleteChatSession(sessionId: string): Promise<void> {
  const sessionRef = doc(db, SESSIONS_COLLECTION, sessionId);
  await deleteDoc(sessionRef);
}
