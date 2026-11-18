import React, { useState, useMemo } from 'react';
import { League } from '../../types/league';
import { leagueService, calculateStandings } from '../../services/leagueService';
import { useAuth } from '../../context/AuthContext';
import {
  TableProperties,
  Search,
  Plus,
  Users,
  Swords,
  Clock,
  CheckCircle2,
  Gamepad2,
  ArrowRight,
  Medal,
} from 'lucide-react';

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
          <span className="px-2 py-0.5 bg-nb-yellow text-black border-2 border-black font-mono font-black text-[11px] uppercase flex items-center gap-1 shadow-brutal-sm">
            <Clock className="w-3 h-3" /> Berjalan
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="px-2 py-0.5 bg-nb-cardAlt text-nb-ink border-2 border-black font-mono font-black text-[11px] uppercase flex items-center gap-1 shadow-brutal-sm">
            <CheckCircle2 className="w-3 h-3 text-nb-green" /> Selesai
          </span>
        );
      case 'REGISTRATION_OPEN':
      default:
        return (
          <span className="px-2 py-0.5 bg-nb-green text-black border-2 border-black font-mono font-black text-[11px] uppercase flex items-center gap-1 shadow-brutal-sm">
            <Users className="w-3 h-3" /> Registrasi
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-mono font-black uppercase text-nb-ink tracking-tight flex items-center gap-2">
            <TableProperties className="w-6 h-6 text-nb-yellow" />
            <span>Kompetisi Liga & Klasemen</span>
          </h2>
          <p className="text-xs sm:text-sm text-nb-muted font-sans font-medium mt-1">
            Format round-robin sistem poin resmi (Menang: 3, Seri: 1, Kalah: 0) dengan klasemen otomatis.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={onOpenCreateModal}
            className="px-4 py-2 bg-nb-yellow border-3 border-black text-xs font-mono font-black uppercase text-black shadow-brutal hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-brutal-lg transition-all flex items-center gap-2 self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>+ Buat Liga Baru</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-nb-card border-3 border-black p-3 shadow-brutal">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-nb-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari liga berdasarkan nama, game, atau musim..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-nb-bg border-2 border-black font-sans font-bold text-nb-ink placeholder:text-nb-muted focus:outline-hidden focus:bg-nb-card"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'ALL', label: 'Semua Liga' },
            { id: 'IN_PROGRESS', label: 'Sedang Berjalan' },
            { id: 'REGISTRATION_OPEN', label: 'Buka Registrasi' },
            { id: 'COMPLETED', label: 'Selesai' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-2.5 py-1 text-[11px] font-mono font-bold uppercase whitespace-nowrap transition-all border-2 border-black ${
                filterStatus === tab.id
                  ? 'bg-nb-yellow text-black font-black shadow-brutal-sm'
                  : 'bg-nb-cardAlt text-nb-muted hover:text-nb-ink hover:bg-nb-bg'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Leagues */}
      {filteredLeagues.length === 0 ? (
        <div className="bg-nb-card border-3 border-black shadow-brutal p-12 text-center max-w-md mx-auto">
          <TableProperties className="w-12 h-12 mx-auto mb-3 text-nb-yellow" />
          <h4 className="font-mono font-black uppercase text-sm text-nb-ink">Tidak Ada Liga Ditemukan</h4>
          <p className="text-xs text-nb-muted mt-1 font-sans">
            {search ? 'Coba ubah kata kunci pencarian Anda.' : 'Belum ada liga yang sesuai dengan filter ini.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredLeagues.map((league) => {
            const standings = calculateStandings(league);
            const leader = standings[0];
            const completedCount = league.matches.filter((m) => m.status === 'COMPLETED').length;

            return (
              <div
                key={league.id}
                onClick={() => onSelectLeague(league.id)}
                className="group cursor-pointer bg-nb-card border-3 border-black p-5 shadow-brutal hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-brutal-lg transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Card Top: Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      {getStatusBadge(league.status)}
                      {league.game && (
                        <span className="px-2 py-0.5 bg-nb-cardAlt border-2 border-black font-mono font-bold text-[10px] uppercase flex items-center gap-1">
                          <Gamepad2 className="w-3 h-3 text-nb-yellow" />
                          <span>{league.game}</span>
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-[10px] font-bold text-nb-muted uppercase">
                      {league.season}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-mono font-black text-lg text-nb-ink group-hover:text-nb-yellow transition-colors leading-tight mb-2">
                    {league.title}
                  </h3>

                  {league.description && (
                    <p className="text-xs text-nb-muted font-sans font-medium line-clamp-2 mb-4">
                      {league.description}
                    </p>
                  )}

                  {/* Leader Spotlight (if any played match) */}
                  {leader && leader.played > 0 && (
                    <div className="mb-4 p-2.5 bg-nb-cardAlt border-2 border-black flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 bg-nb-yellow text-black border border-black font-mono font-black text-[10px] flex items-center gap-0.5">
                          <Medal className="w-3 h-3" /> #1
                        </span>
                        <span className="font-mono font-black text-xs text-nb-ink truncate max-w-[150px] sm:max-w-[200px]">
                          {leader.tag ? `[${leader.tag}] ` : ''}
                          {leader.teamName}
                        </span>
                      </div>
                      <span className="font-mono font-black text-xs text-nb-ink whitespace-nowrap bg-nb-yellow/40 px-2 py-0.5 border border-black/30">
                        {leader.points} Pts ({leader.won}W-{leader.draw}D-{leader.lost}L)
                      </span>
                    </div>
                  )}
                </div>

                {/* Footer Metrics & Action Button */}
                <div className="pt-3 border-t-2 border-black/10 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-4 text-xs font-mono text-nb-muted">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      <strong className="text-nb-ink">{league.teams.length}</strong> Tim
                    </span>
                    <span className="flex items-center gap-1">
                      <Swords className="w-3.5 h-3.5" />
                      <strong className="text-nb-ink">{completedCount}/{league.matches.length}</strong> Laga
                    </span>
                  </div>

                  <span className="px-3 py-1 bg-nb-cardAlt border-2 border-black font-mono font-black text-xs text-nb-ink group-hover:bg-nb-yellow group-hover:text-black flex items-center gap-1 transition-all">
                    <span>Lihat Klasemen</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
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
