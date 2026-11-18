import React, { useState, useMemo } from 'react';
import { Tournament } from '../../types/tournament';
import { TournamentCard } from './TournamentCard';
import { Search, Trophy, Plus, Filter } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface TournamentListProps {
  tournaments: Tournament[];
  isLoading: boolean;
  onSelectTournament: (id: string) => void;
  onOpenCreateModal: () => void;
}

export const TournamentList: React.FC<TournamentListProps> = ({
  tournaments,
  isLoading,
  onSelectTournament,
  onOpenCreateModal,
}) => {
  const { isAdmin } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filtered = useMemo(() => {
    return tournaments.filter((t) => {
      const matchSearch =
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        (t.description && t.description.toLowerCase().includes(search.toLowerCase()));
      const matchStatus = statusFilter === 'ALL' || t.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [tournaments, search, statusFilter]);

  const filters = [
    { label: 'Semua Turnamen', value: 'ALL' },
    { label: 'Sedang Tanding', value: 'IN_PROGRESS' },
    { label: 'Registrasi Buka', value: 'REGISTRATION_OPEN' },
    { label: 'Selesai', value: 'COMPLETED' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Search & Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md flex items-center">
          <Search className="w-4 h-4 absolute left-3.5 text-nb-muted pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama turnamen atau aturan..."
            className="neo-input !pl-10 text-sm font-bold"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <span className="text-nb-muted font-bold flex items-center gap-1 mr-1 hidden sm:flex">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`px-3.5 py-2 border-3 border-black font-mono font-black uppercase transition-all ${
                statusFilter === f.value
                  ? 'bg-nb-yellow text-black shadow-brutal translate-x-[-1px] translate-y-[-1px]'
                  : 'bg-nb-card text-nb-ink shadow-brutal-sm hover:bg-nb-cardAlt'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tournaments Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="bg-nb-card border-3 border-black shadow-brutal p-6 h-60 animate-pulse flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="h-5 bg-nb-cardAlt w-1/3 border-2 border-black" />
                <div className="h-6 bg-nb-cardAlt w-3/4 border-2 border-black" />
                <div className="h-3 bg-nb-cardAlt w-full border border-black" />
              </div>
              <div className="h-3 bg-nb-cardAlt w-full border border-black" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-nb-card text-nb-ink border-3 border-black shadow-brutal-lg p-12 text-center max-w-xl mx-auto my-6">
          <div className="w-16 h-16 bg-nb-yellow border-3 border-black mx-auto mb-4 flex items-center justify-center shadow-brutal-sm">
            <Trophy className="w-8 h-8 text-black" />
          </div>
          <h3 className="text-xl font-mono font-black uppercase tracking-tight text-nb-ink">Tidak Ada Turnamen</h3>
          <p className="text-sm text-nb-muted font-sans font-medium mt-2 leading-relaxed">
            {isAdmin
              ? 'Belum ada turnamen yang sesuai filter. Buat turnamen baru sebagai Admin untuk memulai bagan pertandingan.'
              : 'Belum ada turnamen yang dipublikasikan oleh Admin.'}
          </p>
          {isAdmin && (
            <button onClick={onOpenCreateModal} className="neo-btn mt-6 py-2.5 px-5">
              <Plus className="w-4 h-4" /> Buat Turnamen Pertama
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((t) => (
            <TournamentCard key={t.id} tournament={t} onSelect={onSelectTournament} />
          ))}
        </div>
      )}
    </div>
  );
};
