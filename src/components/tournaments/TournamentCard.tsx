import React from 'react';
import { Tournament } from '../../types/tournament';
import { Users, Swords, ArrowRight, Calendar } from 'lucide-react';

interface TournamentCardProps {
  tournament: Tournament;
  onSelect: (id: string) => void;
}

export const TournamentCard: React.FC<TournamentCardProps> = ({ tournament, onSelect }) => {
  const getStatusBadge = (status: Tournament['status']) => {
    const base = 'px-2.5 py-1 text-[11px] font-mono font-black uppercase border-2 border-black shadow-brutal-sm';
    switch (status) {
      case 'IN_PROGRESS':
        return <span className={`${base} bg-nb-yellow text-black`}>● BERLANGSUNG</span>;
      case 'COMPLETED':
        return <span className={`${base} bg-black text-[#FAF6ED]`}>★ SELESAI</span>;
      case 'REGISTRATION_OPEN':
        return <span className={`${base} bg-nb-green text-black`}>PENDAFTARAN BUKA</span>;
      case 'REGISTRATION_CLOSED':
        return <span className={`${base} bg-nb-cardAlt text-nb-ink`}>DITUTUP</span>;
      default:
        return <span className={`${base} bg-nb-card text-nb-ink`}>{status}</span>;
    }
  };

  const participantCount = tournament.participantsCount ?? tournament.participants?.length ?? 0;
  const matchCount = tournament.matchesCount ?? tournament.matches?.length ?? 0;
  const pct = Math.min(100, Math.round((participantCount / tournament.maxParticipants) * 100));

  return (
    <div
      onClick={() => onSelect(tournament.id)}
      className="group bg-nb-card text-nb-ink border-3 border-black shadow-brutal cursor-pointer flex flex-col justify-between hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-brutal-lg transition-all duration-150"
    >
      <div className="p-5">
        <div className="flex items-center justify-between gap-2 mb-4">
          {getStatusBadge(tournament.status)}
          <span className="font-mono text-xs font-bold text-nb-muted flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {tournament.createdAt ? new Date(tournament.createdAt).toLocaleDateString() : 'N/A'}
          </span>
        </div>

        <h3 className="font-sans font-black text-lg uppercase tracking-tight leading-snug group-hover:text-nb-yellow transition-colors text-nb-ink">
          {tournament.title}
        </h3>
        <p className="text-xs text-nb-muted font-sans font-medium mt-2 line-clamp-2 leading-relaxed">
          {tournament.description || 'Turnamen sistem gugur resmi engine. Kompetisi eliminasi langsung.'}
        </p>
      </div>

      <div className="p-5 pt-0">
        {/* Progress Bar */}
        <div className="mb-4 bg-nb-cardAlt p-3 border-2 border-black">
          <div className="flex justify-between text-xs font-mono font-black mb-1.5">
            <span className="flex items-center gap-1.5 text-nb-ink">
              <Users className="w-3.5 h-3.5 text-nb-yellow" /> Kuota Peserta
            </span>
            <span className="bg-nb-card px-1.5 py-0.5 border border-black text-nb-ink">
              {participantCount} / {tournament.maxParticipants} ({pct}%)
            </span>
          </div>
          <div className="w-full h-3 bg-nb-bg border-2 border-black overflow-hidden">
            <div className="bg-nb-yellow h-full border-r-2 border-black transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t-3 border-black flex items-center justify-between font-mono text-xs font-bold">
          <span className="flex items-center gap-1.5 text-nb-ink font-extrabold">
            <Swords className="w-4 h-4 text-nb-red" /> {matchCount} Match
          </span>
          <span className="flex items-center gap-1.5 text-nb-yellow font-black uppercase group-hover:translate-x-1 transition-transform">
            <span>Buka Bracket</span>
            <ArrowRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </div>
  );
};
