import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { api } from '../../services/api';
import { X, Trophy, AlertTriangle } from 'lucide-react';

interface CreateTournamentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (tournamentId: string) => void;
}

export const CreateTournamentModal: React.FC<CreateTournamentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { role, isAdmin } = useAuth();
  const { showToast } = useNotification();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [maxParticipants, setMaxParticipants] = useState(8);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('error', 'Validasi Gagal', 'Judul turnamen wajib diisi.');
      return;
    }
    if (maxParticipants < 2 || maxParticipants > 128) {
      showToast('error', 'Validasi Gagal', 'Jumlah peserta harus antara 2 hingga 128.');
      return;
    }
    if (!isAdmin) {
      showToast('error', '403 Forbidden', 'Hanya Admin yang dapat membuat turnamen.');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await api.createTournament(
        {
          title: title.trim(),
          description: description.trim() || undefined,
          maxParticipants,
        },
        role
      );
      showToast('success', 'Turnamen Dibuat', `Turnamen "${created.title}" berhasil dipublikasikan.`);
      onClose();
      onSuccess(created.id);
    } catch (err: any) {
      showToast('error', 'Gagal Membuat Turnamen', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-nb-card text-nb-ink border-3 border-black shadow-brutal-xl max-w-lg w-full p-6 relative animate-in fade-in zoom-in-95 font-sans">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 hover:bg-black hover:text-white transition-colors"
          aria-label="Tutup"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-nb-yellow border-3 border-black shadow-brutal-sm">
            <Trophy className="w-6 h-6 text-black" />
          </div>
          <div>
            <span className="font-mono text-xs font-black uppercase tracking-wider text-nb-muted block">
              TOURNAMENT CREATOR (ADMIN ONLY)
            </span>
            <h2 className="text-xl font-black uppercase tracking-tight text-nb-ink">Buat Turnamen Baru</h2>
          </div>
        </div>

        {!isAdmin && (
          <div className="mb-4 p-3 bg-nb-red text-white border-3 border-black font-mono text-xs font-black flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>403 Guard: Pembuatan turnamen secara eksklusif hanya dapat dilakukan oleh ADMIN.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono font-black uppercase mb-1 text-nb-ink">
              Judul Turnamen <span className="text-nb-red">*</span>
            </label>
            <input
              type="text"
              required
              disabled={!isAdmin}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. VALORANT CHAMPIONS 2026"
              className="neo-input disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-black uppercase mb-1 text-nb-ink">Deskripsi Turnamen</label>
            <textarea
              rows={3}
              disabled={!isAdmin}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Aturan main, struktur babak, dan hadiah kejuaraan..."
              className="neo-input disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-black uppercase mb-1 text-nb-ink">
              Kapasitas Peserta (2 - 128) <span className="text-nb-red">*</span>
            </label>
            <div className="grid grid-cols-4 gap-2 mb-2">
              {[4, 8, 16, 32].map((num) => (
                <button
                  type="button"
                  key={num}
                  disabled={!isAdmin}
                  onClick={() => setMaxParticipants(num)}
                  className={`py-2 border-3 border-black font-mono text-xs font-black transition-all disabled:opacity-50 ${
                    maxParticipants === num
                      ? 'bg-nb-yellow text-black shadow-brutal-sm translate-x-[-1px] translate-y-[-1px]'
                      : 'bg-nb-cardAlt text-nb-ink hover:bg-nb-cardHover'
                  }`}
                >
                  {num} Teams
                </button>
              ))}
            </div>
            <input
              type="number"
              min={2}
              max={128}
              required
              disabled={!isAdmin}
              value={maxParticipants}
              onChange={(e) => setMaxParticipants(parseInt(e.target.value, 10) || 2)}
              className="neo-input disabled:opacity-50"
            />
            <span className="text-xs font-mono font-bold text-nb-muted mt-1 block">
              Format Single-Elimination Knockout akan otomatis mengisi slot Bye bila peserta bukan pangkat 2.
            </span>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t-3 border-black">
            <button
              type="button"
              onClick={onClose}
              className="neo-btn-secondary px-5 py-2 text-xs"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !isAdmin}
              className="neo-btn px-6 py-2 text-xs"
            >
              {isSubmitting ? 'MENYIMPAN...' : 'PUBLIKASIKAN TURNAMEN'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
