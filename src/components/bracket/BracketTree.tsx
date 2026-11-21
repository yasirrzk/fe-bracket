import React, { useMemo } from 'react';
import { Match, Tournament } from '../../types/tournament';
import { MatchCard } from './MatchCard';

interface BracketTreeProps {
  tournament: Tournament;
  onSelectMatch: (match: Match) => void;
}

export const BracketTree: React.FC<BracketTreeProps> = ({ tournament, onSelectMatch }) => {
  const matches = useMemo(() => tournament.matches || [], [tournament.matches]);

  const roundsData = useMemo(() => {
    const map: { [round: number]: Match[] } = {};
    matches.forEach((m) => {
      if (!map[m.round]) map[m.round] = [];
      map[m.round].push(m);
    });
    Object.keys(map).forEach((r) => map[Number(r)].sort((a, b) => a.matchOrder - b.matchOrder));
    return map;
  }, [matches]);

  const roundNumbers = useMemo(() => Object.keys(roundsData).map(Number).sort((a, b) => a - b), [roundsData]);
  const totalRounds = roundNumbers.length;

  const getRoundLabel = (round: number, total: number) => {
    if (round === total) return 'GRAND FINAL';
    if (round === total - 1) return 'SEMIFINAL';
    if (round === total - 2) return 'QUARTERFINAL';
    return `ROUND ${round}`;
  };

  const champion = useMemo(() => {
    if (totalRounds === 0) return null;
    const finalMatch = roundsData[totalRounds]?.[0];
    if (finalMatch?.status === 'COMPLETED' && finalMatch.winnerId) {
      return finalMatch.winnerId === finalMatch.homeCompetitorId
        ? finalMatch.homeCompetitor
        : finalMatch.awayCompetitor;
    }
    return null;
  }, [roundsData, totalRounds]);

  if (matches.length === 0) {
    return (
      <div className="bg-white border-[1.5px] border-zinc-400 p-12 text-center max-w-xl mx-auto font-mono">
        <h3 className="font-bold uppercase text-sm sm:text-base text-zinc-950">Bracket Belum Dibuat</h3>
        <p className="text-xs sm:text-sm text-zinc-500 font-sans mt-2 max-w-md mx-auto">
          Turnamen ini belum memiliki bagan pertandingan. Admin perlu mendaftarkan peserta dan menekan tombol "Generate Bracket".
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Champion Podium Banner */}
      {champion && (
        <div className="bg-zinc-950 text-white border-2 border-zinc-900 p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-emerald-400 block mb-1">
              JUARA TURNAMEN // CHAMPION
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {champion.user?.username || champion.userId || 'Undefeated Champion'}
            </h2>
            <p className="text-xs text-zinc-400 font-mono mt-1">
              Memenangkan babak Grand Final dengan catatan tak terkalahkan.
            </p>
          </div>
          <div className="border border-zinc-700 bg-zinc-900 px-3.5 py-2 font-mono text-center shrink-0">
            <div className="text-[10px] text-zinc-400 uppercase font-semibold">STATUS HASIL</div>
            <div className="text-xs font-bold text-emerald-400 uppercase">TROPHY CLAIMED</div>
          </div>
        </div>
      )}

      {/* Horizontal Scrollable Bracket Canvas */}
      <div className="overflow-x-auto pb-8 pt-2">
        <div className="inline-flex gap-12 sm:gap-16 min-w-full px-2 items-stretch">
          {roundNumbers.map((round) => {
            const isFinal = round === totalRounds;
            const roundMatches = roundsData[round] || [];

            // Group matches into pairs (Top & Bottom feeders to next match)
            const matchPairs: (Match | null)[][] = [];
            for (let i = 0; i < roundMatches.length; i += 2) {
              matchPairs.push([roundMatches[i], roundMatches[i + 1] || null]);
            }

            return (
              <div key={round} className="flex flex-col min-w-[270px]">
                {/* Round Header */}
                <div className="mb-6 flex items-center justify-between bg-white px-3.5 py-2 border-[1.5px] border-zinc-400 font-mono">
                  <span className="font-bold text-xs uppercase text-zinc-950">
                    {getRoundLabel(round, totalRounds)}
                  </span>
                  <span className="text-[10px] font-semibold text-zinc-600 bg-zinc-100 border border-zinc-300 px-2 py-0.5 tabular-nums">
                    {roundMatches.length} Match{roundMatches.length > 1 ? 'es' : ''}
                  </span>
                </div>

                {/* Match Cards Stack with dynamic tree connector */}
                <div className="flex-1 flex flex-col justify-around gap-8">
                  {matchPairs.map((pair, pIdx) => {
                    const matchTop = pair[0];
                    const matchBottom = pair[1];

                    return (
                      <div key={pIdx} className="relative flex flex-col gap-6">
                        {/* Top Match in Pair */}
                        {matchTop && (
                          <div className="relative flex items-center">
                            <MatchCard match={matchTop} onSelectMatch={onSelectMatch} isGrandFinal={isFinal} />
                          </div>
                        )}

                        {/* Bottom Match in Pair */}
                        {matchBottom && (
                          <div className="relative flex items-center">
                            <MatchCard match={matchBottom} onSelectMatch={onSelectMatch} isGrandFinal={isFinal} />
                          </div>
                        )}

                        {/* Bracket Fork Connecting Top & Bottom to Next Round */}
                        {!isFinal && matchBottom && (
                          <div className="hidden sm:block absolute -right-8 sm:-right-12 top-0 bottom-0 w-8 sm:w-12 pointer-events-none">
                            {/* Top arm */}
                            <div className="absolute top-[25%] left-0 w-1/2 h-[1.5px] bg-zinc-400" />
                            {/* Bottom arm */}
                            <div className="absolute top-[75%] left-0 w-1/2 h-[1.5px] bg-zinc-400" />
                            {/* Vertical spine connecting top and bottom */}
                            <div className="absolute top-[25%] bottom-[25%] left-1/2 w-[1.5px] bg-zinc-400" />
                            {/* Stem to next match */}
                            <div className="absolute top-1/2 left-1/2 right-0 h-[1.5px] bg-zinc-400" />
                          </div>
                        )}

                        {/* Single match in pair (BYE or single match) connecting straight */}
                        {!isFinal && !matchBottom && matchTop && (
                          <div className="hidden sm:block absolute -right-8 sm:-right-12 top-1/2 -translate-y-1/2 w-8 sm:w-12 pointer-events-none">
                            <div className="w-full h-[1.5px] bg-zinc-400" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
