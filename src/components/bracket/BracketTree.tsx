import React, { useMemo } from 'react';
import { Match, Tournament } from '../../types/tournament';
import { MatchCard } from './MatchCard';
import { Trophy, Crown } from 'lucide-react';

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
      <div className="bg-nb-card text-nb-ink border-3 border-black shadow-brutal p-12 text-center max-w-xl mx-auto">
        <Trophy className="w-12 h-12 mx-auto mb-3 text-nb-yellow" />
        <h3 className="font-mono font-black uppercase text-lg text-nb-ink">Bracket Belum Dibuat</h3>
        <p className="text-xs text-nb-muted font-sans font-medium mt-2 max-w-md mx-auto">
          Turnamen ini belum memiliki bagan pertandingan. Admin perlu mendaftarkan peserta dan menekan tombol "Generate Bracket".
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Champion Podium Banner */}
      {champion && (
        <div className="bg-nb-yellow text-black border-3 border-black shadow-brutal-lg p-6 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-black text-nb-yellow border-3 border-black shadow-brutal-sm flex items-center justify-center">
              <Crown className="w-8 h-8" />
            </div>
            <div>
              <span className="font-mono text-xs font-black uppercase tracking-wider block bg-black text-[#FAF6ED] px-2 py-0.5 w-fit mb-1">
                TOURNAMENT CHAMPION
              </span>
              <h2 className="text-2xl sm:text-3xl font-black uppercase font-mono tracking-tight">
                {champion.user?.username || champion.userId || 'Undefeated Champion'}
              </h2>
            </div>
          </div>
          <div className="bg-black text-[#FAF6ED] border-2 border-black p-3 font-mono text-center shadow-brutal-sm">
            <div className="text-[10px] text-nb-muted uppercase font-bold">STATUS HASIL</div>
            <div className="text-xs font-black text-nb-yellow">TROPHY CLAIMED ★★★</div>
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
                <div className="mb-6 pb-2.5 border-b-3 border-black flex items-center justify-between bg-nb-card px-3.5 py-2 border-3 shadow-brutal-sm">
                  <span className="font-mono font-black text-xs uppercase text-nb-ink">
                    {getRoundLabel(round, totalRounds)}
                  </span>
                  <span className="font-mono text-[10px] font-black text-black bg-nb-yellow px-2 py-0.5 border border-black">
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
                            <div className="absolute top-[25%] left-0 w-1/2 h-[3px] bg-black" />
                            {/* Bottom arm */}
                            <div className="absolute top-[75%] left-0 w-1/2 h-[3px] bg-black" />
                            {/* Vertical spine connecting top and bottom */}
                            <div className="absolute top-[25%] bottom-[25%] left-1/2 w-[3px] bg-black" />
                            {/* Stem to next match */}
                            <div className="absolute top-1/2 left-1/2 right-0 h-[3px] bg-black" />
                          </div>
                        )}

                        {/* Single match in pair (BYE or single match) connecting straight */}
                        {!isFinal && !matchBottom && matchTop && (
                          <div className="hidden sm:block absolute -right-8 sm:-right-12 top-1/2 -translate-y-1/2 w-8 sm:w-12 pointer-events-none">
                            <div className="w-full h-[3px] bg-black" />
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
