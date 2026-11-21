import React, { useState } from 'react';
import { LeagueMatch } from '../../types/league';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { leagueService } from '../../services/leagueService';
import { X } from 'lucide-react';

interface LeagueScoreModalProps {
  match: LeagueMatch | null;
  isOpen: boolean;
  onClose: () => void;
  onScoreSubmitted: () => void;
}

interface ScoreInputProps {
  label: string;
  value: number;
  disabled?: boolean;
  onChange: (val: number) => void;
}

const ScoreInput: React.FC<ScoreInputProps> = ({
  label,
  value,
  disabled = false,
  onChange,
}) => (
  <div className="flex flex-col items-center gap-2">
    <span className="font-mono text-[10px] font-semibold uppercase text-zinc-600 bg-zinc-200/80 px-1.5 py-0.5 border border-zinc-300">
      {label}
    </span>
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(Math.max(0, value - 1))}
        className="w-8 h-8 bg-white border border-zinc-300 font-mono font-bold text-base text-zinc-900 hover:bg-zinc-100 transition-colors disabled:opacity-40"
      >
        -
      </button>
      <input
        type="number"
        min={0}
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(Math.max(0, parseInt(e.target.value, 10) || 0))}
        className="w-14 h-8 text-center font-mono font-bold text-lg tabular-nums bg-white border border-zinc-300 text-zinc-950 focus:outline-hidden focus:border-zinc-950 disabled:opacity-50"
      />
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(value + 1)}
        className="w-8 h-8 bg-white border border-zinc-300 font-mono font-bold text-base text-zinc-900 hover:bg-zinc-100 transition-colors disabled:opacity-40"
      >
        +
      </button>
    </div>
  </div>
);

export const LeagueScoreModal: React.FC<LeagueScoreModalProps> = ({
  match,
  isOpen,
  onClose,
  onScoreSubmitted,
}) => {
  const { isAdmin, role } = useAuth();
  const { showToast } = useNotification();
  const [userScores, setUserScores] = useState<{ matchId: string; home: number; away: number } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !match) return null;

  // Derive scores directly during render
  const homeScore =
    userScores && userScores.matchId === match.id
      ? userScores.home
      : (match.homeScore ?? 0);

  const awayScore =
    userScores && userScores.matchId === match.id
      ? userScores.away
      : (match.awayScore ?? 0);

  const homeName = match.homeTeam?.name || 'Home Team';
  const awayName = match.awayTeam?.name || 'Away Team';
  const isDraw = homeScore === awayScore;
  const homeWins = homeScore > awayScore;

  const handleHomeScoreChange = (val: number) => {
    setUserScores({
      matchId: match.id,
      home: val,
      away: awayScore,
    });
  };

  const handleAwayScoreChange = (val: number) => {
    setUserScores({
      matchId: match.id,
      home: homeScore,
      away: val,
    });
  };

  const handleClose = () => {
    setUserScores(null);
    onClose();
  };

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
      setUserScores(null);
      onScoreSubmitted();
      onClose();
    } catch (err: any) {
      showToast('error', 'Gagal Simpan Skor', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 font-sans backdrop-blur-[1px]">
      <div className="bg-white text-zinc-950 border-2 border-zinc-900 w-full max-w-md p-5 sm:p-6 relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1 text-zinc-400 hover:text-zinc-950 hover:bg-zinc-100 transition-colors"
          aria-label="Tutup"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="mb-5">
          <div className="font-mono text-xs font-semibold uppercase tracking-wider text-zinc-500">
            PEKAN {match.matchday} · SISTEM LIGA
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
              {match.homeTeam?.logoUrl ? (
                <img
                  src={match.homeTeam.logoUrl}
                  alt={homeName}
                  className="w-12 h-12 object-cover mx-auto mb-2 border border-zinc-300 bg-white"
                />
              ) : (
                <div className="w-12 h-12 mx-auto mb-2 bg-zinc-900 text-white font-mono font-bold text-xs flex items-center justify-center">
                  {match.homeTeam?.tag || 'HOM'}
                </div>
              )}
              <div className="font-mono text-sm font-bold truncate mb-3 text-zinc-950" title={homeName}>
                {homeName}
              </div>
              <ScoreInput
                label="Tuan Rumah"
                value={homeScore}
                disabled={!isAdmin}
                onChange={handleHomeScoreChange}
              />
            </div>
            <div className="text-center pl-2">
              {match.awayTeam?.logoUrl ? (
                <img
                  src={match.awayTeam.logoUrl}
                  alt={awayName}
                  className="w-12 h-12 object-cover mx-auto mb-2 border border-zinc-300 bg-white"
                />
              ) : (
                <div className="w-12 h-12 mx-auto mb-2 bg-zinc-900 text-white font-mono font-bold text-xs flex items-center justify-center">
                  {match.awayTeam?.tag || 'AWY'}
                </div>
              )}
              <div className="font-mono text-sm font-bold truncate mb-3 text-zinc-950" title={awayName}>
                {awayName}
              </div>
              <ScoreInput
                label="Klub Tamu"
                value={awayScore}
                disabled={!isAdmin}
                onChange={handleAwayScoreChange}
              />
            </div>
          </div>

          {/* Points Impact Live Preview */}
          <div className="p-3 bg-zinc-50 border border-zinc-300 font-mono text-xs">
            <div className="text-[11px] uppercase font-semibold text-zinc-500 mb-1.5">
              Simulasi Tambahan Poin Klasemen:
            </div>
            {isDraw ? (
              <div className="flex items-center justify-between text-xs bg-white p-2 border border-zinc-300">
                <span className="text-zinc-600 font-medium">Hasil Seri (Imbang)</span>
                <span className="font-semibold text-zinc-900">+1 Poin untuk Kedua Tim</span>
              </div>
            ) : homeWins ? (
              <div className="flex items-center justify-between text-xs bg-white p-2 border border-zinc-300">
                <span className="text-zinc-600 font-medium">{homeName} Menang</span>
                <span className="font-semibold text-emerald-700">+3 Poin ({awayName} +0)</span>
              </div>
            ) : (
              <div className="flex items-center justify-between text-xs bg-white p-2 border border-zinc-300">
                <span className="text-zinc-600 font-medium">{awayName} Menang</span>
                <span className="font-semibold text-emerald-700">+3 Poin ({homeName} +0)</span>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-zinc-300">
            <button
              type="button"
              onClick={handleClose}
              className="px-3 py-1.5 border border-zinc-300 text-xs font-mono font-medium text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !isAdmin}
              className="px-4 py-1.5 bg-zinc-950 text-white text-xs font-mono font-semibold uppercase tracking-wider hover:bg-zinc-800 transition-colors disabled:opacity-50 border border-zinc-950"
            >
              {isSubmitting ? 'MENYIMPAN...' : 'SIMPAN SKOR LIGA'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
