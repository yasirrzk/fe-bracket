import React, { useState, useEffect } from 'react';
import { LeagueMatch } from '../../types/league';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { leagueService } from '../../services/leagueService';
import { X, Swords, ShieldAlert, Scale } from 'lucide-react';

interface LeagueScoreModalProps {
  match: LeagueMatch | null;
  isOpen: boolean;
  onClose: () => void;
  onScoreSubmitted: () => void;
}

export const LeagueScoreModal: React.FC<LeagueScoreModalProps> = ({
  match,
  isOpen,
  onClose,
  onScoreSubmitted,
}) => {
  const { isAdmin, role } = useAuth();
  const { showToast } = useNotification();
  const [homeScore, setHomeScore] = useState<number>(0);
  const [awayScore, setAwayScore] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (match) {
      setHomeScore(match.homeScore ?? 0);
      setAwayScore(match.awayScore ?? 0);
    }
  }, [match]);

  if (!isOpen || !match) return null;

  const homeName = match.homeTeam?.name || 'Home Team';
  const awayName = match.awayTeam?.name || 'Away Team';
  const isDraw = homeScore === awayScore;
  const homeWins = homeScore > awayScore;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      showToast('error', '403 Forbidden', 'Hanya Admin yang berhak menginput skor pertandingan liga.');
      return;
    }

    setIsSubmitting(true);
    try {
      leagueService.submitScore(match.id, { homeScore, awayScore }, role);
      showToast(
        'success',
        'Skor Liga Disimpan',
        `Hasil pertandingan ${homeName} (${homeScore}) vs (${awayScore}) ${awayName} berhasil disimpan. Klasemen otomatis diperbarui!`
      );
      onScoreSubmitted();
      onClose();
    } catch (err: any) {
      showToast('error', 'Gagal Simpan Skor', err.message);
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
    onChange: (val: number) => void;
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 font-sans">
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
              PEKAN {match.matchday} • SISTEM LIGA
            </div>
            <h2 className="text-xl font-black uppercase tracking-tight text-nb-ink">
              Input Skor Pertandingan
            </h2>
          </div>
        </div>

        {!isAdmin && (
          <div className="mb-4 p-3 bg-nb-red text-white border-3 border-black font-mono text-xs font-black flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span>403 Guard: Anda login sebagai USER. Form ini dikunci khusus untuk ADMIN.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Scoreboard Cards */}
          <div className="grid grid-cols-2 gap-4 bg-nb-cardAlt p-5 border-3 border-black shadow-brutal-sm">
            <div className="text-center">
              <div className="font-mono text-sm font-black truncate mb-3 text-nb-ink" title={homeName}>
                {homeName}
              </div>
              <ScoreInput label="Klub Tuan Rumah" value={homeScore} onChange={setHomeScore} />
            </div>
            <div className="text-center border-l-3 border-black pl-4">
              <div className="font-mono text-sm font-black truncate mb-3 text-nb-ink" title={awayName}>
                {awayName}
              </div>
              <ScoreInput label="Klub Tamu" value={awayScore} onChange={setAwayScore} />
            </div>
          </div>

          {/* Points Impact Live Preview */}
          <div className="p-3 bg-nb-card border-2 border-black font-mono text-xs shadow-brutal-sm">
            <div className="text-[10px] uppercase font-black text-nb-muted mb-1.5 flex items-center gap-1">
              <Scale className="w-3.5 h-3.5 text-nb-yellow" /> Simulasi Tambahan Poin Klasemen:
            </div>
            {isDraw ? (
              <div className="flex items-center justify-between font-black text-nb-ink bg-nb-cardAlt p-2 border border-black">
                <span>Hasil Seri (Imbang)</span>
                <span className="text-nb-yellow">+1 Poin untuk Kedua Tim</span>
              </div>
            ) : homeWins ? (
              <div className="flex items-center justify-between font-black text-nb-ink bg-nb-cardAlt p-2 border border-black">
                <span>{homeName} Menang</span>
                <span className="text-nb-green">+3 Poin ({awayName} +0)</span>
              </div>
            ) : (
              <div className="flex items-center justify-between font-black text-nb-ink bg-nb-cardAlt p-2 border border-black">
                <span>{awayName} Menang</span>
                <span className="text-nb-green">+3 Poin ({homeName} +0)</span>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t-3 border-black">
            <button type="button" onClick={onClose} className="neo-btn-secondary px-4 py-2 text-xs">
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !isAdmin}
              className="neo-btn px-6 py-2 text-xs"
            >
              {isSubmitting ? 'MENYIMPAN...' : 'SIMPAN SKOR LIGA'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
