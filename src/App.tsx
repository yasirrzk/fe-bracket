import React, { useState, useCallback } from 'react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider, useNotification } from './context/NotificationContext';
import { Header } from './components/common/Header';
import { ToastContainer } from './components/common/ToastContainer';
import { SessionExpiredModal } from './components/common/SessionExpiredModal';
import { RateLimitIndicator } from './components/common/RateLimitIndicator';
import { TelemetryDrawer } from './components/telemetry/TelemetryDrawer';
import { AuthModal } from './components/auth/AuthModal';
import { TournamentList } from './components/tournaments/TournamentList';
import { TournamentDetail } from './components/tournaments/TournamentDetail';
import { CreateTournamentModal } from './components/tournaments/CreateTournamentModal';
import { LeagueList } from './components/leagues/LeagueList';
import { LeagueDetail } from './components/leagues/LeagueDetail';
import { CreateLeagueModal } from './components/leagues/CreateLeagueModal';
import { api, simulatedEngine } from './services/api';
import { leagueService } from './services/leagueService';
import { Tournament } from './types/tournament';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const MainAppContent: React.FC = () => {
  const [activeView, setActiveView] = useState<'tournaments' | 'leagues'>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('view') === 'leagues' ? 'leagues' : 'tournaments';
  });

  const [selectedTournamentId, setSelectedTournamentId] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('tournament') || null;
  });

  const [selectedLeagueId, setSelectedLeagueId] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('league') || null;
  });

  const [isCreateTournamentModalOpen, setIsCreateTournamentModalOpen] = useState(false);
  const [isCreateLeagueModalOpen, setIsCreateLeagueModalOpen] = useState(false);
  const [leagueRefreshKey, setLeagueRefreshKey] = useState(0);

  const { showToast } = useNotification();
  const { isAdmin } = useAuth();

  const updateUrl = (view: 'tournaments' | 'leagues', tId: string | null, lId: string | null) => {
    const params = new URLSearchParams();
    if (view === 'leagues') {
      params.set('view', 'leagues');
      if (lId) params.set('league', lId);
    } else {
      params.set('view', 'tournaments');
      if (tId) params.set('tournament', tId);
    }
    const queryStr = params.toString();
    const url = queryStr ? `?${queryStr}` : window.location.pathname;
    window.history.replaceState(null, '', url);
  };

  const handleViewChange = (view: 'tournaments' | 'leagues') => {
    setActiveView(view);
    updateUrl(view, selectedTournamentId, selectedLeagueId);
  };

  const handleSelectTournament = (id: string | null) => {
    setSelectedTournamentId(id);
    updateUrl('tournaments', id, selectedLeagueId);
  };

  const handleSelectLeague = (id: string | null) => {
    setSelectedLeagueId(id);
    updateUrl('leagues', selectedTournamentId, id);
  };

  // Query tournaments list
  const {
    data: tournaments = [],
    isLoading: isLoadingTournaments,
    refetch: refetchTournaments,
  } = useQuery<Tournament[]>({
    queryKey: ['tournaments'],
    queryFn: () => api.getTournaments(),
  });

  // Query selected tournament detail
  const {
    data: selectedTournament,
    refetch: refetchTournamentDetail,
  } = useQuery<Tournament | null>({
    queryKey: ['tournament', selectedTournamentId],
    queryFn: () => (selectedTournamentId ? api.getTournamentById(selectedTournamentId) : null),
    enabled: !!selectedTournamentId,
  });

  const handleRefresh = useCallback(() => {
    refetchTournaments();
    if (selectedTournamentId) {
      refetchTournamentDetail();
    }
    setLeagueRefreshKey((k) => k + 1);
  }, [refetchTournaments, selectedTournamentId, refetchTournamentDetail]);

  const handleResetSimulatedDB = () => {
    simulatedEngine.reset();
    leagueService.reset();
    handleRefresh();
    showToast('info', 'Database Dikosongkan', 'Seluruh data simulasi turnamen dan liga berhasil dikembalikan ke status awal.');
  };

  return (
    <div className="min-h-screen bg-[#F4F4F5] text-zinc-950 flex flex-col relative pb-24 font-sans">
      {/* Global Notifications & Modals */}
      <ToastContainer />
      <SessionExpiredModal />
      <RateLimitIndicator />
      <AuthModal />

      {/* Create Modals */}
      <CreateTournamentModal
        isOpen={isCreateTournamentModalOpen}
        onClose={() => setIsCreateTournamentModalOpen(false)}
        onSuccess={(newId) => {
          handleRefresh();
          handleSelectTournament(newId);
        }}
      />

      <CreateLeagueModal
        isOpen={isCreateLeagueModalOpen}
        onClose={() => setIsCreateLeagueModalOpen(false)}
        onSuccess={(newId) => {
          handleRefresh();
          handleSelectLeague(newId);
        }}
      />

      {/* Main Top Header with Mode Switcher */}
      <Header
        activeView={activeView}
        onViewChange={handleViewChange}
        onOpenCreateModal={() => {
          if (activeView === 'tournaments') {
            setIsCreateTournamentModalOpen(true);
          } else {
            setIsCreateLeagueModalOpen(true);
          }
        }}
        onHomeClick={() => {
          if (activeView === 'tournaments') {
            handleSelectTournament(null);
          } else {
            handleSelectLeague(null);
          }
        }}
        onRefresh={handleRefresh}
      />

      {/* Main Layout Container (Swiss Grid max-w-7xl) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-6">
        {/* System Diagnostic Ticker Bar (Swiss Grid Minimalist) */}
        <div className="mb-6 px-4 py-2.5 bg-white border-[1.5px] border-zinc-400 flex flex-wrap items-center justify-between gap-2.5 text-xs font-mono">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-zinc-600">
            <span className="font-semibold text-zinc-950 uppercase tracking-widest text-[10px] bg-zinc-100 border border-zinc-300 px-1.5 py-0.5">
              SYSTEM
            </span>
            <span>
              MODE:{' '}
              <strong className="text-zinc-950 font-bold">
                {activeView === 'tournaments' ? 'TURNAMEN KNOCKOUT' : 'LIGA ROUND-ROBIN'}
              </strong>
            </span>
            <span className="text-zinc-300 hidden sm:inline">/</span>
            <span>
              ROLE:{' '}
              {isAdmin ? (
                <strong className="text-rose-600 font-bold">ADMIN</strong>
              ) : (
                <strong className="text-zinc-950 font-medium">USER</strong>
              )}
            </span>
            <span className="text-zinc-300 hidden sm:inline">/</span>
            <span>
              ENGINE:{' '}
              <strong className="text-zinc-950 font-semibold">
                {api.isMockMode() ? 'SIMULATOR' : 'LIVE API'}
              </strong>
            </span>
          </div>

          <div>
            <button
              onClick={handleResetSimulatedDB}
              className="px-2.5 py-1 bg-white hover:bg-zinc-50 border border-zinc-300 text-zinc-700 hover:text-zinc-950 font-mono text-[11px] font-semibold transition-colors"
              title="Reset data tanding simulated engine & liga"
            >
              Reset Data Demo
            </button>
          </div>
        </div>

        {/* Dynamic View Content */}
        {activeView === 'tournaments' ? (
          selectedTournamentId && selectedTournament ? (
            <TournamentDetail
              key={`${selectedTournamentId}`}
              tournament={selectedTournament}
              onBack={() => {
                handleSelectTournament(null);
                refetchTournaments();
              }}
              onRefresh={handleRefresh}
            />
          ) : (
            <TournamentList
              tournaments={tournaments}
              isLoading={isLoadingTournaments}
              onSelectTournament={(id) => handleSelectTournament(id)}
              onOpenCreateModal={() => setIsCreateTournamentModalOpen(true)}
            />
          )
        ) : selectedLeagueId ? (
          <LeagueDetail
            key={`${selectedLeagueId}-${leagueRefreshKey}`}
            leagueId={selectedLeagueId}
            onBack={() => {
              handleSelectLeague(null);
              handleRefresh();
            }}
            onRefreshParent={handleRefresh}
          />
        ) : (
          <LeagueList
            key={leagueRefreshKey}
            onSelectLeague={(id) => handleSelectLeague(id)}
            onOpenCreateModal={() => setIsCreateLeagueModalOpen(true)}
          />
        )}
      </main>

      {/* Bottom Telemetry Drawer */}
      <TelemetryDrawer />
    </div>
  );
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <NotificationProvider>
        <AuthProvider>
          <MainAppContent />
        </AuthProvider>
      </NotificationProvider>
    </QueryClientProvider>
  );
}
