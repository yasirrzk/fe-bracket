import React, { useState } from 'react';
import { Match } from '../../types/tournament';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { api } from '../../services/api';
import { X, Swords, Trophy, AlertTriangle } from 'lucide-react';
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
      showToast('error', 'Validasi Knockout Gagal', 'Pertandingan sistem gugur dilarang bernilai seri! Harus ada pemenang.');
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
          colors: ['#E5A93C', '#000000', '#C8523F', '#6F9254'],
        });
        showToast('success', '🏆 Juara Turnamen Telah Ditentukan!', `Selamat kepada ${homeScore > awayScore ? homeName : awayName}!`);
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
      <span className="font-mono text-xs font-black uppercase text-black bg-nb-yellow px-2 py-0.5 border border-black shadow-brutal-sm">
        {label}
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={!isAdmin}
          onClick={() => onChange(Math.max(0, value - 1))}
          className="w-10 h-10 bg-nb-card border-3 border-black font-mono font-black text-xl text-nb-ink hover:bg-nb-yellow hover:text-black active:translate-y-0.5 transition-all shadow-brutal-sm disabled:opacity-40"
        >
          -
        </button>
        <input
          type="number"
          min={0}
          disabled={!isAdmin}
          value={value}
          onChange={(e) => onChange(Math.max(0, parseInt(e.target.value, 10) || 0))}
          className="w-16 h-10 text-center font-mono font-black text-2xl bg-nb-cardAlt border-3 border-black text-nb-ink focus:outline-none focus:bg-nb-cardHover shadow-brutal-sm disabled:opacity-50"
        />
        <button
          type="button"
          disabled={!isAdmin}
          onClick={() => onChange(value + 1)}
          className="w-10 h-10 bg-nb-card border-3 border-black font-mono font-black text-xl text-nb-ink hover:bg-nb-yellow hover:text-black active:translate-y-0.5 transition-all shadow-brutal-sm disabled:opacity-40"
        >
          +
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-nb-card text-nb-ink border-3 border-black shadow-brutal-xl max-w-md w-full p-6 relative animate-in fade-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 hover:bg-black hover:text-white transition-colors"
          aria-label="Tutup"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-nb-yellow text-black border-3 border-black shadow-brutal-sm">
            <Swords className="w-6 h-6" />
          </div>
          <div>
            <div className="font-mono text-xs font-black uppercase tracking-wider text-nb-muted">
              RONDE {match.round} • MATCH {match.matchOrder}
            </div>
            <h2 className="text-xl font-black uppercase tracking-tight text-nb-ink">Input Skor Pertandingan</h2>
          </div>
        </div>

        {!isAdmin && (
          <div className="mb-4 p-3 bg-nb-red text-white border-3 border-black font-mono text-xs font-black">
            403 Guard: Anda login sebagai USER. Form ini dikunci khusus untuk ADMIN.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Scoreboard */}
          <div className="grid grid-cols-2 gap-4 bg-nb-cardAlt p-5 border-3 border-black shadow-brutal-sm">
            <div className="text-center">
              <div className="font-mono text-sm font-black truncate mb-3 text-nb-ink">{homeName}</div>
              <ScoreInput label="Slot Home" value={homeScore} onChange={setHomeScore} />
            </div>
            <div className="text-center border-l-3 border-black pl-4">
              <div className="font-mono text-sm font-black truncate mb-3 text-nb-ink">{awayName}</div>
              <ScoreInput label="Slot Away" value={awayScore} onChange={setAwayScore} />
            </div>
          </div>

          {isDraw && (
            <div className="p-3 bg-nb-yellow text-black border-3 border-black text-xs font-mono font-black flex items-center gap-2 shadow-brutal-sm">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>Skor {homeScore} - {awayScore} bernilai imbang. Skor harus menentukan pemenang!</span>
            </div>
          )}

          {!isDraw && (
            <div className="p-3 bg-black text-white text-xs font-mono font-black flex items-center justify-between shadow-brutal-sm border-2 border-black">
              <span className="flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-nb-yellow" /> Pemenang Dipromosikan:
              </span>
              <span className="text-nb-yellow underline">
                {homeScore > awayScore ? homeName : awayName}
              </span>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2 border-t-3 border-black">
            <button type="button" onClick={onClose} className="neo-btn-secondary px-4 py-2">
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isDraw || !isAdmin}
              className="neo-btn px-6 py-2"
            >
              {isSubmitting ? 'MENYIMPAN...' : 'SIMPAN SKOR'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
