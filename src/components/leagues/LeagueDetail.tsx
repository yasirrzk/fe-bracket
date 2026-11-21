import React, { useState, useEffect } from 'react';
import { League, LeagueMatch } from '../../types/league';
import { leagueService } from '../../services/leagueService';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { LeagueStandingsTable } from './LeagueStandingsTable';
import { LeagueFixtures } from './LeagueFixtures';
import { LeagueScoreModal } from './LeagueScoreModal';
import { AddLeagueTeamModal } from './AddLeagueTeamModal';
import { ArrowLeft } from 'lucide-react';

interface LeagueDetailProps {
  leagueId: string;
  onBack: () => void;
  onRefreshParent?: () => void;
}

const LeagueStatusBadge: React.FC<{ status: League['status'] }> = ({ status }) => {
  switch (status) {
    case 'IN_PROGRESS':
      return (
        <span className="px-2 py-0.5 bg-zinc-950 text-white font-mono font-bold text-[10px] uppercase">
          SEDANG BERLANGSUNG
        </span>
      );
    case 'COMPLETED':
      return (
        <span className="px-2 py-0.5 bg-zinc-100 text-zinc-600 border border-zinc-200 font-mono font-semibold text-[10px] uppercase">
          SELESAI
        </span>
      );
    case 'REGISTRATION_OPEN':
    default:
      return (
        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-300 font-mono font-bold text-[10px] uppercase">
          PENDAFTARAN TERBUKA
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

  const [prevLeagueId, setPrevLeagueId] = useState(leagueId);
  const [league, setLeague] = useState<League | null>(() => {
    try {
      return leagueService.getLeagueById(leagueId);
    } catch {
      return null;
    }
  });

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

  useEffect(() => {
    if (!league) {
      showToast('error', 'Gagal Memuat Liga', 'Liga tidak ditemukan');
      onBack();
    }
  }, [league, showToast, onBack]);

  if (!league) {
    return (
      <div className="flex items-center justify-center p-16 font-mono text-xs text-zinc-500">
        Memuat data kompetisi liga...
      </div>
    );
  }

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

  const completedCount = league.matches.filter((m) => m.status === 'COMPLETED').length;

  return (
    <div className="space-y-5 font-sans animate-in fade-in duration-100">
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
              <button
                type="button"
                onClick={() => setIsAddTeamModalOpen(true)}
                className="px-3 py-1.5 border border-zinc-300 bg-white hover:bg-zinc-50 text-zinc-950 text-xs font-mono font-semibold transition-colors"
              >
                + Tambah Tim
              </button>

              <button
                type="button"
                onClick={handleGenerateSchedule}
                disabled={isGeneratingSchedule || league.teams.length < 2}
                className="px-3.5 py-1.5 bg-zinc-950 text-white hover:bg-zinc-800 border border-zinc-950 text-xs font-mono font-semibold transition-colors disabled:opacity-50"
                title={league.teams.length < 2 ? 'Dibutuhkan minimal 2 tim' : 'Buat jadwal pertandingan round-robin'}
              >
                {league.matches.length > 0 ? 'Generate Ulang Jadwal' : 'Generate Jadwal'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Hero Banner Liga */}
      <div className="bg-white border-[1.5px] border-zinc-400 p-5 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <LeagueStatusBadge status={league.status} />
              {league.game && (
                <span className="px-1.5 py-0.2 bg-zinc-100 text-zinc-700 font-mono text-[10px] uppercase border border-zinc-300">
                  {league.game}
                </span>
              )}
              <span className="px-1.5 py-0.2 bg-zinc-100 text-zinc-500 font-mono text-[10px] uppercase border border-zinc-300">
                {league.season}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-zinc-950 tracking-tight">
              {league.title}
            </h1>

            {league.description && (
              <p className="text-xs sm:text-sm text-zinc-500 font-normal max-w-2xl">
                {league.description}
              </p>
            )}
          </div>

          {/* Quick Metrics */}
          <div className="divide-x divide-zinc-300 border border-zinc-300 bg-zinc-50 inline-flex font-mono text-xs tabular-nums self-start md:self-auto shrink-0">
            <div className="px-3.5 py-2 text-center">
              <span className="block text-sm sm:text-base font-bold text-zinc-950">{league.teams.length}</span>
              <span className="text-[10px] uppercase text-zinc-500 font-semibold">Tim</span>
            </div>
            <div className="px-3.5 py-2 text-center">
              <span className="block text-sm sm:text-base font-bold text-zinc-950">
                {completedCount}/{league.matches.length}
              </span>
              <span className="text-[10px] uppercase text-zinc-500 font-semibold">Laga</span>
            </div>
            <div className="px-3.5 py-2 text-center">
              <span className="block text-sm sm:text-base font-bold text-zinc-950">
                {league.pointsWin}/{league.pointsDraw}/{league.pointsLoss}
              </span>
              <span className="text-[10px] uppercase text-zinc-500 font-semibold">W/D/L</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation (Swiss Grid Flat Underline) */}
      <div className="flex items-center border-b-2 border-zinc-300 gap-6 font-mono text-xs overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('standings')}
          className={`pb-2.5 uppercase font-semibold tracking-wider transition-colors -mb-[2px] ${
            activeTab === 'standings'
              ? 'border-b-2 border-zinc-950 text-zinc-950 font-bold'
              : 'text-zinc-500 hover:text-zinc-950 border-b-2 border-transparent'
          }`}
        >
          Klasemen
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('fixtures')}
          className={`pb-2.5 uppercase font-semibold tracking-wider transition-colors -mb-[2px] flex items-center gap-1.5 ${
            activeTab === 'fixtures'
              ? 'border-b-2 border-zinc-950 text-zinc-950 font-bold'
              : 'text-zinc-500 hover:text-zinc-950 border-b-2 border-transparent'
          }`}
        >
          <span>Jadwal & Hasil</span>
          {league.matches.length > 0 && (
            <span className="px-1.5 py-0.2 bg-zinc-100 text-zinc-600 text-[10px] tabular-nums border border-zinc-300">
              {league.matches.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('teams')}
          className={`pb-2.5 uppercase font-semibold tracking-wider transition-colors -mb-[2px] flex items-center gap-1.5 ${
            activeTab === 'teams'
              ? 'border-b-2 border-zinc-950 text-zinc-950 font-bold'
              : 'text-zinc-500 hover:text-zinc-950 border-b-2 border-transparent'
          }`}
        >
          <span>Roster Tim</span>
          <span className="px-1.5 py-0.2 bg-zinc-100 text-zinc-600 text-[10px] tabular-nums border border-zinc-300">
            {league.teams.length}
          </span>
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'standings' && (
        <div>
          <LeagueStandingsTable league={league} />
        </div>
      )}

      {activeTab === 'fixtures' && (
        <div>
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
              <h3 className="font-mono font-bold uppercase text-xs text-zinc-950">
                Peserta Liga ({league.teams.length} Tim)
              </h3>
              <p className="text-xs text-zinc-500 font-normal">
                Daftar tim terdaftar dalam kompetisi.
              </p>
            </div>
            {isAdmin && (
              <button
                type="button"
                onClick={() => setIsAddTeamModalOpen(true)}
                className="px-3 py-1.5 bg-zinc-950 text-white hover:bg-zinc-800 border border-zinc-950 text-xs font-mono font-semibold uppercase tracking-wider transition-colors"
              >
                + Tambah Tim
              </button>
            )}
          </div>

          {league.teams.length === 0 ? (
            <div className="bg-white border-[1.5px] border-zinc-400 p-8 text-center max-w-md mx-auto font-mono">
              <div className="font-bold uppercase text-xs sm:text-sm text-zinc-950">Belum Ada Tim Terdaftar</div>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1 font-sans">
                Daftarkan minimal 2 tim untuk mulai membuat jadwal pertandingan.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {league.teams.map((team, idx) => (
                <div
                  key={team.id}
                  className="bg-white border-[1.5px] border-zinc-400 p-3.5 hover:border-zinc-600 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {team.logoUrl ? (
                      <img
                        src={team.logoUrl}
                        alt={team.name}
                        className="w-8 h-8 object-cover border border-zinc-300 shrink-0 bg-zinc-50"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-zinc-100 text-zinc-950 border border-zinc-300 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                        {team.tag || team.name.slice(0, 3).toUpperCase()}
                      </div>
                    )}
                    <div className="overflow-hidden flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="font-mono font-semibold text-[10px] text-zinc-400 tabular-nums">
                          #{idx + 1}
                        </span>
                        {team.tag && (
                          <span className="px-1.5 py-0.2 bg-zinc-100 text-zinc-700 border border-zinc-300 font-mono font-bold text-[10px]">
                            {team.tag}
                          </span>
                        )}
                      </div>
                      <h4 className="font-sans font-bold text-sm sm:text-base text-zinc-950 truncate">{team.name}</h4>
                    </div>
                  </div>
                  {(team.captainName || team.city) && (
                    <div className="mt-2.5 pt-2 border-t border-zinc-200 space-y-0.5 font-mono text-[11px] text-zinc-500">
                      {team.captainName && (
                        <div className="flex items-center justify-between">
                          <span>Kapten:</span>
                          <span className="font-semibold text-zinc-950">{team.captainName}</span>
                        </div>
                      )}
                      {team.city && (
                        <div className="flex items-center justify-between">
                          <span>Asal:</span>
                          <span className="font-semibold text-zinc-950">{team.city}</span>
                        </div>
                      )}
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
