import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { leagueService } from '../../services/leagueService';
import { X } from 'lucide-react';
import { CreateLeagueDto } from '../../types/league';

interface CreateLeagueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newLeagueId: string) => void;
}

export const CreateLeagueModal: React.FC<CreateLeagueModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { isAdmin, role } = useAuth();
  const { showToast } = useNotification();

  const [title, setTitle] = useState('');
  const [season, setSeason] = useState('');
  const [game, setGame] = useState('');
  const [description, setDescription] = useState('');
  const [pointsWin, setPointsWin] = useState<number>(3);
  const [pointsDraw, setPointsDraw] = useState<number>(1);
  const [pointsLoss, setPointsLoss] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAdmin) {
      showToast('error', '403 Forbidden', 'Hanya Admin yang berhak membuat kompetisi liga baru.');
      return;
    }

    if (!title.trim() || !season.trim()) {
      showToast('warning', 'Validasi Gagal', 'Nama liga dan musim wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    try {
      const dto: CreateLeagueDto = {
        title: title.trim(),
        season: season.trim(),
        game: game.trim() || undefined,
        description: description.trim() || undefined,
        pointsWin,
        pointsDraw,
        pointsLoss,
      };

      const newLeague = leagueService.createLeague(dto, role);
      showToast('success', 'Liga Berhasil Dibuat', `Liga "${newLeague.title}" siap didaftarkan tim.`);

      setTitle('');
      setSeason('');
      setGame('');
      setDescription('');
      onSuccess(newLeague.id);
      onClose();
    } catch (err: any) {
      showToast('error', 'Gagal Membuat Liga', err.message || 'Terjadi kesalahan sistem.');
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
              Buat Kompetisi Liga Baru
            </h2>
            <p className="text-[10px] font-mono text-zinc-500 uppercase">
              Sistem Round-Robin & Klasemen Poin
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
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          {!isAdmin && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-mono">
              Akses Terbatas: Role USER tidak memiliki otoritas membuat liga baru.
            </div>
          )}

          <div>
            <label htmlFor="league-title" className="block text-[11px] font-mono font-semibold uppercase text-zinc-600 mb-1">
              Nama Liga <span className="text-rose-600">*</span>
            </label>
            <input
              id="league-title"
              type="text"
              required
              placeholder="contoh: Indonesian Champions League 2026"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={!isAdmin || isSubmitting}
              className="w-full px-3 py-2 text-xs bg-white border border-zinc-300 focus:border-zinc-950 text-zinc-950 outline-hidden font-sans transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="league-season" className="block text-[11px] font-mono font-semibold uppercase text-zinc-600 mb-1">
                Musim / Edisi <span className="text-rose-600">*</span>
              </label>
              <input
                id="league-season"
                type="text"
                required
                placeholder="Season 1"
                value={season}
                onChange={(e) => setSeason(e.target.value)}
                disabled={!isAdmin || isSubmitting}
                className="w-full px-3 py-2 text-xs bg-white border border-zinc-300 focus:border-zinc-950 text-zinc-950 outline-hidden font-sans transition-colors"
              />
            </div>

            <div>
              <label htmlFor="league-game" className="block text-[11px] font-mono font-semibold uppercase text-zinc-600 mb-1">
                Cabang Game / Olahraga
              </label>
              <input
                id="league-game"
                type="text"
                placeholder="contoh: eFootball Mobile"
                value={game}
                onChange={(e) => setGame(e.target.value)}
                disabled={!isAdmin || isSubmitting}
                className="w-full px-3 py-2 text-xs bg-white border border-zinc-300 focus:border-zinc-950 text-zinc-950 outline-hidden font-sans transition-colors"
              />
            </div>
          </div>

          <div>
            <label htmlFor="league-description" className="block text-[11px] font-mono font-semibold uppercase text-zinc-600 mb-1">
              Deskripsi / Aturan Kompetisi
            </label>
            <textarea
              id="league-description"
              rows={2}
              placeholder="Jelaskan ringkasan format, hadiah, atau jadwal tanding..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={!isAdmin || isSubmitting}
              className="w-full px-3 py-2 text-xs bg-white border border-zinc-300 focus:border-zinc-950 text-zinc-950 outline-hidden font-sans transition-colors resize-none"
            />
          </div>

          {/* Point Distribution Config */}
          <div className="p-3 bg-zinc-50 border border-zinc-200 space-y-2">
            <span className="block font-mono text-[10px] font-semibold uppercase text-zinc-500 tracking-wider">
              Distribusi Poin Klasemen
            </span>
            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label htmlFor="league-points-win" className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">
                  Menang (W)
                </label>
                <input
                  id="league-points-win"
                  type="number"
                  min={1}
                  max={10}
                  value={pointsWin}
                  onChange={(e) => setPointsWin(Number(e.target.value))}
                  disabled={!isAdmin || isSubmitting}
                  className="w-full px-2 py-1 text-center font-mono font-bold text-xs bg-white border border-zinc-300 text-zinc-950 tabular-nums"
                />
              </div>
              <div>
                <label htmlFor="league-points-draw" className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">
                  Seri (D)
                </label>
                <input
                  id="league-points-draw"
                  type="number"
                  min={0}
                  max={5}
                  value={pointsDraw}
                  onChange={(e) => setPointsDraw(Number(e.target.value))}
                  disabled={!isAdmin || isSubmitting}
                  className="w-full px-2 py-1 text-center font-mono font-bold text-xs bg-white border border-zinc-300 text-zinc-950 tabular-nums"
                />
              </div>
              <div>
                <label htmlFor="league-points-loss" className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">
                  Kalah (L)
                </label>
                <input
                  id="league-points-loss"
                  type="number"
                  min={0}
                  max={5}
                  value={pointsLoss}
                  onChange={(e) => setPointsLoss(Number(e.target.value))}
                  disabled={!isAdmin || isSubmitting}
                  className="w-full px-2 py-1 text-center font-mono font-bold text-xs bg-white border border-zinc-300 text-zinc-950 tabular-nums"
                />
              </div>
            </div>
            <p className="text-[10px] font-mono text-zinc-400">
              Standar: Menang 3 Poin, Seri 1 Poin, Kalah 0 Poin.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-200 font-mono text-xs">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-3 py-1.5 border border-zinc-200 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50 transition-colors font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={!isAdmin || isSubmitting || !title.trim()}
              className="px-4 py-1.5 bg-zinc-950 text-white hover:bg-zinc-800 border border-zinc-950 transition-colors font-semibold disabled:opacity-50"
            >
              {isSubmitting ? 'Membuat...' : 'Buat Liga'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
