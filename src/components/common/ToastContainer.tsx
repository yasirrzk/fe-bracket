import React from 'react';
import { useNotification } from '../../context/NotificationContext';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useNotification();

  if (toasts.length === 0) return null;

  const styles: Record<string, { bg: string; icon: React.ReactNode }> = {
    success: { bg: 'bg-nb-green', icon: <CheckCircle className="w-5 h-5 text-black" /> },
    error: { bg: 'bg-nb-red', icon: <AlertCircle className="w-5 h-5 text-white" /> },
    warning: { bg: 'bg-nb-yellow', icon: <AlertTriangle className="w-5 h-5 text-black" /> },
    info: { bg: 'bg-nb-cardAlt', icon: <Info className="w-5 h-5 text-nb-ink" /> },
  };

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const s = styles[toast.type] || styles.info;
        return (
          <div
            key={toast.id}
            className="pointer-events-auto bg-nb-card text-nb-ink border-3 border-black shadow-brutal-lg p-4 flex items-start gap-3 transition-all animate-in slide-in-from-right"
          >
            <div className={`p-1.5 border-2 border-black ${s.bg} flex-shrink-0 shadow-brutal-sm`}>
              {s.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-mono font-black text-xs uppercase tracking-wider text-nb-ink">{toast.title}</div>
              <div className="text-xs font-sans font-medium mt-1 leading-snug text-nb-ink/90">
                {toast.message}
              </div>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 hover:bg-black hover:text-white transition-colors text-nb-ink"
              aria-label="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
