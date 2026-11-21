import React, { useState, useMemo } from 'react';
import { League } from '../../types/league';
import { leagueService, calculateStandings } from '../../services/leagueService';
import { useAuth } from '../../context/AuthContext';
import { Search, ArrowRight } from 'lucide-react';

interface LeagueListProps {
  onSelectLeague: (leagueId: string) => void;
  onOpenCreateModal: () => void;
}

export const LeagueList: React.FC<LeagueListProps> = ({
  onSelectLeague,
  onOpenCreateModal,
}) => {
  const { isAdmin } = useAuth();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const leagues = useMemo(() => {
    return leagueService.getLeagues(filterStatus === 'ALL' ? undefined : filterStatus);
  }, [filterStatus]);

  const filteredLeagues = useMemo(() => {
    return leagues.filter((l) => {
      const matchQuery =
        l.title.toLowerCase().includes(search.toLowerCase()) ||
        l.season.toLowerCase().includes(search.toLowerCase()) ||
        (l.game && l.game.toLowerCase().includes(search.toLowerCase()));
      return matchQuery;
    });
  }, [leagues, search]);

  const getStatusBadge = (status: League['status']) => {
    switch (status) {
      case 'IN_PROGRESS':
        return (
          <span className="px-1.5 py-0.2 bg-zinc-950 text-white font-mono font-bold text-[10px] uppercase">
            BERJALAN
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="px-1.5 py-0.2 bg-zinc-100 text-zinc-600 border border-zinc-300 font-mono font-semibold text-[10px] uppercase">
            SELESAI
          </span>
        );
      case 'REGISTRATION_OPEN':
      default:
        return (
          <span className="px-1.5 py-0.2 bg-emerald-50 text-emerald-700 border border-emerald-300 font-mono font-bold text-[10px] uppercase">
            REGISTRASI
          </span>
        );
    }
  };

  return (
    <div className="space-y-4 font-sans">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-mono font-bold uppercase tracking-tight text-zinc-950">
            Daftar Kompetisi Liga
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 font-normal mt-0.5">
            Sistem klasemen round-robin resmi (Menang: 3, Seri: 1, Kalah: 0).
          </p>
        </div>

        {isAdmin && (
          <button
            type="button"
            onClick={onOpenCreateModal}
            className="px-3.5 py-1.5 bg-zinc-950 text-white hover:bg-zinc-800 border border-zinc-950 text-xs font-mono font-semibold uppercase tracking-wider transition-colors self-start sm:self-auto shrink-0"
          >
            + Buat Liga Baru
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border-[1.5px] border-zinc-400 p-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 stroke-[1.75]" />
          <input
            type="text"
            placeholder="Cari liga berdasarkan nama, game, atau musim..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-zinc-50 border border-zinc-300 text-zinc-950 placeholder:text-zinc-400 focus:outline-hidden focus:bg-white focus:border-zinc-950 transition-colors font-sans"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'ALL', label: 'Semua' },
            { id: 'IN_PROGRESS', label: 'Berjalan' },
            { id: 'REGISTRATION_OPEN', label: 'Registrasi' },
            { id: 'COMPLETED', label: 'Selesai' },
          ].map((tab) => (
            <button
              type="button"
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1 text-xs font-mono font-semibold uppercase whitespace-nowrap transition-colors border ${
                filterStatus === tab.id
                  ? 'bg-zinc-950 text-white border-zinc-950'
                  : 'bg-white text-zinc-600 border-zinc-300 hover:bg-zinc-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Hairline Group Container (Swiss Grid Standard) */}
      {filteredLeagues.length === 0 ? (
        <div className="bg-white border-[1.5px] border-zinc-400 p-10 text-center font-mono">
          <div className="text-xs sm:text-sm font-semibold uppercase text-zinc-500">
            Tidak Ada Liga Ditemukan
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 font-sans">
            {search ? 'Coba ubah kata kunci pencarian.' : 'Belum ada liga yang sesuai dengan filter ini.'}
          </p>
        </div>
      ) : (
        <div className="bg-white border-[1.5px] border-zinc-400 divide-y divide-zinc-300">
          {filteredLeagues.map((league) => {
            const standings = calculateStandings(league);
            const leader = standings[0];
            const completedCount = league.matches.filter((m) => m.status === 'COMPLETED').length;

            return (
              <div
                key={league.id}
                onClick={() => onSelectLeague(league.id)}
                className="p-4 sm:p-5 hover:bg-zinc-50/80 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div className="flex-1 min-w-0">
                  {/* Top Badges */}
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    {getStatusBadge(league.status)}
                    {league.game && (
                      <span className="px-1.5 py-0.2 bg-zinc-100 text-zinc-700 font-mono text-[10px] uppercase border border-zinc-300">
                        {league.game}
                      </span>
                    )}
                    <span className="font-mono text-[10px] text-zinc-400 uppercase">
                      {league.season}
                    </span>
                  </div>

                  {/* League Title */}
                  <h2 className="text-base sm:text-lg font-bold text-zinc-950 tracking-tight group-hover:text-zinc-700 transition-colors">
                    {league.title}
                  </h2>

                  {league.description && (
                    <p className="text-xs sm:text-sm text-zinc-500 font-normal line-clamp-1 mt-0.5">
                      {league.description}
                    </p>
                  )}

                  {/* Leader compact tag if played */}
                  {leader && leader.played > 0 && (
                    <div className="mt-2 font-mono text-xs text-zinc-600 flex items-center gap-1.5">
                      <span className="font-bold text-zinc-950">#1 {leader.teamName}</span>
                      <span className="text-zinc-400">·</span>
                      <span className="tabular-nums font-semibold text-zinc-950">
                        {leader.points} Pts ({leader.won}M-{leader.draw}S-{leader.lost}K)
                      </span>
                    </div>
                  )}
                </div>

                {/* Right Side: Metrics & Action */}
                <div className="flex items-center sm:flex-col sm:items-end justify-between sm:justify-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-200">
                  <div className="font-mono text-xs sm:text-sm text-zinc-500 tabular-nums">
                    <span className="font-semibold text-zinc-950">{league.teams.length}</span> Tim
                    <span className="mx-1.5 text-zinc-300">/</span>
                    <span className="font-semibold text-zinc-950">{completedCount}/{league.matches.length}</span> Laga
                  </div>

                  <span className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-zinc-950 group-hover:underline">
                    <span>Lihat Klasemen</span>
                    <ArrowRight className="w-3.5 h-3.5 stroke-[1.75]" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
