import React from 'react';
import { Match } from '../../types/tournament';
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
        return <span className="px-1.5 py-0.2 bg-zinc-950 text-white text-[9px] font-mono font-bold uppercase">SELESAI</span>;
      case 'READY':
        return <span className="px-1.5 py-0.2 bg-emerald-50 text-emerald-700 border border-emerald-300 text-[9px] font-mono font-bold uppercase">SIAP</span>;
      case 'IN_PROGRESS':
        return <span className="px-1.5 py-0.2 bg-rose-600 text-white text-[9px] font-mono font-bold uppercase">LIVE</span>;
      default:
        return (
          <span className="px-1.5 py-0.2 bg-zinc-100 text-zinc-400 border border-zinc-200 text-[9px] font-mono font-medium uppercase">
            MENUNGGU
          </span>
        );
    }
  };

  const CompRow = ({
    name,
    score,
    isWinner,
    isLoser,
    slotNum,
  }: {
    name: string;
    score: number | null | undefined;
    isWinner: boolean;
    isLoser: boolean;
    slotNum: number;
  }) => (
    <div
      className={`flex items-center justify-between px-3 py-2 transition-colors ${
        isWinner
          ? 'bg-zinc-100 font-bold text-zinc-950 border-l-[3px] border-l-emerald-600'
          : isLoser
          ? 'bg-white text-zinc-400 border-l-[3px] border-l-transparent'
          : 'bg-white text-zinc-900 border-l-[3px] border-l-transparent'
      }`}
    >
      <div className="flex items-center gap-2 truncate pr-2">
        <span className="text-[10px] font-mono font-semibold text-zinc-400 tabular-nums">
          #{slotNum}
        </span>
        <span className={`text-xs sm:text-sm font-sans truncate ${isWinner ? 'font-bold text-zinc-950' : isLoser ? 'font-normal text-zinc-400' : 'font-semibold text-zinc-900'}`}>
          {name}
        </span>
      </div>
      <span
        className={`font-mono font-bold text-xs sm:text-sm px-2 py-0.5 border tabular-nums min-w-[28px] text-center ${
          isWinner
            ? 'bg-zinc-950 text-white border-zinc-950'
            : score !== null && score !== undefined
            ? 'bg-zinc-100 text-zinc-900 border-zinc-300'
            : 'text-zinc-400 bg-zinc-50 border-zinc-200'
        }`}
      >
        {score ?? '-'}
      </span>
    </div>
  );

  return (
    <div
      className={`w-64 bg-white border-[1.5px] border-zinc-400 divide-y divide-zinc-300 font-sans transition-colors ${
        isGrandFinal ? 'ring-2 ring-zinc-950' : ''
      } ${isPending ? 'opacity-60' : 'hover:border-zinc-700'}`}
    >
      {/* Match Header Bar */}
      <div className="px-3 py-1.5 flex items-center justify-between bg-zinc-50 font-mono text-[10px] font-semibold text-zinc-600">
        <div className="flex items-center gap-1.5">
          <span>MATCH {match.matchOrder}</span>
          <span className="text-zinc-300">·</span>
          <span className="text-zinc-400 font-medium">
            {match.matchOrder % 2 !== 0 ? 'To Home' : 'To Away'}
          </span>
        </div>
        {statusLabel()}
      </div>

      {/* Competitors List */}
      <CompRow
        name={homeName}
        score={match.homeScore}
        isWinner={!!homeWinner}
        isLoser={isCompleted && !homeWinner}
        slotNum={1}
      />
      <CompRow
        name={awayName}
        score={match.awayScore}
        isWinner={!!awayWinner}
        isLoser={isCompleted && !awayWinner}
        slotNum={2}
      />

      {/* Action Area */}
      <div className="p-2 bg-zinc-50 border-t border-zinc-300">
        {isAdmin ? (
          <button
            type="button"
            disabled={isPending}
            onClick={() => onSelectMatch(match)}
            className={`w-full py-1.5 text-xs font-mono font-semibold uppercase tracking-wider transition-colors ${
              isPending
                ? 'bg-zinc-100 text-zinc-400 border border-zinc-200 cursor-not-allowed'
                : 'bg-zinc-950 text-white hover:bg-zinc-800 border border-zinc-950'
            }`}
          >
            {isCompleted ? 'Edit Skor' : 'Input Skor'}
          </button>
        ) : (
          <div className="w-full py-1 text-[10px] font-mono text-zinc-400 text-center uppercase">
            Mode Lihat Saja
          </div>
        )}
      </div>
    </div>
  );
};
