import React, { useState } from 'react';
import { Match } from '../../types/tournament';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { api } from '../../services/api';
import { X } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ScoreModalProps {
  match: Match | null;
  isOpen: boolean;
  onClose: () => void;
  onScoreSubmitted: () => void;
}

export const ScoreModal: React.FC<ScoreModalProps> = ({ match, isOpen, onClose, onScoreSubmitted }) => {
  const { role, isAdmin } = useAuth();
  const { showToast } = useNotification();
  const [homeScore, setHomeScore] = useState<number>(0);
  const [awayScore, setAwayScore] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (match) {
      setHomeScore(match.homeScore ?? 0);
      setAwayScore(match.awayScore ?? 0);
    }
  }, [match]);

  if (!isOpen || !match) return null;

  const homeName = match.homeCompetitor?.user?.username || match.homeCompetitor?.userId || 'Home Slot';
  const awayName = match.awayCompetitor?.user?.username || match.awayCompetitor?.userId || 'Away Slot';
  const isDraw = homeScore === awayScore;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isDraw) {
      showToast('error', 'Validasi Knockout Gagal', 'Pertandingan sistem gugur dilarang bernilai imbang (seri). Harus ada pemenang!');
      return;
    }
    if (!isAdmin) {
      showToast('error', '403 Forbidden', 'Hanya Admin yang berhak menginput skor pertandingan.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.submitScore(match.id, { homeScore, awayScore }, role);
      if (!match.nextMatchId) {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10B981', '#09090B', '#F59E0B', '#3B82F6'],
        });
        showToast('success', 'Juara Turnamen Ditentukan', `Selamat kepada ${homeScore > awayScore ? homeName : awayName}!`);
      } else {
        showToast('success', 'Skor Berhasil Disimpan', 'Pemenang otomatis dipromosikan ke babak berikutnya.');
      }
      onScoreSubmitted();
      onClose();
    } catch (err: any) {
      showToast('error', 'Gagal Submit Skor', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const ScoreInput = ({
    label,
    value,
    onChange,
  }: {
    label: string;
    value: number;
    onChange: (v: number) => void;
  }) => (
    <div className="flex flex-col items-center gap-2">
      <span className="font-mono text-[10px] font-semibold uppercase text-zinc-600 bg-zinc-200/80 px-1.5 py-0.5 border border-zinc-300">
        {label}
      </span>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={!isAdmin}
          onClick={() => onChange(Math.max(0, value - 1))}
          className="w-8 h-8 bg-white border border-zinc-300 font-mono font-bold text-base text-zinc-900 hover:bg-zinc-100 transition-colors disabled:opacity-40"
        >
          -
        </button>
        <input
          type="number"
          min={0}
          disabled={!isAdmin}
          value={value}
          onChange={(e) => onChange(Math.max(0, parseInt(e.target.value, 10) || 0))}
          className="w-14 h-8 text-center font-mono font-bold text-lg tabular-nums bg-white border border-zinc-300 text-zinc-950 focus:outline-hidden focus:border-zinc-950 disabled:opacity-50"
        />
        <button
          type="button"
          disabled={!isAdmin}
          onClick={() => onChange(value + 1)}
          className="w-8 h-8 bg-white border border-zinc-300 font-mono font-bold text-base text-zinc-900 hover:bg-zinc-100 transition-colors disabled:opacity-40"
        >
          +
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 font-sans backdrop-blur-[1px]">
      <div className="bg-white text-zinc-950 border-2 border-zinc-900 w-full max-w-md p-5 sm:p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-zinc-400 hover:text-zinc-950 hover:bg-zinc-100 transition-colors"
          aria-label="Tutup"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="mb-5">
          <div className="font-mono text-xs font-semibold uppercase tracking-wider text-zinc-500">
            RONDE {match.round} · MATCH {match.matchOrder}
          </div>
          <h2 className="text-lg font-bold uppercase tracking-tight text-zinc-950 mt-0.5">
            Input Skor Pertandingan
          </h2>
        </div>

        {!isAdmin && (
          <div className="mb-4 p-2.5 bg-red-50 border border-red-200 text-red-900 font-mono text-xs">
            403 Guard: Anda login sebagai USER. Form ini dikunci khusus untuk ADMIN.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Scoreboard Cards */}
          <div className="grid grid-cols-2 divide-x divide-zinc-300 bg-zinc-50 border-[1.5px] border-zinc-400 p-4">
            <div className="text-center pr-2">
              <div className="font-mono text-sm font-bold truncate mb-3 text-zinc-950" title={homeName}>
                {homeName}
              </div>
              <ScoreInput label="Slot Home" value={homeScore} onChange={setHomeScore} />
            </div>
            <div className="text-center pl-2">
              <div className="font-mono text-sm font-bold truncate mb-3 text-zinc-950" title={awayName}>
                {awayName}
              </div>
              <ScoreInput label="Slot Away" value={awayScore} onChange={setAwayScore} />
            </div>
          </div>

          {isDraw && (
            <div className="p-2.5 bg-red-50 border border-red-200 text-red-900 text-xs font-mono">
              Skor imbang {homeScore} - {awayScore}. Pertandingan gugur wajib menentukan pemenang!
            </div>
          )}

          {!isDraw && (
            <div className="p-3 bg-zinc-50 border border-zinc-300 text-xs font-mono flex items-center justify-between">
              <span className="text-zinc-600 font-medium">Pemenang Dipromosikan:</span>
              <span className="font-bold text-emerald-700">
                {homeScore > awayScore ? homeName : awayName}
              </span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-zinc-300">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 border border-zinc-300 text-xs font-mono font-medium text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isDraw || !isAdmin}
              className="px-4 py-1.5 bg-zinc-950 text-white text-xs font-mono font-semibold uppercase tracking-wider hover:bg-zinc-800 transition-colors disabled:opacity-50 border border-zinc-950"
            >
              {isSubmitting ? 'MENYIMPAN...' : 'SIMPAN SKOR'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
