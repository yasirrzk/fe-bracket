import React from 'react';
import { League } from '../../types/league';
import { calculateStandings } from '../../services/leagueService';
import { Trophy, Crown, TrendingUp, Info } from 'lucide-react';

interface LeagueStandingsTableProps {
  league: League;
}

export const LeagueStandingsTable: React.FC<LeagueStandingsTableProps> = ({ league }) => {
  const standings = calculateStandings(league);

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <span className="w-7 h-7 bg-nb-yellow text-black border-2 border-black font-black flex items-center justify-center text-xs shadow-brutal-sm">
            <Crown className="w-3.5 h-3.5 mr-0.5" /> 1
          </span>
        );
      case 2:
        return (
          <span className="w-7 h-7 bg-nb-cardAlt text-nb-ink border-2 border-black font-black flex items-center justify-center text-xs shadow-brutal-sm">
            2
          </span>
        );
      case 3:
        return (
          <span className="w-7 h-7 bg-nb-cardAlt text-nb-ink border-2 border-black font-black flex items-center justify-center text-xs shadow-brutal-sm">
            3
          </span>
        );
      default:
        return (
          <span className="w-7 h-7 bg-nb-bg text-nb-muted border border-black font-mono font-bold flex items-center justify-center text-xs">
            {rank}
          </span>
        );
    }
  };

  const getFormBadge = (result: 'W' | 'D' | 'L', idx: number) => {
    switch (result) {
      case 'W':
        return (
          <span
            key={idx}
            className="w-5 h-5 bg-nb-green text-black font-mono font-black text-[10px] border border-black flex items-center justify-center shadow-brutal-sm"
            title="Menang (Win)"
          >
            M
          </span>
        );
      case 'D':
        return (
          <span
            key={idx}
            className="w-5 h-5 bg-nb-cardAlt text-nb-ink font-mono font-black text-[10px] border border-black flex items-center justify-center shadow-brutal-sm"
            title="Seri (Draw)"
          >
            S
          </span>
        );
      case 'L':
        return (
          <span
            key={idx}
            className="w-5 h-5 bg-nb-red text-white font-mono font-black text-[10px] border border-black flex items-center justify-center shadow-brutal-sm"
            title="Kalah (Loss)"
          >
            K
          </span>
        );
    }
  };

  if (standings.length === 0) {
    return (
      <div className="bg-nb-card text-nb-ink border-3 border-black shadow-brutal p-12 text-center max-w-xl mx-auto font-sans">
        <Trophy className="w-12 h-12 mx-auto mb-3 text-nb-yellow" />
        <h3 className="font-mono font-black uppercase text-lg text-nb-ink">Klasemen Belum Tersedia</h3>
        <p className="text-xs text-nb-muted font-sans font-medium mt-2 max-w-md mx-auto">
          Belum ada tim yang didaftarkan ke dalam liga ini. Admin perlu menambahkan tim dan men-generate jadwal pekan untuk memulai klasemen.
        </p>
      </div>
    );
  }

  const leader = standings[0];

  return (
    <div className="space-y-6">
      {/* Current Leader Podium Spotlight */}
      {leader && leader.played > 0 && (
        <div className="bg-nb-yellow text-black border-3 border-black shadow-brutal-lg p-5 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-black text-nb-yellow border-3 border-black shadow-brutal-sm flex items-center justify-center flex-shrink-0">
              <Crown className="w-8 h-8" />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-wider block bg-black text-[#FAF6ED] px-2 py-0.5 w-fit mb-1 border border-black">
                PEMIMPIN KLASEMEN SEMENTARA
              </span>
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
                {leader.teamName} {leader.tag && `(${leader.tag})`}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-black text-[#FAF6ED] border-2 border-black p-3 text-center shadow-brutal-sm min-w-[90px]">
              <div className="text-[10px] text-nb-muted uppercase font-bold">TOTAL POIN</div>
              <div className="text-xl font-black text-nb-yellow">{leader.points} PTS</div>
            </div>
            <div className="bg-black text-[#FAF6ED] border-2 border-black p-3 text-center shadow-brutal-sm min-w-[90px]">
              <div className="text-[10px] text-nb-muted uppercase font-bold">REKOR (M-S-K)</div>
              <div className="text-sm font-black text-white">
                {leader.won} - {leader.draw} - {leader.lost}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Standings Table Card */}
      <div className="bg-nb-card border-3 border-black shadow-brutal overflow-hidden">
        {/* Table Header Bar */}
        <div className="p-4 border-b-3 border-black bg-nb-cardAlt flex flex-wrap items-center justify-between gap-2 font-mono">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-nb-yellow" />
            <h3 className="text-sm font-black uppercase text-nb-ink">
              Tabel Klasemen Resmi // {league.title}
            </h3>
          </div>
          <div className="text-xs font-bold text-nb-muted flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 bg-nb-yellow border border-black inline-block" /> Zona Juara (#1)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 bg-nb-green border border-black inline-block" /> Lolos Playoff (Top 4)
            </span>
          </div>
        </div>

        {/* Scrollable Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="border-b-3 border-black bg-nb-bg text-nb-ink uppercase font-black text-[11px]">
                <th className="py-3 px-3 text-center w-14">#</th>
                <th className="py-3 px-4 min-w-[180px]">Tim / Klub</th>
                <th className="py-3 px-3 text-center" title="Main (Played)">P</th>
                <th className="py-3 px-3 text-center" title="Menang (Won)">M</th>
                <th className="py-3 px-3 text-center" title="Seri (Draw)">S</th>
                <th className="py-3 px-3 text-center" title="Kalah (Lost)">K</th>
                <th className="py-3 px-3 text-center hidden md:table-cell" title="Gol/Ronde Memasukkan (Goals For)">GM</th>
                <th className="py-3 px-3 text-center hidden md:table-cell" title="Gol/Ronde Kemasukan (Goals Against)">GK</th>
                <th className="py-3 px-3 text-center" title="Selisih Gol/Ronde (Goal Difference)">+/-</th>
                <th className="py-3 px-4 text-center bg-nb-yellow/15 border-l-2 border-r-2 border-black font-black text-sm">
                  POIN
                </th>
                <th className="py-3 px-4 text-center min-w-[120px]">5 Match Terakhir</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((row, idx) => {
                const isFirst = row.rank === 1;

                return (
                  <tr
                    key={row.teamId}
                    className={`border-b-2 border-black last:border-b-0 transition-colors hover:bg-nb-cardHover ${
                      isFirst ? 'bg-nb-yellow/10 font-bold' : idx % 2 === 0 ? 'bg-nb-card' : 'bg-nb-cardAlt/40'
                    }`}
                  >
                    {/* Rank */}
                    <td className="py-3 px-3 text-center font-black">
                      <div className="flex justify-center">{getRankBadge(row.rank)}</div>
                    </td>

                    {/* Team Info */}
                    <td className="py-3 px-4 font-bold text-nb-ink">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-7 h-7 border-2 border-black font-black flex items-center justify-center text-[11px] shadow-brutal-sm ${
                            isFirst ? 'bg-nb-yellow text-black' : 'bg-nb-cardAlt text-nb-ink'
                          }`}
                        >
                          {row.tag || row.teamName.slice(0, 3).toUpperCase()}
                        </div>
                        <div className="truncate">
                          <span className="text-sm font-black text-nb-ink block leading-tight">
                            {row.teamName}
                          </span>
                          {row.tag && (
                            <span className="text-[10px] text-nb-muted font-mono font-bold block">
                              [{row.tag}]
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Stats */}
                    <td className="py-3 px-3 text-center font-bold">{row.played}</td>
                    <td className="py-3 px-3 text-center text-nb-green font-black">{row.won}</td>
                    <td className="py-3 px-3 text-center text-nb-muted font-bold">{row.draw}</td>
                    <td className="py-3 px-3 text-center text-nb-red font-bold">{row.lost}</td>
                    <td className="py-3 px-3 text-center hidden md:table-cell text-nb-muted">{row.goalsFor}</td>
                    <td className="py-3 px-3 text-center hidden md:table-cell text-nb-muted">{row.goalsAgainst}</td>
                    <td className={`py-3 px-3 text-center font-bold ${
                      row.goalDifference > 0 ? 'text-nb-green' : row.goalDifference < 0 ? 'text-nb-red' : 'text-nb-muted'
                    }`}>
                      {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                    </td>

                    {/* Points Column (Highlighted) */}
                    <td className="py-3 px-4 text-center font-black text-base bg-nb-yellow/20 border-l-2 border-r-2 border-black text-nb-ink">
                      {row.points}
                    </td>

                    {/* Form badges */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {row.form.length === 0 ? (
                          <span className="text-nb-muted text-[10px]">-</span>
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
        <div className="p-3 border-t-3 border-black bg-nb-cardAlt flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-nb-muted font-bold">
          <div className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-nb-yellow" />
            <span>Sistem Poin: Menang = {league.pointsWin} Poin • Seri = {league.pointsDraw} Poin • Kalah = {league.pointsLoss} Poin</span>
          </div>
          <div>
            Tie-Breaker: Poin ➔ Selisih Skor (+/-) ➔ Skor Memasukkan (GM) ➔ Head-to-Head
          </div>
        </div>
      </div>
    </div>
  );
};
