import React from 'react';
import { Match } from '../../types/tournament';
import { Trophy, Swords, Lock, Eye } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface MatchCardProps {
  match: Match;
  onSelectMatch: (match: Match) => void;
  isGrandFinal?: boolean;
}

export const MatchCard: React.FC<MatchCardProps> = ({ match, onSelectMatch, isGrandFinal = false }) => {
  const { isAdmin } = useAuth();
  const isPending = match.status === 'PENDING';
  const isCompleted = match.status === 'COMPLETED';
  const homeWinner = isCompleted && match.winnerId === match.homeCompetitorId;
  const awayWinner = isCompleted && match.winnerId === match.awayCompetitorId;
  const homeName = match.homeCompetitor?.user?.username || match.homeCompetitor?.userId || (isPending ? 'TBD (Menunggu)' : 'Slot Kosong');
  const awayName = match.awayCompetitor?.user?.username || match.awayCompetitor?.userId || (isPending ? 'TBD (Menunggu)' : 'Slot Kosong');

  const statusLabel = () => {
    switch (match.status) {
      case 'COMPLETED':
        return <span className="px-1.5 py-0.5 bg-black text-[#FAF6ED] text-[9px] font-mono font-black uppercase">SELESAI</span>;
      case 'READY':
        return <span className="px-1.5 py-0.5 bg-nb-yellow text-black text-[9px] font-mono font-black uppercase border border-black">SIAP TANDING</span>;
      case 'IN_PROGRESS':
        return <span className="px-1.5 py-0.5 bg-nb-red text-white text-[9px] font-mono font-black uppercase">LIVE MATCH</span>;
      default:
        return (
          <span className="px-1.5 py-0.5 bg-nb-cardAlt text-nb-muted text-[9px] font-mono font-bold uppercase flex items-center gap-0.5">
            <Lock className="w-2.5 h-2.5" /> MENUNGGU
          </span>
        );
    }
  };

  const CompRow = ({
    name,
    score,
    isWinner,
    slotNum,
  }: {
    name: string;
    score: number | null | undefined;
    isWinner: boolean;
    slotNum: number;
  }) => (
    <div
      className={`flex items-center justify-between px-3 py-2 border-b-2 border-black last:border-b-0 transition-colors ${
        isWinner ? 'bg-nb-yellow text-black font-black' : 'bg-nb-cardAlt text-nb-ink'
      }`}
    >
      <div className="flex items-center gap-2 truncate pr-2">
        <span className={`text-[10px] font-mono font-bold ${isWinner ? 'text-black/70' : 'text-nb-muted'}`}>
          #{slotNum}
        </span>
        <span className={`text-xs font-mono truncate ${isWinner ? 'font-black text-black' : 'font-bold text-nb-ink'}`}>
          {name}
        </span>
        {isWinner && <Trophy className="w-3.5 h-3.5 text-black flex-shrink-0" />}
      </div>
      <span
        className={`font-mono font-black text-sm px-2 py-0.5 border border-black min-w-[28px] text-center ${
          isWinner ? 'bg-black text-nb-yellow' : score !== null && score !== undefined ? 'bg-nb-card text-nb-ink' : 'text-nb-muted bg-nb-cardAlt'
        }`}
      >
        {score ?? '-'}
      </span>
    </div>
  );

  return (
    <div
      className={`w-64 border-3 border-black bg-nb-card text-nb-ink transition-all ${
        isGrandFinal
          ? 'shadow-brutal-lg ring-2 ring-nb-yellow'
          : isPending
          ? 'opacity-60 shadow-brutal-sm'
          : 'shadow-brutal hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-brutal-lg'
      }`}
    >
      {/* Match Header Bar */}
      <div className="px-3 py-1.5 border-b-3 border-black flex items-center justify-between bg-nb-cardAlt font-mono text-[10px] font-black text-nb-ink">
        <div className="flex items-center gap-1.5">
          <span>MATCH {match.matchOrder}</span>
          <span className="text-nb-muted font-normal">•</span>
          <span className="text-nb-muted font-bold">
            {match.matchOrder % 2 !== 0 ? 'To: Next (Home)' : 'To: Next (Away)'}
          </span>
        </div>
        {statusLabel()}
      </div>

      {/* Competitors List */}
      <CompRow name={homeName} score={match.homeScore} isWinner={!!homeWinner} slotNum={1} />
      <CompRow name={awayName} score={match.awayScore} isWinner={!!awayWinner} slotNum={2} />

      {/* Action Area */}
      <div className="p-2 bg-nb-bg border-t-2 border-black">
        {isAdmin ? (
          <button
            disabled={isPending}
            onClick={() => onSelectMatch(match)}
            className={`w-full py-1.5 text-[11px] font-mono font-black uppercase border-2 border-black flex items-center justify-center gap-1.5 transition-all shadow-brutal-sm ${
              isPending
                ? 'bg-nb-card text-nb-muted cursor-not-allowed shadow-none'
                : isCompleted
                ? 'bg-nb-cardAlt hover:bg-nb-yellow hover:text-black text-nb-ink'
                : 'neo-btn text-[11px] py-1 shadow-brutal-sm'
            }`}
          >
            <Swords className="w-3.5 h-3.5" />
            <span>{isCompleted ? 'Edit / Perbarui Skor' : 'Input Skor Match'}</span>
          </button>
        ) : (
          <div className="w-full py-1 text-[10px] font-mono font-bold uppercase text-nb-muted text-center flex items-center justify-center gap-1">
            <Eye className="w-3.5 h-3.5 text-nb-yellow" />
            <span>Mode Lihat Saja</span>
          </div>
        )}
      </div>
    </div>
  );
};
