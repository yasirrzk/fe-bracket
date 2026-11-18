import React, { useState, useMemo } from 'react';
import { League, LeagueMatch } from '../../types/league';
import { Swords, Calendar, Lock, CheckCircle2, Eye } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface LeagueFixturesProps {
  league: League;
  onSelectMatch: (match: LeagueMatch) => void;
}

export const LeagueFixtures: React.FC<LeagueFixturesProps> = ({ league, onSelectMatch }) => {
  const { isAdmin } = useAuth();
  const matches = useMemo(() => league.matches || [], [league.matches]);

  // Group matches by matchday
  const matchdays = useMemo(() => {
    const map: { [day: number]: LeagueMatch[] } = {};
    matches.forEach((m) => {
      if (!map[m.matchday]) map[m.matchday] = [];
      map[m.matchday].push(m);
    });
    return map;
  }, [matches]);

  const daysList = useMemo(
    () => Object.keys(matchdays).map(Number).sort((a, b) => a - b),
    [matchdays]
  );

  const [selectedDay, setSelectedDay] = useState<number>(() => {
    // Default to the first matchday that still has non-completed matches, or the last one
    const activeDay = daysList.find((d) => matchdays[d]?.some((m) => m.status !== 'COMPLETED'));
    return activeDay || daysList[0] || 1;
  });

  if (matches.length === 0) {
    return (
      <div className="bg-nb-card text-nb-ink border-3 border-black shadow-brutal p-12 text-center max-w-xl mx-auto font-sans">
        <Calendar className="w-12 h-12 mx-auto mb-3 text-nb-yellow" />
        <h3 className="font-mono font-black uppercase text-lg text-nb-ink">Jadwal Belum Digenerate</h3>
        <p className="text-xs text-nb-muted font-sans font-medium mt-2 max-w-md mx-auto">
          Liga ini belum memiliki jadwal pertandingan pekan. Admin perlu men-generate jadwal round-robin untuk memulai pertandingan.
        </p>
      </div>
    );
  }

  const currentMatches = matchdays[selectedDay] || [];

  const getStatusBadge = (status: LeagueMatch['status']) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="px-2 py-0.5 bg-black text-[#FAF6ED] text-[10px] font-mono font-black uppercase flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-nb-yellow" /> SELESAI
          </span>
        );
      case 'READY':
        return (
          <span className="px-2 py-0.5 bg-nb-yellow text-black text-[10px] font-mono font-black uppercase border border-black shadow-brutal-sm">
            SIAP TANDING
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 bg-nb-cardAlt text-nb-muted text-[10px] font-mono font-bold uppercase flex items-center gap-1">
            <Lock className="w-3 h-3" /> MENUNGGU
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Matchday Selector Buttons */}
      <div className="bg-nb-card border-3 border-black shadow-brutal p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <span className="font-mono text-xs font-black uppercase tracking-wider text-nb-muted flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-nb-yellow" /> Pilih Pekan Pertandingan (Matchday):
          </span>
          <span className="font-mono text-xs font-bold text-nb-ink bg-nb-cardAlt px-2.5 py-1 border-2 border-black">
            Total {daysList.length} Pekan ({matches.length} Pertandingan)
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {daysList.map((day) => {
            const isCompleted = matchdays[day]?.every((m) => m.status === 'COMPLETED');
            const isSelected = selectedDay === day;

            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-4 py-2 border-3 border-black font-mono text-xs font-black uppercase transition-all ${
                  isSelected
                    ? 'bg-nb-yellow text-black shadow-brutal translate-x-[-1px] translate-y-[-1px]'
                    : 'bg-nb-cardAlt text-nb-ink shadow-brutal-sm hover:bg-nb-cardHover'
                }`}
              >
                <span>Pekan {day}</span>
                {isCompleted && <span className="ml-1.5 text-nb-green">✓</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Matches Grid for the Selected Matchday */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {currentMatches.map((match, idx) => {
          const isCompleted = match.status === 'COMPLETED';
          const homeWins = isCompleted && (match.homeScore ?? 0) > (match.awayScore ?? 0);
          const awayWins = isCompleted && (match.awayScore ?? 0) > (match.homeScore ?? 0);
          const isDraw = isCompleted && match.homeScore === match.awayScore;

          return (
            <div
              key={match.id}
              className="bg-nb-card border-3 border-black shadow-brutal flex flex-col justify-between hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-brutal-lg transition-all"
            >
              {/* Card Top Strip */}
              <div className="p-3 border-b-3 border-black bg-nb-cardAlt flex items-center justify-between font-mono text-xs font-bold">
                <span className="text-nb-muted">
                  Match #{idx + 1} • Pekan {match.matchday}
                </span>
                {getStatusBadge(match.status)}
              </div>

              {/* Match Teams & Scores */}
              <div className="p-4 space-y-3 font-mono">
                {/* Home Team Row */}
                <div
                  className={`flex items-center justify-between p-2.5 border-2 border-black transition-colors ${
                    homeWins
                      ? 'bg-nb-yellow text-black font-black shadow-brutal-sm'
                      : isDraw
                      ? 'bg-nb-cardAlt/80 text-nb-ink font-bold'
                      : 'bg-nb-card text-nb-ink'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate pr-2">
                    <span className="w-6 h-6 bg-black text-[#FAF6ED] text-[10px] font-black border border-black flex items-center justify-center flex-shrink-0">
                      {match.homeTeam?.tag || 'HOM'}
                    </span>
                    <span className="text-xs truncate font-bold">{match.homeTeam?.name}</span>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 border border-black text-sm font-black min-w-[32px] text-center ${
                      homeWins ? 'bg-black text-nb-yellow' : 'bg-nb-bg text-nb-ink'
                    }`}
                  >
                    {match.homeScore ?? '-'}
                  </span>
                </div>

                {/* Away Team Row */}
                <div
                  className={`flex items-center justify-between p-2.5 border-2 border-black transition-colors ${
                    awayWins
                      ? 'bg-nb-yellow text-black font-black shadow-brutal-sm'
                      : isDraw
                      ? 'bg-nb-cardAlt/80 text-nb-ink font-bold'
                      : 'bg-nb-card text-nb-ink'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate pr-2">
                    <span className="w-6 h-6 bg-black text-[#FAF6ED] text-[10px] font-black border border-black flex items-center justify-center flex-shrink-0">
                      {match.awayTeam?.tag || 'AWY'}
                    </span>
                    <span className="text-xs truncate font-bold">{match.awayTeam?.name}</span>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 border border-black text-sm font-black min-w-[32px] text-center ${
                      awayWins ? 'bg-black text-nb-yellow' : 'bg-nb-bg text-nb-ink'
                    }`}
                  >
                    {match.awayScore ?? '-'}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <div className="p-3 border-t-2 border-black bg-nb-bg">
                {isAdmin ? (
                  <button
                    onClick={() => onSelectMatch(match)}
                    className={`w-full py-2 font-mono text-xs font-black uppercase border-2 border-black flex items-center justify-center gap-1.5 shadow-brutal-sm transition-all ${
                      isCompleted
                        ? 'bg-nb-cardAlt hover:bg-nb-yellow hover:text-black text-nb-ink'
                        : 'neo-btn py-1.5'
                    }`}
                  >
                    <Swords className="w-3.5 h-3.5" />
                    <span>{isCompleted ? 'Perbarui Skor' : 'Input Skor Match'}</span>
                  </button>
                ) : (
                  <div className="w-full py-1.5 font-mono text-[11px] font-bold text-nb-muted text-center flex items-center justify-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-nb-yellow" />
                    <span>Mode Lihat Saja</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
