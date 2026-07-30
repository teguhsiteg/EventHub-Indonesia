import React from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { notifications, removeNotification } = useSettings();

  if (!notifications.length) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {notifications.map(n => {
        let icon = <Info className="w-5 h-5 text-blue-400" />;
        let borderClass = 'border-blue-500/30 bg-white dark:bg-blue-950/95';

        if (n.type === 'success') {
          icon = <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
          borderClass = 'border-emerald-500/40 bg-white dark:bg-blue-950/95';
        } else if (n.type === 'error') {
          icon = <XCircle className="w-5 h-5 text-rose-400" />;
          borderClass = 'border-rose-500/40 bg-white dark:bg-blue-950/95';
        } else if (n.type === 'warning') {
          icon = <AlertTriangle className="w-5 h-5 text-amber-400" />;
          borderClass = 'border-amber-500/40 bg-white dark:bg-blue-950/95';
        }

        return (
          <div
            key={n.id}
            className={`pointer-events-auto p-4 rounded-xl border ${borderClass} shadow-xl backdrop-blur-md flex items-start gap-3 transition-all animate-in fade-in slide-in-from-bottom-2`}
          >
            <div className="shrink-0 mt-0.5">{icon}</div>
            <div className="flex-1 min-w-0">
              <h5 className="text-xs font-bold text-slate-900 dark:text-slate-900 dark:text-white uppercase tracking-wider">{n.title}</h5>
              <p className="text-xs text-slate-600 dark:text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">{n.message}</p>
            </div>
            <button
              onClick={() => removeNotification(n.id)}
              className="text-slate-500 hover:text-slate-900 dark:text-white shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
