import React from 'react';
import { Tournament } from '../../types/tournament';
import { ArrowRight } from 'lucide-react';

interface TournamentCardProps {
  tournament: Tournament;
  onSelect: (id: string) => void;
}

export const TournamentCard: React.FC<TournamentCardProps> = ({ tournament, onSelect }) => {
  const getStatusBadge = (status: Tournament['status']) => {
    switch (status) {
      case 'IN_PROGRESS':
        return (
          <span className="px-1.5 py-0.2 bg-zinc-950 text-white font-mono text-[10px] font-bold uppercase">
            BERLANGSUNG
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="px-1.5 py-0.2 bg-zinc-100 text-zinc-600 border border-zinc-300 font-mono text-[10px] font-semibold uppercase">
            SELESAI
          </span>
        );
      case 'REGISTRATION_OPEN':
        return (
          <span className="px-1.5 py-0.2 bg-emerald-50 text-emerald-700 border border-emerald-300 font-mono text-[10px] font-bold uppercase">
            REGISTRASI BUKA
          </span>
        );
      case 'REGISTRATION_CLOSED':
        return (
          <span className="px-1.5 py-0.2 bg-zinc-100 text-zinc-600 border border-zinc-200 font-mono text-[10px] uppercase">
            DITUTUP
          </span>
        );
      default:
        return (
          <span className="px-1.5 py-0.2 bg-zinc-100 text-zinc-600 font-mono text-[10px] uppercase">
            {status}
          </span>
        );
    }
  };

  const participantCount = tournament.participantsCount ?? tournament.participants?.length ?? 0;
  const matchCount = tournament.matchesCount ?? tournament.matches?.length ?? 0;
  const pct = Math.min(100, Math.round((participantCount / tournament.maxParticipants) * 100));

  return (
    <div
      onClick={() => onSelect(tournament.id)}
      className="bg-white border-[1.5px] border-zinc-400 p-5 hover:border-zinc-700 transition-colors cursor-pointer flex flex-col justify-between group font-sans"
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          {getStatusBadge(tournament.status)}
          <span className="font-mono text-[10px] text-zinc-400 uppercase">
            {tournament.createdAt ? new Date(tournament.createdAt).toLocaleDateString() : 'N/A'}
          </span>
        </div>

        <h3 className="text-base sm:text-lg font-bold text-zinc-950 tracking-tight group-hover:text-zinc-700 transition-colors">
          {tournament.title}
        </h3>
        <p className="text-xs sm:text-sm text-zinc-500 font-normal mt-1 line-clamp-2 leading-relaxed">
          {tournament.description || 'Turnamen sistem gugur resmi engine. Kompetisi eliminasi langsung.'}
        </p>
      </div>

      <div>
        {/* Progress Bar */}
        <div className="mt-4 p-3 bg-zinc-50 border border-zinc-300">
          <div className="flex justify-between text-xs font-mono mb-1.5">
            <span className="text-zinc-600 font-medium">Kuota Peserta</span>
            <span className="font-bold text-zinc-950 tabular-nums">
              {participantCount} / {tournament.maxParticipants} ({pct}%)
            </span>
          </div>
          <div className="w-full h-2 bg-zinc-200 overflow-hidden">
            <div className="bg-zinc-950 h-full transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-zinc-200 mt-4 flex items-center justify-between font-mono text-xs">
          <span className="text-zinc-500 tabular-nums">
            <strong className="text-zinc-950 font-bold">{matchCount}</strong> Laga
          </span>
          <span className="inline-flex items-center gap-1 font-semibold text-zinc-950 group-hover:underline">
            <span>Buka Bracket</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[1.75]" />
          </span>
        </div>
      </div>
    </div>
  );
};
