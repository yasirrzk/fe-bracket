import React from 'react';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, LogIn } from 'lucide-react';

export const SessionExpiredModal: React.FC = () => {
  const { isSessionExpiredModalOpen, closeSessionExpiredModal, sessionExpiredReason } = useNotification();
  const { openAuthModal } = useAuth();

  if (!isSessionExpiredModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-nb-card text-nb-ink border-3 border-black shadow-brutal-xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 font-sans">
        <div className="flex items-center gap-3.5 mb-5">
          <div className="p-3 bg-nb-red border-3 border-black shadow-brutal-sm">
            <ShieldAlert className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="font-mono text-xs font-black uppercase tracking-wider text-nb-red">
              401 UNAUTHORIZED
            </div>
            <h2 className="text-xl font-black uppercase tracking-tight text-nb-ink">Sesi Kadaluarsa</h2>
          </div>
        </div>

        <p className="text-sm font-medium leading-relaxed mb-5 text-nb-ink/80">
          {sessionExpiredReason ||
            'Sesi aktif akun Anda telah berakhir atau token otorisasi telah di-blacklist pada Redis store. Silakan login kembali.'}
        </p>

        <div className="bg-nb-cardAlt text-nb-ink border-2 border-black p-3.5 font-mono text-xs mb-6 shadow-brutal-sm">
          <div><strong className="text-nb-red font-black">$ auth.status:</strong> SESSION_REVOKED</div>
          <div><strong className="text-nb-red font-black">$ redis.blacklist:</strong> MATCHED_JTI</div>
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t-3 border-black">
          <button
            onClick={closeSessionExpiredModal}
            className="neo-btn-secondary px-4 py-2 text-xs"
          >
            Abaikan
          </button>
          <button
            onClick={() => {
              closeSessionExpiredModal();
              openAuthModal();
            }}
            className="neo-btn px-5 py-2 text-xs flex items-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            <span>Login Ulang</span>
          </button>
        </div>
      </div>
    </div>
  );
};
