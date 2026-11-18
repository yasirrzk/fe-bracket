import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { leagueService } from '../../services/leagueService';
import { X, ShieldAlert, Plus, TableProperties } from 'lucide-react';
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
  const [season, setSeason] = useState('Season 1');
  const [game, setGame] = useState('VALORANT Esports');
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
      setSeason('Season 1');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans">
      <div className="relative w-full max-w-lg bg-nb-card border-3 border-black shadow-brutal-lg animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b-3 border-black bg-nb-cardAlt">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-nb-yellow border-2 border-black">
              <TableProperties className="w-5 h-5 text-black" />
            </div>
            <div>
              <h2 className="font-mono font-black text-sm uppercase text-nb-ink">Buat Kompetisi Liga Baru</h2>
              <p className="text-[10px] font-mono font-bold text-nb-muted uppercase">Sistem Round-Robin & Klasemen Poin</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 border-2 border-black bg-nb-card hover:bg-nb-red hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {!isAdmin && (
            <div className="p-3 bg-nb-red/10 border-2 border-nb-red text-nb-red text-xs font-mono font-bold flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>Akses Terbatas: Role USER tidak memiliki otoritas membuat liga baru.</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-mono font-black uppercase text-nb-ink mb-1.5">
              Nama Liga <span className="text-nb-red">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="contoh: Indonesian Champions League 2026"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={!isAdmin || isSubmitting}
              className="w-full px-3 py-2 text-sm bg-nb-bg border-3 border-black font-sans font-bold text-nb-ink focus:outline-hidden focus:bg-nb-card disabled:opacity-60"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono font-black uppercase text-nb-ink mb-1.5">
                Musim / Edisi <span className="text-nb-red">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Season 1"
                value={season}
                onChange={(e) => setSeason(e.target.value)}
                disabled={!isAdmin || isSubmitting}
                className="w-full px-3 py-2 text-sm bg-nb-bg border-3 border-black font-mono font-bold text-nb-ink focus:outline-hidden focus:bg-nb-card disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-black uppercase text-nb-ink mb-1.5">
                Cabang Game / Olahraga
              </label>
              <input
                type="text"
                placeholder="contoh: VALORANT"
                value={game}
                onChange={(e) => setGame(e.target.value)}
                disabled={!isAdmin || isSubmitting}
                className="w-full px-3 py-2 text-sm bg-nb-bg border-3 border-black font-sans font-bold text-nb-ink focus:outline-hidden focus:bg-nb-card disabled:opacity-60"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-black uppercase text-nb-ink mb-1.5">
              Deskripsi / Aturan Kompetisi
            </label>
            <textarea
              rows={2}
              placeholder="Jelaskan ringkasan format, hadiah, atau jadwal tanding..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={!isAdmin || isSubmitting}
              className="w-full px-3 py-2 text-xs bg-nb-bg border-3 border-black font-sans font-medium text-nb-ink focus:outline-hidden focus:bg-nb-card disabled:opacity-60 resize-none"
            />
          </div>

          {/* Point Distribution Config */}
          <div className="p-3.5 bg-nb-cardAlt border-2 border-black space-y-2">
            <span className="block font-mono text-[11px] font-black uppercase text-nb-ink tracking-wider">
              ⚙️ Pengaturan Skor Poin Klasemen
            </span>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-mono font-bold text-nb-muted uppercase mb-1">
                  Poin Menang (W)
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={pointsWin}
                  onChange={(e) => setPointsWin(Number(e.target.value))}
                  disabled={!isAdmin || isSubmitting}
                  className="w-full px-2.5 py-1.5 text-center font-mono font-black text-sm bg-nb-bg border-2 border-black text-nb-ink"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono font-bold text-nb-muted uppercase mb-1">
                  Poin Seri (D)
                </label>
                <input
                  type="number"
                  min={0}
                  max={5}
                  value={pointsDraw}
                  onChange={(e) => setPointsDraw(Number(e.target.value))}
                  disabled={!isAdmin || isSubmitting}
                  className="w-full px-2.5 py-1.5 text-center font-mono font-black text-sm bg-nb-bg border-2 border-black text-nb-ink"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono font-bold text-nb-muted uppercase mb-1">
                  Poin Kalah (L)
                </label>
                <input
                  type="number"
                  min={0}
                  max={5}
                  value={pointsLoss}
                  onChange={(e) => setPointsLoss(Number(e.target.value))}
                  disabled={!isAdmin || isSubmitting}
                  className="w-full px-2.5 py-1.5 text-center font-mono font-black text-sm bg-nb-bg border-2 border-black text-nb-ink"
                />
              </div>
            </div>
            <p className="text-[10px] font-mono text-nb-muted">
              Standar FIFA/Esports: Menang 3 Poin, Seri 1 Poin, Kalah 0 Poin.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t-2 border-black">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 border-2 border-black bg-nb-cardAlt text-xs font-mono font-black uppercase hover:bg-black/10 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={!isAdmin || isSubmitting || !title.trim()}
              className="px-5 py-2 border-3 border-black bg-nb-yellow text-black text-xs font-mono font-black uppercase shadow-brutal-sm hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-brutal disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>{isSubmitting ? 'Membuat...' : 'Buat Liga Sekarang'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
