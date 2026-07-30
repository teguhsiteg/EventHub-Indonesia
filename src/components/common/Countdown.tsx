import React, { useState, useEffect } from 'react';
import { Timer } from 'lucide-react';

interface CountdownProps {
  targetDateISO: string;
}

export const Countdown: React.FC<CountdownProps> = ({ targetDateISO }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isPassed: false,
  });

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date().getTime();
      const target = new Date(targetDateISO).getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isPassed: true });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isPassed: false });
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [targetDateISO]);

  if (timeLeft.isPassed) {
    return (
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-600 dark:text-slate-300 font-bold text-xs uppercase tracking-wider">
        <Timer className="w-4 h-4 text-emerald-400" />
        <span>Event Berlangsung / Selesai</span>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-blue-950/90 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xl">
      <div className="flex items-center gap-2 text-xs font-bold text-orange-400 uppercase tracking-wider mb-3">
        <Timer className="w-4 h-4" />
        <span>Hitung Mundur Race Start</span>
      </div>
      <div className="grid grid-cols-4 gap-2 text-center">
        <div className=" p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="block text-xl font-black text-slate-900 dark:text-white">{String(timeLeft.days).padStart(2, '0')}</span>
          <span className="block text-[10px] font-semibold text-slate-500 dark:text-slate-500 dark:text-slate-400 uppercase">HARI</span>
        </div>
        <div className=" p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="block text-xl font-black text-slate-900 dark:text-white">{String(timeLeft.hours).padStart(2, '0')}</span>
          <span className="block text-[10px] font-semibold text-slate-500 dark:text-slate-500 dark:text-slate-400 uppercase">JAM</span>
        </div>
        <div className=" p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="block text-xl font-black text-slate-900 dark:text-white">{String(timeLeft.minutes).padStart(2, '0')}</span>
          <span className="block text-[10px] font-semibold text-slate-500 dark:text-slate-500 dark:text-slate-400 uppercase">MENIT</span>
        </div>
        <div className=" p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="block text-xl font-black text-orange-400">{String(timeLeft.seconds).padStart(2, '0')}</span>
          <span className="block text-[10px] font-semibold text-slate-500 dark:text-slate-500 dark:text-slate-400 uppercase">DETIK</span>
        </div>
      </div>
    </div>
  );
};
