import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const WARNING_BEFORE_MS = 60 * 1000; // 1 minute warning before logout

export const AutoLogout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningRef = useRef<NodeJS.Timeout | null>(null);
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(60);

  const resetTimer = () => {
    if (!user) return;
    
    // Clear existing timers
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);
    setShowWarning(false);
    setCountdown(60);

    // Set warning timer
    warningRef.current = setTimeout(() => {
      setShowWarning(true);
    }, IDLE_TIMEOUT_MS - WARNING_BEFORE_MS);

    // Set actual logout timer
    timeoutRef.current = setTimeout(async () => {
      await logout();
      navigate('/login');
    }, IDLE_TIMEOUT_MS);
  };

  useEffect(() => {
    if (!user) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);
      setShowWarning(false);
      return;
    }

    // Initialize timers
    resetTimer();

    // Event listeners to detect activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    const handleUserActivity = () => {
      if (!showWarning) {
        resetTimer();
      }
    };

    events.forEach(evt => window.addEventListener(evt, handleUserActivity));

    return () => {
      events.forEach(evt => window.removeEventListener(evt, handleUserActivity));
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);
    };
  }, [user, showWarning]);

  // Countdown effect when warning is shown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (showWarning && countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [showWarning, countdown]);

  if (!showWarning) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-red-500/30 text-center animate-in fade-in zoom-in duration-300">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase mb-2">Sesi Akan Berakhir</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          Tidak ada aktivitas yang terdeteksi. Anda akan di-logout otomatis dalam 
          <span className="block text-3xl font-black text-red-600 my-2">{countdown} detik</span>
        </p>
        <button
          onClick={resetTimer}
          className="w-full bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 py-3 rounded-xl font-bold uppercase tracking-wider transition-colors"
        >
          Tetap Login
        </button>
      </div>
    </div>
  );
};
