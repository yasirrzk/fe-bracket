import React from 'react';
import { useNotification } from '../../context/NotificationContext';

export const RateLimitIndicator: React.FC = () => {
  const { cooldownSeconds } = useNotification();

  if (cooldownSeconds <= 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40 bg-zinc-950 text-white border border-zinc-900 p-3 font-mono text-xs flex items-center gap-3">
      <span className="font-bold text-rose-500 uppercase tracking-widest text-[10px]">
        [429 THROTTLED]
      </span>
      <div className="flex items-center gap-2">
        <span className="text-zinc-400">Cooldown aktif:</span>
        <strong className="text-white font-bold tabular-nums">{cooldownSeconds}s</strong>
      </div>
    </div>
  );
};
