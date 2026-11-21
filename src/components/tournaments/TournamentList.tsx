import React, { useState, useMemo } from 'react';
import { Tournament } from '../../types/tournament';
import { TournamentCard } from './TournamentCard';
import { Search } from 'lucide-react';
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
    { label: 'Semua', value: 'ALL' },
    { label: 'Berjalan', value: 'IN_PROGRESS' },
    { label: 'Registrasi', value: 'REGISTRATION_OPEN' },
    { label: 'Selesai', value: 'COMPLETED' },
  ];

  return (
    <div className="space-y-4 font-sans">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-mono font-bold uppercase tracking-tight text-zinc-950">
            Daftar Turnamen Knockout
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 font-normal mt-0.5">
            Kompetisi sistem gugur resmi (Single Elimination Tournament).
          </p>
        </div>

        {isAdmin && (
          <button
            type="button"
            onClick={onOpenCreateModal}
            className="px-3.5 py-1.5 bg-zinc-950 text-white hover:bg-zinc-800 border border-zinc-950 text-xs font-mono font-semibold uppercase tracking-wider transition-colors self-start sm:self-auto shrink-0"
          >
            + Buat Turnamen Baru
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
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari turnamen berdasarkan nama atau aturan..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-zinc-50 border border-zinc-300 text-zinc-950 placeholder:text-zinc-400 focus:outline-hidden focus:bg-white focus:border-zinc-950 transition-colors font-sans"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {filters.map((f) => (
            <button
              type="button"
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`px-3 py-1 text-xs font-mono font-semibold uppercase whitespace-nowrap transition-colors border ${
                statusFilter === f.value
                  ? 'bg-zinc-950 text-white border-zinc-950'
                  : 'bg-white text-zinc-600 border-zinc-300 hover:bg-zinc-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tournaments Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="bg-white border-[1.5px] border-zinc-400 p-5 h-56 animate-pulse flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="h-4 bg-zinc-200 w-1/4" />
                <div className="h-5 bg-zinc-200 w-3/4" />
                <div className="h-3 bg-zinc-200 w-full" />
              </div>
              <div className="h-3 bg-zinc-200 w-full" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border-[1.5px] border-zinc-400 p-10 text-center font-mono">
          <div className="text-xs sm:text-sm font-semibold uppercase text-zinc-500">
            Tidak Ada Turnamen Ditemukan
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 font-sans">
            {search
              ? 'Coba ubah kata kunci pencarian.'
              : isAdmin
              ? 'Belum ada turnamen yang sesuai filter. Buat turnamen baru untuk memulai.'
              : 'Belum ada turnamen yang dipublikasikan.'}
          </p>
          {isAdmin && (
            <button
              type="button"
              onClick={onOpenCreateModal}
              className="mt-4 px-4 py-2 bg-zinc-950 text-white text-xs font-mono font-semibold uppercase tracking-wider hover:bg-zinc-800 transition-colors"
            >
              + Buat Turnamen Pertama
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((t) => (
            <TournamentCard key={t.id} tournament={t} onSelect={onSelectTournament} />
          ))}
        </div>
      )}
    </div>
  );
};
