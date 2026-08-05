import React from 'react';
import { AlertTriangle, Clock, QrCode, ShieldAlert, CheckCircle2, MapPin, ArrowRight } from 'lucide-react';
import { EventItem, Participant } from '../../types';

interface UpcomingEventAlertProps {
  event: EventItem;
  participant?: Participant | null;
  onOpenQr?: () => void;
  onOpenMedical?: () => void;
  hasCompletedMedical?: boolean;
}

export const UpcomingEventAlert: React.FC<UpcomingEventAlertProps> = ({
  event,
  participant,
  onOpenQr,
  onOpenMedical,
  hasCompletedMedical = false
}) => {
  const eventTime = new Date(event.startDate).getTime();
  const now = Date.now();
  const hoursRemaining = (eventTime - now) / (1000 * 60 * 60);

  // Only render if event is starting within 48 hours or ongoing today
  if (hoursRemaining > 48 || hoursRemaining < -24) {
    return null;
  }

  const isToday = hoursRemaining <= 12 && hoursRemaining >= -12;
  const isTomorrow = hoursRemaining > 12 && hoursRemaining <= 36;
  const hoursFormatted = Math.max(1, Math.ceil(hoursRemaining));

  return (
    <div className="mb-8 rounded-3xl bg-gradient-to-r from-yellow-950/80 via-red-950/90 to-red-950/80 border-2 border-yellow-500/60 p-6 sm:p-7 shadow-2xl shadow-red-950/50 relative overflow-hidden">
      {/* Background glow circle */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        
        {/* Left Info Column */}
        <div className="space-y-3 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500 text-slate-950 font-black text-[11px] uppercase tracking-wider animate-pulse shadow-md">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>PERINGATAN RACE DAY (&lt; 48 JAM)</span>
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-50 dark:bg-red-950/90 border border-yellow-500/40 text-yellow-300 font-extrabold text-xs">
              <Clock className="w-3.5 h-3.5 text-yellow-400" />
              <span>
                {isToday
                  ? 'HARI INI!'
                  : isTomorrow
                  ? `MULAI BESOK (${hoursFormatted} JAM LAGI)`
                  : `TINGGAL ${hoursFormatted} JAM LAGI`}
              </span>
            </span>
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-900 dark:text-white uppercase tracking-tight">
              {event.name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-600 dark:text-slate-300 mt-1 flex items-center gap-1.5 font-medium">
              <MapPin className="w-4 h-4 text-red-400 shrink-0" />
              <span>{event.location} • {new Date(event.startDate).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' })}</span>
            </p>
          </div>

          {/* Actionable Race Day Readiness Checklist */}
          <div className="pt-2 flex flex-wrap gap-3 text-xs">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border ${
              participant?.checkInStatus 
                ? 'bg-emerald-950/60 border-emerald-800 text-emerald-400' 
                : 'bg-white dark:bg-red-950/90 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-600 dark:text-slate-300'
            }`}>
              <CheckCircle2 className={`w-3.5 h-3.5 ${participant?.checkInStatus ? 'text-emerald-400' : 'text-slate-500'}`} />
              <span>Race Pack: <strong>{participant?.checkInStatus ? 'Sudah Diambil' : 'Belum Diambil'}</strong></span>
            </div>

            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border ${
              hasCompletedMedical 
                ? 'bg-emerald-950/60 border-emerald-800 text-emerald-400' 
                : 'bg-yellow-950/80 border-yellow-800/80 text-yellow-300'
            }`}>
              <ShieldAlert className={`w-3.5 h-3.5 ${hasCompletedMedical ? 'text-emerald-400' : 'text-yellow-400'}`} />
              <span>Asesmen Medis: <strong>{hasCompletedMedical ? 'Terisi' : 'Perlu Diisi'}</strong></span>
            </div>
          </div>
        </div>

        {/* Right CTA Actions */}
        <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 w-full lg:w-auto shrink-0">
          {onOpenQr && participant && (
            <button
              type="button"
              onClick={onOpenQr}
              className="px-5 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-2"
            >
              <QrCode className="w-4 h-4" />
              <span>Tampilkan QR Check-In</span>
            </button>
          )}

          {!hasCompletedMedical && onOpenMedical && (
            <button
              type="button"
              onClick={onOpenMedical}
              className="px-5 py-2.5 rounded-xl bg-white dark:bg-red-950/90 hover:bg-slate-100 dark:bg-slate-800 border border-yellow-500/50 text-yellow-300 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
            >
              <ShieldAlert className="w-4 h-4 text-yellow-400" />
              <span>Isi Asesmen Medis Now</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
