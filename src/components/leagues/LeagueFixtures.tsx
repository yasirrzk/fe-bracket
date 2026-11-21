import React, { useState, useMemo } from 'react';
import { League, LeagueMatch } from '../../types/league';
import { useAuth } from '../../context/AuthContext';

interface LeagueFixturesProps {
  league: League;
  onSelectMatch: (match: LeagueMatch) => void;
}

export const LeagueFixtures: React.FC<LeagueFixturesProps> = ({ league, onSelectMatch }) => {
  const { isAdmin } = useAuth();
  const matches = useMemo(() => league.matches || [], [league.matches]);

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
    const activeDay = daysList.find((d) => matchdays[d]?.some((m) => m.status !== 'COMPLETED'));
    return activeDay || daysList[0] || 1;
  });

  if (matches.length === 0) {
    return (
      <div className="bg-white border-[1.5px] border-zinc-400 p-10 text-center font-mono">
        <div className="font-bold uppercase text-xs sm:text-sm text-zinc-950">Jadwal Belum Digenerate</div>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1 font-sans">
          Liga ini belum memiliki jadwal pertandingan pekan. Admin perlu men-generate jadwal round-robin.
        </p>
      </div>
    );
  }

  const currentMatches = matchdays[selectedDay] || [];

  return (
    <div className="space-y-4 font-sans">
      {/* Matchday Selector Ribbon (Swiss Grid Standard) */}
      <div className="bg-white border-[1.5px] border-zinc-400 p-3">
        <div className="flex items-center justify-between gap-2 mb-2 font-mono text-xs">
          <span className="font-semibold uppercase tracking-wider text-zinc-500 text-xs">
            Pilih Pekan (Matchday):
          </span>
          <span className="text-xs text-zinc-400 tabular-nums">
            Total {daysList.length} Pekan ({matches.length} Laga)
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {daysList.map((day) => {
            const isCompleted = matchdays[day]?.every((m) => m.status === 'COMPLETED');
            const isSelected = selectedDay === day;

            return (
              <button
                type="button"
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-3 py-1.5 font-mono text-xs whitespace-nowrap transition-colors border ${
                  isSelected
                    ? 'bg-zinc-950 text-white border-zinc-950 font-bold'
                    : 'bg-white text-zinc-600 border-zinc-300 hover:bg-zinc-50'
                }`}
              >
                <span>Pekan {day}</span>
                {isCompleted && <span className="ml-1.5 text-emerald-500 font-bold">✓</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Hairline Scoreboard Group (DESIGN.md Section 5B) */}
      <div className="bg-white border-[1.5px] border-zinc-400 divide-y divide-zinc-300">
        <div className="px-5 py-2.5 bg-zinc-50 flex items-center justify-between font-mono text-xs text-zinc-500 font-semibold uppercase">
          <span>Pekan {selectedDay}</span>
          <span>{currentMatches.length} Pertandingan</span>
        </div>

        {currentMatches.map((match) => {
          const isCompleted = match.status === 'COMPLETED';
          const homeWins = isCompleted && (match.homeScore ?? 0) > (match.awayScore ?? 0);
          const awayWins = isCompleted && (match.awayScore ?? 0) > (match.homeScore ?? 0);

          return (
            <div
              key={match.id}
              onClick={() => {
                if (isAdmin) onSelectMatch(match);
              }}
              className={`grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-5 px-4 sm:px-5 py-4 transition-colors ${
                isAdmin ? 'hover:bg-zinc-50 cursor-pointer group' : ''
              }`}
            >
              {/* Home Team (Right Aligned) */}
              <div className="flex items-center justify-end gap-3 truncate">
                <span
                  className={`text-sm sm:text-base truncate font-sans text-right ${
                    homeWins
                      ? 'font-bold text-zinc-950'
                      : awayWins
                      ? 'font-normal text-zinc-400'
                      : 'font-semibold text-zinc-950'
                  }`}
                >
                  {match.homeTeam?.name}
                </span>
                {match.homeTeam?.logoUrl ? (
                  <img
                    src={match.homeTeam.logoUrl}
                    alt=""
                    className="w-8 h-8 object-cover border border-zinc-300 bg-white shrink-0"
                  />
                ) : (
                  <span className="w-8 h-8 bg-zinc-100 text-zinc-700 text-xs font-mono font-bold border border-zinc-300 flex items-center justify-center shrink-0">
                    {match.homeTeam?.tag || 'H'}
                  </span>
                )}
              </div>

              {/* Center Scorebox & Status Tag */}
              <div className="flex flex-col items-center justify-center shrink-0 min-w-[80px]">
                {isCompleted ? (
                  <>
                    <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest mb-0.5">
                      FT
                    </span>
                    <div className="font-mono font-bold text-sm sm:text-base tabular-nums bg-zinc-100 border border-zinc-300 px-3 py-1 text-zinc-950">
                      {match.homeScore} : {match.awayScore}
                    </div>
                  </>
                ) : match.status === 'READY' ? (
                  <>
                    <span className="text-[10px] font-mono font-semibold text-emerald-600 uppercase tracking-widest mb-0.5">
                      SIAP
                    </span>
                    <div className="font-mono text-xs sm:text-sm bg-zinc-100 border border-zinc-300 px-3 py-1 text-zinc-600 font-semibold">
                      VS
                    </div>
                  </>
                ) : (
                  <>
                    <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-0.5">
                      JADWAL
                    </span>
                    <div className="font-mono text-xs sm:text-sm bg-zinc-50 border border-zinc-300 px-3 py-1 text-zinc-400">
                      - : -
                    </div>
                  </>
                )}

                {isAdmin && (
                  <span className="text-[10px] font-mono text-zinc-400 group-hover:text-zinc-950 mt-1 uppercase transition-colors">
                    {isCompleted ? 'Edit' : 'Input'}
                  </span>
                )}
              </div>

              {/* Away Team (Left Aligned) */}
              <div className="flex items-center justify-start gap-3 truncate">
                {match.awayTeam?.logoUrl ? (
                  <img
                    src={match.awayTeam.logoUrl}
                    alt=""
                    className="w-8 h-8 object-cover border border-zinc-300 bg-white shrink-0"
                  />
                ) : (
                  <span className="w-8 h-8 bg-zinc-100 text-zinc-700 text-xs font-mono font-bold border border-zinc-300 flex items-center justify-center shrink-0">
                    {match.awayTeam?.tag || 'A'}
                  </span>
                )}
                <span
                  className={`text-sm sm:text-base truncate font-sans text-left ${
                    awayWins
                      ? 'font-bold text-zinc-950'
                      : homeWins
                      ? 'font-normal text-zinc-400'
                      : 'font-semibold text-zinc-950'
                  }`}
                >
                  {match.awayTeam?.name}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
