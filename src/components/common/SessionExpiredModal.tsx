import React from 'react';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';

export const SessionExpiredModal: React.FC = () => {
  const { isSessionExpiredModalOpen, closeSessionExpiredModal, sessionExpiredReason } = useNotification();
  const { openAuthModal } = useAuth();

  if (!isSessionExpiredModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-[1px]">
      <div className="bg-white text-zinc-950 border-2 border-zinc-900 max-w-md w-full p-5 sm:p-6 font-sans animate-in fade-in zoom-in-95">
        <div className="mb-4">
          <span className="font-mono text-[10px] font-bold text-rose-600 uppercase tracking-widest block mb-0.5">
            [401 UNAUTHORIZED]
          </span>
          <h2 className="text-lg font-bold uppercase tracking-tight text-zinc-950">
            Sesi Kadaluarsa
          </h2>
        </div>

        <p className="text-xs text-zinc-600 leading-relaxed mb-4">
          {sessionExpiredReason ||
            'Sesi aktif akun Anda telah berakhir atau token otorisasi telah di-blacklist pada Redis store. Silakan login kembali.'}
        </p>

        <div className="bg-zinc-50 text-zinc-950 border border-zinc-300 p-3 font-mono text-xs mb-5 space-y-1">
          <div><strong className="text-rose-600 font-semibold">$ auth.status:</strong> SESSION_REVOKED</div>
          <div><strong className="text-rose-600 font-semibold">$ redis.blacklist:</strong> MATCHED_JTI</div>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-zinc-300 font-mono text-xs">
          <button
            onClick={closeSessionExpiredModal}
            className="px-3 py-1.5 border border-zinc-300 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50 transition-colors font-semibold"
          >
            Abaikan
          </button>
          <button
            onClick={() => {
              closeSessionExpiredModal();
              openAuthModal();
            }}
            className="px-3.5 py-1.5 bg-zinc-950 text-white hover:bg-zinc-800 border border-zinc-950 transition-colors font-semibold"
          >
            Login Ulang
          </button>
        </div>
      </div>
    </div>
  );
};
