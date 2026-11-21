import React from 'react';
import { League } from '../../types/league';
import { calculateStandings } from '../../services/leagueService';

interface LeagueStandingsTableProps {
  league: League;
}

export const LeagueStandingsTable: React.FC<LeagueStandingsTableProps> = ({ league }) => {
  const standings = calculateStandings(league);

  const getFormBadge = (result: 'W' | 'D' | 'L', idx: number) => {
    switch (result) {
      case 'W':
        return (
          <span
            key={idx}
            className="w-5 h-5 bg-emerald-600 text-white font-mono font-bold text-[10px] flex items-center justify-center rounded-none"
            title="Menang (Win)"
          >
            W
          </span>
        );
      case 'D':
        return (
          <span
            key={idx}
            className="w-5 h-5 bg-zinc-400 text-white font-mono font-bold text-[10px] flex items-center justify-center rounded-none"
            title="Seri (Draw)"
          >
            D
          </span>
        );
      case 'L':
        return (
          <span
            key={idx}
            className="w-5 h-5 bg-rose-600 text-white font-mono font-bold text-[10px] flex items-center justify-center rounded-none"
            title="Kalah (Loss)"
          >
            L
          </span>
        );
    }
  };

  if (standings.length === 0) {
    return (
      <div className="bg-white border-[1.5px] border-zinc-400 p-10 text-center font-mono">
        <div className="font-bold uppercase text-xs sm:text-sm text-zinc-950">Klasemen Belum Tersedia</div>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1 font-sans">
          Daftarkan minimal 2 tim dan buat jadwal pertandingan untuk memulai klasemen kompetisi.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 font-sans">
      {/* Standings Table Card Container (Swiss Grid Spec 5C) */}
      <div className="bg-white border-[1.5px] border-zinc-400 overflow-hidden">
        {/* Table Top Header Bar */}
        <div className="px-5 py-3 border-b border-zinc-300 bg-zinc-50 flex flex-wrap items-center justify-between gap-2 font-mono text-xs sm:text-sm">
          <div className="font-bold uppercase tracking-wider text-zinc-950">
            Tabel Klasemen // {league.title}
          </div>
          <div className="text-xs text-zinc-500 flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-emerald-500 inline-block" /> Zona Juara / Playoff
            </span>
          </div>
        </div>

        {/* Responsive Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="border-b border-zinc-300 bg-zinc-50 text-xs font-mono uppercase text-zinc-500 font-semibold">
                <th className="py-3.5 px-3 sm:px-4 text-center w-12">#</th>
                <th className="py-3.5 px-4 sm:px-5 min-w-[200px] font-sans font-semibold">Tim</th>
                <th className="py-3.5 px-3 text-center tabular-nums" title="Main (Played)">P</th>
                <th className="py-3.5 px-3 text-center hidden sm:table-cell tabular-nums" title="Menang (Won)">W</th>
                <th className="py-3.5 px-3 text-center hidden sm:table-cell tabular-nums" title="Seri (Draw)">D</th>
                <th className="py-3.5 px-3 text-center hidden sm:table-cell tabular-nums" title="Kalah (Lost)">L</th>
                <th className="py-3.5 px-3 text-center hidden md:table-cell tabular-nums" title="Gol Memasukkan : Kemasukan">GF:GA</th>
                <th className="py-3.5 px-3 text-center tabular-nums" title="Selisih Gol (Goal Difference)">GD</th>
                <th className="py-3.5 px-4 text-center bg-zinc-100 font-bold text-zinc-950 tabular-nums">
                  PTS
                </th>
                <th className="py-3.5 px-4 text-center hidden sm:table-cell min-w-[120px]">Form</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-300">
              {standings.map((row) => {
                const isQualifyingZone = row.rank <= 4;

                return (
                  <tr
                    key={row.teamId}
                    className={`transition-colors hover:bg-zinc-50/80 ${
                      isQualifyingZone ? 'border-l-[4px] border-l-emerald-500' : 'border-l-[4px] border-l-transparent'
                    }`}
                  >
                    {/* Position Rank */}
                    <td className="py-4 px-3 sm:px-4 text-center font-bold text-zinc-950 tabular-nums text-sm sm:text-base">
                      {row.rank}
                    </td>

                    {/* Team Info */}
                    <td className="py-4 px-4 sm:px-5">
                      <div className="flex items-center gap-3">
                        {row.logoUrl ? (
                          <img
                            src={row.logoUrl}
                            alt={row.teamName}
                            className="w-8 h-8 object-cover border border-zinc-300 bg-white shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-zinc-100 text-zinc-800 border border-zinc-300 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                            {row.tag || row.teamName.slice(0, 3).toUpperCase()}
                          </div>
                        )}
                        <div className="truncate">
                          <span className="font-sans font-semibold text-sm sm:text-base text-zinc-950 truncate block leading-tight">
                            {row.teamName}
                          </span>
                          {row.tag && (
                            <span className="text-xs text-zinc-400 font-mono leading-none block mt-0.5">
                              [{row.tag}]
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Played */}
                    <td className="py-4 px-3 text-center font-medium text-zinc-700 tabular-nums text-sm sm:text-base">
                      {row.played}
                    </td>

                    {/* Desktop Win / Draw / Loss */}
                    <td className="py-4 px-3 text-center hidden sm:table-cell text-zinc-700 tabular-nums text-sm sm:text-base">
                      {row.won}
                    </td>
                    <td className="py-4 px-3 text-center hidden sm:table-cell text-zinc-500 tabular-nums text-sm sm:text-base">
                      {row.draw}
                    </td>
                    <td className="py-4 px-3 text-center hidden sm:table-cell text-zinc-500 tabular-nums text-sm sm:text-base">
                      {row.lost}
                    </td>

                    {/* GF:GA Desktop */}
                    <td className="py-4 px-3 text-center hidden md:table-cell text-zinc-500 tabular-nums text-xs sm:text-sm">
                      {row.goalsFor}:{row.goalsAgainst}
                    </td>

                    {/* Goal Difference */}
                    <td className={`py-4 px-3 text-center font-bold tabular-nums text-sm sm:text-base ${
                      row.goalDifference > 0 ? 'text-emerald-600' : row.goalDifference < 0 ? 'text-rose-600' : 'text-zinc-500'
                    }`}>
                      {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                    </td>

                    {/* Points (PTS) */}
                    <td className="py-4 px-4 text-center font-bold text-zinc-950 bg-zinc-100/70 tabular-nums text-sm sm:text-base">
                      {row.points}
                    </td>

                    {/* 5 Last Matches Form */}
                    <td className="py-4 px-4 text-center hidden sm:table-cell">
                      <div className="flex items-center justify-center gap-1.5">
                        {row.form.length === 0 ? (
                          <span className="text-zinc-300 text-xs">-</span>
                        ) : (
                          row.form.map((res, fIdx) => getFormBadge(res, fIdx))
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Legend Footer Bar */}
        <div className="px-5 py-2.5 border-t border-zinc-300 bg-zinc-50 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-zinc-500">
          <div>
            Poin: Menang = {league.pointsWin} • Seri = {league.pointsDraw} • Kalah = {league.pointsLoss}
          </div>
          <div>
            Tie-break: Poin ➔ Selisih Gol (GD) ➔ Memasukkan (GF)
          </div>
        </div>
      </div>
    </div>
  );
};
