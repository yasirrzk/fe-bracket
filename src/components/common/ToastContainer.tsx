import React from 'react';
import { useNotification } from '../../context/NotificationContext';
import { X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useNotification();

  if (toasts.length === 0) return null;

  const getBorderColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-l-emerald-500';
      case 'error':
        return 'border-l-rose-600';
      case 'warning':
        return 'border-l-amber-500';
      case 'info':
      default:
        return 'border-l-zinc-900';
    }
  };

  const getTag = (type: string) => {
    switch (type) {
      case 'success':
        return 'OK';
      case 'error':
        return 'ERR';
      case 'warning':
        return 'WARN';
      case 'info':
      default:
        return 'INFO';
    }
  };

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none font-sans">
      {toasts.map((toast) => {
        const borderLeft = getBorderColor(toast.type);
        const tag = getTag(toast.type);

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto bg-white text-zinc-950 border border-zinc-900 border-l-[3px] ${borderLeft} p-3 flex items-start justify-between gap-3 transition-all animate-in slide-in-from-right`}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                  [{tag}]
                </span>
                <span className="font-mono font-bold text-xs uppercase tracking-tight text-zinc-950 truncate">
                  {toast.title}
                </span>
              </div>
              <div className="text-xs text-zinc-600 font-normal mt-1 leading-snug">
                {toast.message}
              </div>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-0.5 text-zinc-400 hover:text-zinc-950 transition-colors shrink-0"
              aria-label="Tutup notifikasi"
            >
              <X className="w-3.5 h-3.5 stroke-[1.75]" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
