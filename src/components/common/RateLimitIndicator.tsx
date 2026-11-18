import React from 'react';
import { useNotification } from '../../context/NotificationContext';
import { Timer, AlertOctagon } from 'lucide-react';

export const RateLimitIndicator: React.FC = () => {
  const { cooldownSeconds } = useNotification();

  if (cooldownSeconds <= 0) return null;

  return (
    <div className="fixed bottom-20 right-6 z-40 bg-nb-yellow text-black border-3 border-black shadow-brutal-lg p-4 flex items-center gap-4 animate-bounce font-mono">
      <div className="p-2 bg-white border-2 border-black shadow-brutal-sm">
        <AlertOctagon className="w-6 h-6 text-nb-red" />
      </div>
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase tracking-wider">
            ThrottlerGuard (429)
          </span>
          <span className="px-1.5 py-0.2 bg-black text-white text-[10px] font-black">
            MAX 3 REQ/S
          </span>
        </div>
        <p className="text-xs font-bold mt-1 flex items-center gap-1.5">
          <Timer className="w-3.5 h-3.5" />
          Cooldown aktif: <strong className="text-sm font-black underline">{cooldownSeconds} detik</strong>
        </p>
      </div>
    </div>
  );
};
