import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { api } from '../../services/api';
import { X } from 'lucide-react';
import { CreateTournamentDto } from '../../types/tournament';

interface CreateTournamentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newTournamentId: string) => void;
}

export const CreateTournamentModal: React.FC<CreateTournamentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { isAdmin, role } = useAuth();
  const { showToast } = useNotification();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [maxParticipants, setMaxParticipants] = useState<number>(8);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      showToast('error', '403 Forbidden', 'Hanya Admin yang berhak membuat turnamen baru.');
      return;
    }

    if (!title.trim()) {
      showToast('warning', 'Validasi Gagal', 'Nama turnamen wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    try {
      const dto: CreateTournamentDto = {
        title: title.trim(),
        description: description.trim() || undefined,
        maxParticipants,
      };

      const created = await api.createTournament(dto, role);
      showToast('success', 'Turnamen Dibuat', `Turnamen "${created.title}" berhasil dibuat dengan kuota ${maxParticipants} peserta.`);
      setTitle('');
      setDescription('');
      setMaxParticipants(8);
      onSuccess(created.id);
      onClose();
    } catch (err: any) {
      showToast('error', 'Gagal Membuat Turnamen', err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 font-sans backdrop-blur-[1px]">
      <div className="relative w-full max-w-lg bg-white border-2 border-zinc-900 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-zinc-300 bg-white">
          <div>
            <h2 className="font-mono font-bold text-sm uppercase text-zinc-950">
              Buat Turnamen Knockout Baru
            </h2>
            <p className="text-[10px] font-mono text-zinc-500 uppercase">
              Sistem Eliminasi Gugur (Binary Tree)
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-950 transition-colors"
            aria-label="Tutup"
          >
            <X className="w-4 h-4 stroke-[1.75]" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {!isAdmin && (
            <div className="p-2.5 bg-red-50 border border-red-200 text-red-900 text-xs font-mono">
              Akses Terbatas: Role USER tidak memiliki otoritas membuat turnamen baru.
            </div>
          )}

          <div>
            <label htmlFor="tournament-title" className="block text-xs font-mono font-semibold uppercase text-zinc-600 mb-1">
              Nama Turnamen <span className="text-rose-600">*</span>
            </label>
            <input
              id="tournament-title"
              type="text"
              required
              placeholder="contoh: Valorant Cyber Clash 2026"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={!isAdmin || isSubmitting}
              className="w-full px-3 py-2 text-xs bg-white border border-zinc-300 focus:border-zinc-950 text-zinc-950 outline-hidden font-sans transition-colors"
            />
          </div>

          <div>
            <label htmlFor="tournament-desc" className="block text-xs font-mono font-semibold uppercase text-zinc-600 mb-1">
              Deskripsi Turnamen
            </label>
            <textarea
              id="tournament-desc"
              rows={3}
              placeholder="Aturan turnamen, mode tanding, format Best-of-3..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={!isAdmin || isSubmitting}
              className="w-full px-3 py-2 text-xs bg-white border border-zinc-300 focus:border-zinc-950 text-zinc-950 outline-hidden font-sans transition-colors resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-semibold uppercase text-zinc-600 mb-1.5">
              Kuota Peserta (Ukuran Bagan)
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[4, 8, 16, 32].map((size) => (
                <button
                  type="button"
                  key={size}
                  onClick={() => setMaxParticipants(size)}
                  className={`py-2 border font-mono text-xs font-bold transition-colors ${
                    maxParticipants === size
                      ? 'bg-zinc-950 text-white border-zinc-950'
                      : 'bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-50'
                  }`}
                >
                  {size} Tim
                </button>
              ))}
            </div>
            <p className="text-[11px] font-mono text-zinc-400 mt-1">
              Bagan eliminasi single elimination membutuhkan kuota berpangkat 2 (4, 8, 16, atau 32 peserta).
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-zinc-300">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 border border-zinc-300 text-xs font-mono font-medium text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !isAdmin}
              className="px-4 py-1.5 bg-zinc-950 text-white text-xs font-mono font-semibold uppercase tracking-wider hover:bg-zinc-800 transition-colors disabled:opacity-50 border border-zinc-950"
            >
              {isSubmitting ? 'Membuat...' : 'Buat Turnamen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
