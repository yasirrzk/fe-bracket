import React, { useState } from 'react';
import { Tournament, Match } from '../../types/tournament';
import { BracketTree } from '../bracket/BracketTree';
import { ScoreModal } from '../bracket/ScoreModal';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { api } from '../../services/api';
import { ArrowLeft, Users, GitBranch, UserPlus, RefreshCw, Plus, ShieldCheck, Calendar } from 'lucide-react';

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
      showToast('success', 'Berhasil', 'Bracket bagan sistem gugur berhasil digenerate!');
      onRefresh();
    } catch (err: any) {
      showToast('error', 'Gagal', err.message);
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
      showToast('success', 'Ditambahkan', `Peserta "${newParticipantName.trim()}" berhasil didaftarkan.`);
      setNewParticipantName('');
      setIsAddModalOpen(false);
      onRefresh();
    } catch (err: any) {
      showToast('error', 'Gagal', err.message);
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

  return (
    <div className="space-y-6">
      {/* Back and Refresh Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="neo-btn-secondary text-xs py-2 px-3 flex items-center gap-2 font-black"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar Turnamen</span>
        </button>
        <button
          onClick={onRefresh}
          className="p-2 bg-nb-card border-3 border-black shadow-brutal-sm text-nb-ink hover:bg-nb-yellow hover:text-black transition-colors"
          title="Perbarui data"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Hero Header Box */}
      <div className="bg-nb-card text-nb-ink border-3 border-black shadow-brutal p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className={`px-2.5 py-1 text-xs font-mono font-black uppercase border-2 border-black shadow-brutal-sm ${
                tournament.status === 'IN_PROGRESS'
                  ? 'bg-nb-yellow text-black'
                  : tournament.status === 'COMPLETED'
                  ? 'bg-black text-[#FAF6ED]'
                  : 'bg-nb-green text-black'
              }`}>
                STATUS: {tournament.status}
              </span>
              <span className="text-nb-muted text-xs font-mono font-bold flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Dibuat: {tournament.createdAt ? new Date(tournament.createdAt).toLocaleDateString() : 'N/A'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight font-sans text-nb-ink">
              {tournament.title}
            </h1>
            <p className="text-sm text-nb-muted font-sans font-medium max-w-2xl">
              {tournament.description || 'Turnamen sistem gugur eliminasi tunggal resmi engine.'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            {canAddParticipant && (
              <button onClick={() => setIsAddModalOpen(true)} className="neo-btn py-2.5 px-4 text-xs">
                <UserPlus className="w-4 h-4" />
                <span>+ ISI PESERTA</span>
              </button>
            )}

            {isAdmin && tournament.status !== 'IN_PROGRESS' && tournament.status !== 'COMPLETED' && (
              <button
                onClick={handleGenerateBracket}
                disabled={isGenerating || participantCount < 2}
                className="neo-btn bg-nb-green hover:bg-nb-yellow text-black py-2.5 px-4 text-xs"
                title="Admin: Generate bagan knockout turnamen"
              >
                <GitBranch className="w-4 h-4" />
                <span>{isGenerating ? 'GENERATING...' : 'GENERATE BRACKET'}</span>
              </button>
            )}

            {isAdmin && (tournament.status === 'IN_PROGRESS' || tournament.status === 'COMPLETED') && (
              <button
                onClick={handleGenerateBracket}
                disabled={isGenerating || participantCount < 2}
                className="neo-btn-secondary py-2.5 px-4 text-xs hover:bg-nb-yellow hover:text-black transition-colors"
                title="Admin: Acak ulang dan re-generate bagan turnamen"
              >
                <GitBranch className="w-4 h-4" />
                <span>{isGenerating ? 'RESEEDING...' : 'RESEED BRACKET'}</span>
              </button>
            )}

            {!isAdmin && (
              <div className="px-3.5 py-2 bg-nb-cardAlt border-3 border-black font-mono text-xs font-bold text-nb-ink shadow-brutal-sm">
                Mode Lihat Saja (User Biasa)
              </div>
            )}
          </div>
        </div>

        {/* Metadata Strip */}
        <div className="mt-6 pt-4 border-t-3 border-black grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
          <div className="bg-nb-cardAlt p-2.5 border-2 border-black">
            <span className="text-nb-muted block text-[10px] uppercase font-bold">Kuota Peserta</span>
            <span className="font-black text-nb-ink text-sm">
              {participantCount} / {tournament.maxParticipants}
            </span>
          </div>
          <div className="bg-nb-cardAlt p-2.5 border-2 border-black">
            <span className="text-nb-muted block text-[10px] uppercase font-bold">Format Bagan</span>
            <span className="font-black text-nb-yellow text-sm">Single Elimination</span>
          </div>
          <div className="bg-nb-cardAlt p-2.5 border-2 border-black">
            <span className="text-nb-muted block text-[10px] uppercase font-bold">Total Match</span>
            <span className="font-black text-nb-ink text-sm">
              {tournament.matches?.length || 0} Pertandingan
            </span>
          </div>
          <div className="bg-nb-cardAlt p-2.5 border-2 border-black">
            <span className="text-nb-muted block text-[10px] uppercase font-bold">Izin Anda</span>
            <span className="font-black text-sm flex items-center gap-1 text-nb-ink">
              <ShieldCheck className="w-4 h-4 text-nb-red" />
              {isAdmin ? 'ADMIN (Akses Penuh)' : 'USER (Lihat Saja)'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b-3 border-black gap-2">
        <button
          onClick={() => setActiveTab('bracket')}
          className={`px-5 py-2.5 font-mono text-xs font-black uppercase -mb-[3px] border-3 border-black transition-all ${
            activeTab === 'bracket'
              ? 'bg-nb-yellow text-black shadow-brutal border-b-nb-yellow'
              : 'bg-nb-card text-nb-ink hover:bg-nb-cardAlt'
          }`}
        >
          <GitBranch className="w-4 h-4 inline mr-1.5" />
          Interactive Bracket ({tournament.matches?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('roster')}
          className={`px-5 py-2.5 font-mono text-xs font-black uppercase -mb-[3px] border-3 border-black transition-all ${
            activeTab === 'roster'
              ? 'bg-nb-yellow text-black shadow-brutal border-b-nb-yellow'
              : 'bg-nb-card text-nb-ink hover:bg-nb-cardAlt'
          }`}
        >
          <Users className="w-4 h-4 inline mr-1.5" />
          Peserta Terdaftar ({participantCount})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'bracket' ? (
        <BracketTree tournament={tournament} onSelectMatch={handleMatchSelect} />
      ) : (
        <div className="bg-nb-card text-nb-ink border-3 border-black shadow-brutal p-6">
          <div className="flex items-center justify-between mb-5 pb-3 border-b-2 border-black">
            <h3 className="font-mono text-sm font-black uppercase flex items-center gap-2 text-nb-ink">
              <Users className="w-5 h-5 text-nb-yellow" />
              Daftar Peserta & Seeding Turnamen
            </h3>
            {canAddParticipant && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="neo-btn text-xs py-1.5 px-3 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Tambah Peserta
              </button>
            )}
          </div>

          {!tournament.participants?.length ? (
            <div className="p-10 text-center border-3 border-black border-dashed bg-nb-cardAlt">
              <p className="text-sm font-mono font-bold text-nb-muted">Belum ada peserta yang didaftarkan.</p>
              {isAdmin && (
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="neo-btn mt-4 py-2 px-4 text-xs inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Isi Peserta Sekarang
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {tournament.participants.map((p, idx) => (
                <div
                  key={p.id}
                  className="bg-nb-cardAlt border-2 border-black p-3 flex items-center gap-3 font-mono shadow-brutal-sm"
                >
                  <div className="w-8 h-8 bg-nb-yellow border-2 border-black flex items-center justify-center font-black text-xs text-black">
                    #{p.seed || idx + 1}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-black truncate text-nb-ink">
                      {p.user?.username || `Player ${idx + 1}`}
                    </div>
                    <div className="text-[10px] text-nb-muted truncate">{p.user?.email}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal Admin Isi Peserta */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-nb-card text-nb-ink border-3 border-black shadow-brutal-lg max-w-md w-full p-6 relative animate-in fade-in zoom-in-95 font-sans">
            <h3 className="text-lg font-black uppercase flex items-center gap-2 mb-2 font-mono text-nb-ink">
              <UserPlus className="w-5 h-5 text-nb-yellow" />
              Isi Peserta Turnamen (Admin)
            </h3>
            <p className="text-xs text-nb-muted font-mono mb-4">
              Daftarkan nama tim ke turnamen <strong>{tournament.title}</strong> (Sisa slot:{' '}
              {tournament.maxParticipants - participantCount})
            </p>

            <form onSubmit={handleAddParticipant} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-black uppercase mb-1 text-nb-ink">
                  Nama Tim / Peserta *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newParticipantName}
                  onChange={(e) => setNewParticipantName(e.target.value)}
                  placeholder="e.g. Sentinels, Paper Rex, Fnatic..."
                  className="neo-input"
                />
              </div>

              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-nb-muted block mb-1.5">
                  Saran Nama Tim Populer:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {['Sentinels', 'Paper Rex', 'Fnatic', 'T1 Esports', 'LOUD', 'NaVi'].map((t) => (
                    <button
                      type="button"
                      key={t}
                      onClick={() => setNewParticipantName(t)}
                      className="px-2 py-1 bg-nb-cardAlt border-2 border-black text-xs font-mono font-bold hover:bg-nb-yellow hover:text-black transition-colors shadow-brutal-sm text-nb-ink"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2.5 border-t-3 border-black">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="neo-btn-secondary px-4 py-2 text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isAddingParticipant}
                  className="neo-btn px-5 py-2 text-xs"
                >
                  {isAddingParticipant ? 'MENDAFTARKAN...' : 'TAMBAHKAN PESERTA'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Score Modal */}
      <ScoreModal
        match={selectedMatch}
        isOpen={!!selectedMatch}
        onClose={() => setSelectedMatch(null)}
        onScoreSubmitted={onRefresh}
      />
    </div>
  );
};
