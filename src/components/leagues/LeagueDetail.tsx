import React, { useState, useEffect } from 'react';
import { League, LeagueMatch } from '../../types/league';
import { leagueService } from '../../services/leagueService';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { LeagueStandingsTable } from './LeagueStandingsTable';
import { LeagueFixtures } from './LeagueFixtures';
import { LeagueScoreModal } from './LeagueScoreModal';
import { AddLeagueTeamModal } from './AddLeagueTeamModal';
import {
  ArrowLeft,
  TableProperties,
  Users,
  Plus,
  Play,
  Gamepad2,
  CheckCircle2,
  Clock,
  Swords,
} from 'lucide-react';

interface LeagueDetailProps {
  leagueId: string;
  onBack: () => void;
  onRefreshParent?: () => void;
}

const LeagueStatusBadge: React.FC<{ status: League['status'] }> = ({ status }) => {
  switch (status) {
    case 'IN_PROGRESS':
      return (
        <span className="px-2.5 py-1 bg-nb-yellow text-black border-2 border-black font-mono font-black text-xs uppercase flex items-center gap-1 shadow-brutal-sm">
          <Clock className="w-3.5 h-3.5" /> Sedang Berlangsung
        </span>
      );
    case 'COMPLETED':
      return (
        <span className="px-2.5 py-1 bg-nb-cardAlt text-nb-ink border-2 border-black font-mono font-black text-xs uppercase flex items-center gap-1 shadow-brutal-sm">
          <CheckCircle2 className="w-3.5 h-3.5 text-nb-green" /> Selesai
        </span>
      );
    case 'REGISTRATION_OPEN':
    default:
      return (
        <span className="px-2.5 py-1 bg-nb-green text-black border-2 border-black font-mono font-black text-xs uppercase flex items-center gap-1 shadow-brutal-sm">
          <Users className="w-3.5 h-3.5" /> Pendaftaran Terbuka
        </span>
      );
  }
};

export const LeagueDetail: React.FC<LeagueDetailProps> = ({
  leagueId,
  onBack,
  onRefreshParent,
}) => {
  const { isAdmin, role } = useAuth();
  const { showToast } = useNotification();

  // Lazy initializer avoids calling setState synchronously in an effect on mount
  const [prevLeagueId, setPrevLeagueId] = useState(leagueId);
  const [league, setLeague] = useState<League | null>(() => {
    try {
      return leagueService.getLeagueById(leagueId);
    } catch {
      return null;
    }
  });

  // If leagueId prop changes, update state directly during render
  if (prevLeagueId !== leagueId) {
    setPrevLeagueId(leagueId);
    try {
      setLeague(leagueService.getLeagueById(leagueId));
    } catch {
      setLeague(null);
    }
  }

  const [activeTab, setActiveTab] = useState<'standings' | 'fixtures' | 'teams'>('standings');
  const [selectedMatchForScore, setSelectedMatchForScore] = useState<LeagueMatch | null>(null);
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);
  const [isAddTeamModalOpen, setIsAddTeamModalOpen] = useState(false);
  const [isGeneratingSchedule, setIsGeneratingSchedule] = useState(false);

  // Notify and go back only if league fails to load
  useEffect(() => {
    if (!league) {
      showToast('error', 'Gagal Memuat Liga', 'Liga tidak ditemukan');
      onBack();
    }
  }, [league, showToast, onBack]);

  if (!league) {
    return (
      <div className="flex items-center justify-center p-16 font-mono text-sm">
        Memuat data kompetisi liga...
      </div>
    );
  }

  // Data update logic moved to event handler
  const handleDataUpdated = () => {
    try {
      const data = leagueService.getLeagueById(leagueId);
      setLeague(data);
    } catch (err: any) {
      showToast('error', 'Gagal Memuat Liga', err.message || 'Liga tidak ditemukan');
      onBack();
    }
    onRefreshParent?.();
  };

  const handleGenerateSchedule = () => {
    if (!isAdmin) {
      showToast('error', '403 Forbidden', 'Hanya Admin yang berhak men-generate jadwal liga.');
      return;
    }

    if (league.teams.length < 2) {
      showToast('warning', 'Tim Kurang', 'Minimal 2 tim dibutuhkan untuk membuat jadwal kompetisi.');
      return;
    }

    if (league.matches.length > 0) {
      if (!window.confirm('Jadwal pertandingan sudah ada. Generate ulang akan mereset skor yang belum dimainkan. Lanjutkan?')) {
        return;
      }
    }

    setIsGeneratingSchedule(true);
    try {
      leagueService.generateSchedule(league.id, role);
      showToast('success', 'Jadwal Digenerate', 'Jadwal pertandingan round-robin berhasil dibuat.');
      handleDataUpdated();
      setActiveTab('fixtures');
    } catch (err: any) {
      showToast('error', 'Gagal Generate Jadwal', err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setIsGeneratingSchedule(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Modals */}
      <LeagueScoreModal
        match={selectedMatchForScore}
        isOpen={isScoreModalOpen}
        onClose={() => {
          setIsScoreModalOpen(false);
          setSelectedMatchForScore(null);
        }}
        onScoreSubmitted={handleDataUpdated}
      />

      <AddLeagueTeamModal
        leagueId={league.id}
        isOpen={isAddTeamModalOpen}
        onClose={() => setIsAddTeamModalOpen(false)}
        onTeamAdded={handleDataUpdated}
      />

      {/* Top Bar Navigation & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="px-3 py-1.5 bg-nb-cardAlt border-3 border-black text-xs font-mono font-black uppercase text-nb-ink shadow-brutal-sm hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-brutal hover:bg-nb-yellow hover:text-black transition-all flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar Liga</span>
        </button>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <>
              <button
                onClick={() => setIsAddTeamModalOpen(true)}
                className="px-3.5 py-1.5 bg-nb-cardAlt border-3 border-black text-xs font-mono font-black uppercase text-nb-ink shadow-brutal-sm hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-brutal hover:bg-nb-yellow hover:text-black transition-all flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Tambah Tim</span>
              </button>

              <button
                onClick={handleGenerateSchedule}
                disabled={isGeneratingSchedule || league.teams.length < 2}
                className="px-3.5 py-1.5 bg-nb-yellow border-3 border-black text-xs font-mono font-black uppercase text-black shadow-brutal-sm hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-brutal disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1.5"
                title={league.teams.length < 2 ? 'Dibutuhkan minimal 2 tim' : 'Buat jadwal pertandingan round-robin'}
              >
                <Play className="w-3.5 h-3.5 fill-black" />
                <span>{league.matches.length > 0 ? 'Generate Ulang Jadwal' : 'Generate Jadwal'}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Hero Banner Liga */}
      <div className="bg-nb-card border-3 border-black shadow-brutal p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <LeagueStatusBadge status={league.status} />
              {league.game && (
                <span className="px-2.5 py-1 bg-nb-cardAlt border-2 border-black font-mono font-bold text-xs uppercase flex items-center gap-1">
                  <Gamepad2 className="w-3.5 h-3.5 text-nb-yellow" /> {league.game}
                </span>
              )}
              <span className="px-2.5 py-1 bg-nb-cardAlt border-2 border-black font-mono font-bold text-xs uppercase">
                {league.season}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-mono font-black text-nb-ink tracking-tight">
              {league.title}
            </h1>

            {league.description && (
              <p className="text-xs sm:text-sm text-nb-muted font-sans font-medium max-w-2xl">
                {league.description}
              </p>
            )}
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-nb-cardAlt border-3 border-black p-3 text-center min-w-[90px] shadow-brutal-sm">
              <span className="block font-mono text-2xl font-black text-nb-ink">{league.teams.length}</span>
              <span className="text-[10px] font-mono font-bold uppercase text-nb-muted">Total Tim</span>
            </div>
            <div className="bg-nb-cardAlt border-3 border-black p-3 text-center min-w-[90px] shadow-brutal-sm">
              <span className="block font-mono text-2xl font-black text-nb-ink">
                {league.matches.filter((m) => m.status === 'COMPLETED').length}/{league.matches.length}
              </span>
              <span className="text-[10px] font-mono font-bold uppercase text-nb-muted">Laga Selesai</span>
            </div>
            <div className="bg-nb-cardAlt border-3 border-black p-3 text-center min-w-[90px] shadow-brutal-sm">
              <span className="block font-mono text-2xl font-black text-nb-yellow">
                {league.pointsWin}/{league.pointsDraw}/{league.pointsLoss}
              </span>
              <span className="text-[10px] font-mono font-bold uppercase text-nb-muted">Poin W/D/L</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center border-b-3 border-black gap-2 font-mono text-xs overflow-x-auto">
        <button
          onClick={() => setActiveTab('standings')}
          className={`px-4 py-2.5 font-black uppercase flex items-center gap-2 border-t-3 border-x-3 border-black transition-all ${
            activeTab === 'standings'
              ? 'bg-nb-card text-nb-ink -mb-[3px] border-b-3 border-b-nb-card shadow-brutal-sm'
              : 'bg-nb-cardAlt text-nb-muted hover:text-nb-ink hover:bg-nb-card'
          }`}
        >
          <TableProperties className="w-4 h-4 text-nb-yellow" />
          <span>Tabel Klasemen</span>
        </button>

        <button
          onClick={() => setActiveTab('fixtures')}
          className={`px-4 py-2.5 font-black uppercase flex items-center gap-2 border-t-3 border-x-3 border-black transition-all ${
            activeTab === 'fixtures'
              ? 'bg-nb-card text-nb-ink -mb-[3px] border-b-3 border-b-nb-card shadow-brutal-sm'
              : 'bg-nb-cardAlt text-nb-muted hover:text-nb-ink hover:bg-nb-card'
          }`}
        >
          <Swords className="w-4 h-4 text-nb-red" />
          <span>Jadwal & Hasil Pekan</span>
          {league.matches.length > 0 && (
            <span className="px-1.5 py-0.2 bg-black text-white text-[10px] font-mono">
              {league.matches.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('teams')}
          className={`px-4 py-2.5 font-black uppercase flex items-center gap-2 border-t-3 border-x-3 border-black transition-all ${
            activeTab === 'teams'
              ? 'bg-nb-card text-nb-ink -mb-[3px] border-b-3 border-b-nb-card shadow-brutal-sm'
              : 'bg-nb-cardAlt text-nb-muted hover:text-nb-ink hover:bg-nb-card'
          }`}
        >
          <Users className="w-4 h-4 text-nb-green" />
          <span>Roster Tim</span>
          <span className="px-1.5 py-0.2 bg-black text-white text-[10px] font-mono">
            {league.teams.length}
          </span>
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'standings' && (
        <div className="space-y-4">
          <LeagueStandingsTable league={league} />
        </div>
      )}

      {activeTab === 'fixtures' && (
        <div className="space-y-4">
          <LeagueFixtures
            league={league}
            onSelectMatch={(match) => {
              setSelectedMatchForScore(match);
              setIsScoreModalOpen(true);
            }}
          />
        </div>
      )}

      {activeTab === 'teams' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-mono font-black uppercase text-base text-nb-ink">
                Peserta Liga ({league.teams.length} Tim)
              </h3>
              <p className="text-xs text-nb-muted font-sans font-medium">
                Daftar tim yang bertanding.
              </p>
            </div>
            {isAdmin && (
              <button
                onClick={() => setIsAddTeamModalOpen(true)}
                className="px-3.5 py-1.5 bg-nb-yellow border-3 border-black text-xs font-mono font-black uppercase text-black shadow-brutal-sm hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-brutal transition-all flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Tim Baru</span>
              </button>
            )}
          </div>

          {league.teams.length === 0 ? (
            <div className="bg-nb-card border-3 border-black shadow-brutal p-12 text-center max-w-md mx-auto">
              <Users className="w-12 h-12 mx-auto mb-3 text-nb-yellow" />
              <h4 className="font-mono font-black uppercase text-sm text-nb-ink">Belum Ada Tim Terdaftar</h4>
              <p className="text-xs text-nb-muted mt-1 font-sans">
                Daftarkan minimal 2 tim untuk mulai membuat jadwal pertandingan.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {league.teams.map((team, idx) => (
                <div
                  key={team.id}
                  className="bg-nb-card border-3 border-black p-4 shadow-brutal hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-brutal-lg transition-all"
                >
                  <div className="flex items-center gap-3">
                    {team.logoUrl ? (
                      <img
                        src={team.logoUrl}
                        alt={team.name}
                        className="w-12 h-12 object-cover border-2 border-black shadow-brutal-sm bg-nb-card shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-nb-cardAlt text-nb-ink border-2 border-black font-mono font-black text-sm flex items-center justify-center shadow-brutal-sm shrink-0">
                        {team.tag || team.name.slice(0, 3).toUpperCase()}
                      </div>
                    )}
                    <div className="overflow-hidden flex-1">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="font-mono font-black text-xs text-nb-muted uppercase">
                          #{idx + 1}
                        </span>
                        {team.tag && (
                          <span className="px-1.5 py-0.2 bg-nb-yellow text-black border border-black font-mono font-black text-[10px]">
                            [{team.tag}]
                          </span>
                        )}
                      </div>
                      <h4 className="font-mono font-black text-base text-nb-ink truncate">{team.name}</h4>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t-2 border-black/10 space-y-1 font-mono text-xs">
                    {team.captainName && (
                      <div className="text-nb-muted flex items-center justify-between">
                        <span>Kapten:</span>
                        <span className="font-bold text-nb-ink">{team.captainName}</span>
                      </div>
                    )}
                    {team.city && (
                      <div className="text-nb-muted flex items-center justify-between">
                        <span>Asal:</span>
                        <span className="font-bold text-nb-ink">{team.city}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
