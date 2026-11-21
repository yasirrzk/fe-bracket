import React, { useState } from 'react';
import { Tournament, Match } from '../../types/tournament';
import { BracketTree } from '../bracket/BracketTree';
import { ScoreModal } from '../bracket/ScoreModal';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { api } from '../../services/api';
import { ArrowLeft, X } from 'lucide-react';

interface TournamentDetailProps {
  tournament: Tournament;
  onBack: () => void;
  onRefresh: () => void;
}

export const TournamentDetail: React.FC<TournamentDetailProps> = ({ tournament, onBack, onRefresh }) => {
  const { role, isAdmin } = useAuth();
  const { showToast } = useNotification();
  const [activeTab, setActiveTab] = useState<'bracket' | 'roster'>('bracket');
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAddingParticipant, setIsAddingParticipant] = useState(false);
  const [newParticipantName, setNewParticipantName] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const participantCount = tournament.participantsCount ?? tournament.participants?.length ?? 0;
  const matchCount = tournament.matchesCount ?? tournament.matches?.length ?? 0;
  const canAddParticipant = isAdmin && tournament.status === 'REGISTRATION_OPEN' && participantCount < tournament.maxParticipants;

  const handleGenerateBracket = async () => {
    if (!isAdmin) {
      showToast('error', '403 Forbidden', 'Hanya Admin yang dapat men-generate bracket.');
      return;
    }
    if (participantCount < 2) {
      showToast('warning', 'Peserta Kurang', 'Minimal 2 peserta dibutuhkan untuk membentuk bagan turnamen.');
      return;
    }
    setIsGenerating(true);
    try {
      await api.generateBracket(tournament.id, role);
      showToast('success', 'Bracket Digenerate', 'Bagan sistem gugur berhasil dibentuk!');
      onRefresh();
    } catch (err: any) {
      showToast('error', 'Gagal Generate', err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddParticipant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newParticipantName.trim()) {
      showToast('warning', 'Nama Kosong', 'Masukkan nama peserta atau tim.');
      return;
    }
    setIsAddingParticipant(true);
    try {
      await api.registerParticipant(tournament.id, { userId: newParticipantName.trim() }, role);
      showToast('success', 'Peserta Terdaftar', `Peserta "${newParticipantName.trim()}" berhasil didaftarkan.`);
      setNewParticipantName('');
      setIsAddModalOpen(false);
      onRefresh();
    } catch (err: any) {
      showToast('error', 'Gagal Tambah Peserta', err.message);
    } finally {
      setIsAddingParticipant(false);
    }
  };

  const handleMatchSelect = (match: Match) => {
    if (!isAdmin) {
      showToast('info', 'Mode Lihat Saja', 'User biasa hanya dapat melihat bagan pertandingan.');
      return;
    }
    setSelectedMatch(match);
  };

  const getStatusBadge = (status: Tournament['status']) => {
    switch (status) {
      case 'IN_PROGRESS':
        return (
          <span className="px-2 py-0.5 bg-zinc-950 text-white font-mono font-bold text-[10px] uppercase">
            SEDANG BERLANGSUNG
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="px-2 py-0.5 bg-zinc-100 text-zinc-600 border border-zinc-300 font-mono font-semibold text-[10px] uppercase">
            SELESAI
          </span>
        );
      case 'REGISTRATION_OPEN':
      default:
        return (
          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-300 font-mono font-bold text-[10px] uppercase">
            PENDAFTARAN BUKA
          </span>
        );
    }
  };

  return (
    <div className="space-y-5 font-sans animate-in fade-in duration-100">
      {/* Score Modal */}
      <ScoreModal
        match={selectedMatch}
        isOpen={!!selectedMatch}
        onClose={() => setSelectedMatch(null)}
        onScoreSubmitted={onRefresh}
      />

      {/* Add Participant Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 font-sans backdrop-blur-[1px]">
          <div className="relative w-full max-w-md bg-white border-2 border-zinc-900 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between p-4 border-b border-zinc-300 bg-white">
              <div>
                <h3 className="font-mono font-bold text-sm uppercase text-zinc-950">Daftarkan Peserta Baru</h3>
                <p className="text-[10px] font-mono text-zinc-500 uppercase">Input Nama Pemain / Tim</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-zinc-950 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddParticipant} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-mono font-semibold uppercase text-zinc-600 mb-1">
                  Nama Peserta / Klub <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="contoh: Rex Regum Qeon, Tenz, Paper Rex..."
                  value={newParticipantName}
                  onChange={(e) => setNewParticipantName(e.target.value)}
                  disabled={isAddingParticipant}
                  className="w-full px-3 py-2 text-xs bg-white border border-zinc-300 focus:border-zinc-950 text-zinc-950 outline-hidden font-sans transition-colors"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-300">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 border border-zinc-300 text-xs font-mono font-medium text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isAddingParticipant}
                  className="px-4 py-1.5 bg-zinc-950 text-white text-xs font-mono font-semibold uppercase tracking-wider hover:bg-zinc-800 transition-colors disabled:opacity-50 border border-zinc-950"
                >
                  {isAddingParticipant ? 'Mendaftarkan...' : 'Daftarkan Peserta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Top Bar Navigation & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="px-3 py-1.5 border border-zinc-300 bg-white hover:bg-zinc-50 text-zinc-700 hover:text-zinc-950 text-xs font-mono font-semibold transition-colors flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5 stroke-[1.75]" />
          <span>Kembali</span>
        </button>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <>
              {canAddParticipant && (
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-3 py-1.5 border border-zinc-300 bg-white hover:bg-zinc-50 text-zinc-950 text-xs font-mono font-semibold transition-colors"
                >
                  + Tambah Peserta
                </button>
              )}

              {tournament.status !== 'COMPLETED' && (
                <button
                  type="button"
                  onClick={handleGenerateBracket}
                  disabled={isGenerating || participantCount < 2}
                  className="px-3.5 py-1.5 bg-zinc-950 text-white hover:bg-zinc-800 border border-zinc-950 text-xs font-mono font-semibold transition-colors disabled:opacity-50"
                  title={participantCount < 2 ? 'Minimal 2 peserta' : 'Generate bracket knockout'}
                >
                  {matchCount > 0 ? 'Generate Ulang Bracket' : 'Generate Bracket'}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Hero Banner Turnamen */}
      <div className="bg-white border-[1.5px] border-zinc-400 p-5 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              {getStatusBadge(tournament.status)}
              <span className="px-1.5 py-0.2 bg-zinc-100 text-zinc-500 font-mono text-[10px] uppercase border border-zinc-300">
                Single Elimination
              </span>
              <span className="font-mono text-[10px] text-zinc-400 uppercase">
                {tournament.createdAt ? new Date(tournament.createdAt).toLocaleDateString() : 'N/A'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-zinc-950 tracking-tight">
              {tournament.title}
            </h1>

            {tournament.description && (
              <p className="text-xs sm:text-sm text-zinc-500 font-normal max-w-2xl">
                {tournament.description}
              </p>
            )}
          </div>

          {/* Quick Metrics */}
          <div className="divide-x divide-zinc-300 border border-zinc-300 bg-zinc-50 inline-flex font-mono text-xs tabular-nums self-start md:self-auto shrink-0">
            <div className="px-3.5 py-2 text-center">
              <span className="block text-sm sm:text-base font-bold text-zinc-950">
                {participantCount}/{tournament.maxParticipants}
              </span>
              <span className="text-[10px] uppercase text-zinc-500 font-semibold">Peserta</span>
            </div>
            <div className="px-3.5 py-2 text-center">
              <span className="block text-sm sm:text-base font-bold text-zinc-950">
                {matchCount}
              </span>
              <span className="text-[10px] uppercase text-zinc-500 font-semibold">Laga</span>
            </div>
            <div className="px-3.5 py-2 text-center">
              <span className="block text-sm sm:text-base font-bold text-zinc-950">
                {tournament.maxParticipants}
              </span>
              <span className="text-[10px] uppercase text-zinc-500 font-semibold">Bagan</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation (Swiss Grid Flat Underline) */}
      <div className="flex items-center border-b-2 border-zinc-300 gap-6 font-mono text-xs overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('bracket')}
          className={`pb-2.5 uppercase font-semibold tracking-wider transition-colors -mb-[2px] ${
            activeTab === 'bracket'
              ? 'border-b-2 border-zinc-950 text-zinc-950 font-bold'
              : 'text-zinc-500 hover:text-zinc-950 border-b-2 border-transparent'
          }`}
        >
          Bagan Bracket
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('roster')}
          className={`pb-2.5 uppercase font-semibold tracking-wider transition-colors -mb-[2px] flex items-center gap-1.5 ${
            activeTab === 'roster'
              ? 'border-b-2 border-zinc-950 text-zinc-950 font-bold'
              : 'text-zinc-500 hover:text-zinc-950 border-b-2 border-transparent'
          }`}
        >
          <span>Daftar Peserta</span>
          <span className="px-1.5 py-0.2 bg-zinc-100 text-zinc-600 text-[10px] tabular-nums border border-zinc-300">
            {participantCount}
          </span>
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'bracket' ? (
        <div>
          <BracketTree tournament={tournament} onSelectMatch={handleMatchSelect} />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-mono font-bold uppercase text-xs text-zinc-950">
                Peserta Terdaftar ({participantCount} / {tournament.maxParticipants})
              </h3>
              <p className="text-xs text-zinc-500 font-normal">
                Bagan turnamen akan diacak atau di-seed sesuai urutan registrasi.
              </p>
            </div>
            {canAddParticipant && (
              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="px-3 py-1.5 bg-zinc-950 text-white hover:bg-zinc-800 border border-zinc-950 text-xs font-mono font-semibold uppercase tracking-wider transition-colors"
              >
                + Tambah Peserta
              </button>
            )}
          </div>

          {participantCount === 0 ? (
            <div className="bg-white border-[1.5px] border-zinc-400 p-8 text-center max-w-md mx-auto font-mono">
              <div className="font-bold uppercase text-xs sm:text-sm text-zinc-950">Belum Ada Peserta</div>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1 font-sans">
                Daftarkan minimal 2 peserta untuk mulai men-generate bracket eliminasi.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {(tournament.participants || []).map((p, idx) => (
                <div
                  key={p.id}
                  className="bg-white border-[1.5px] border-zinc-400 p-3.5 hover:border-zinc-600 transition-colors"
                >
                  <div className="flex items-center justify-between gap-1 mb-1 font-mono text-[10px] text-zinc-400">
                    <span>Seed #{p.seed ?? idx + 1}</span>
                    <span>SLOT {idx + 1}</span>
                  </div>
                  <h4 className="font-sans font-bold text-sm sm:text-base text-zinc-950 truncate">
                    {p.user?.username || p.userId}
                  </h4>
                  {p.user?.email && (
                    <div className="text-[11px] font-mono text-zinc-500 truncate mt-0.5">
                      {p.user.email}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
