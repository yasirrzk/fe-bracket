import React, { useState, useCallback } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider, useNotification } from './context/NotificationContext';
import { Header } from './components/common/Header';
import { ToastContainer } from './components/common/ToastContainer';
import { SessionExpiredModal } from './components/common/SessionExpiredModal';
import { RateLimitIndicator } from './components/common/RateLimitIndicator';
import { TelemetryDrawer } from './components/telemetry/TelemetryDrawer';
import { AuthModal } from './components/auth/AuthModal';
import { LeagueList } from './components/leagues/LeagueList';
import { LeagueDetail } from './components/leagues/LeagueDetail';
import { CreateLeagueModal } from './components/leagues/CreateLeagueModal';
import { api } from './services/api';
import { leagueService } from './services/leagueService';
import { RotateCcw, ShieldCheck, Eye, TableProperties } from 'lucide-react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const LeagueAppContent: React.FC = () => {
  const [selectedLeagueId, setSelectedLeagueId] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('league') || null;
  });

  const [isCreateLeagueModalOpen, setIsCreateLeagueModalOpen] = useState(false);
  const [leagueRefreshKey, setLeagueRefreshKey] = useState(0);

  const { showToast } = useNotification();
  const { isAdmin } = useAuth();

  const updateUrl = (lId: string | null) => {
    const params = new URLSearchParams();
    if (lId) params.set('league', lId);
    const queryStr = params.toString();
    const url = queryStr ? `?${queryStr}` : window.location.pathname;
    window.history.replaceState(null, '', url);
  };

  const handleSelectLeague = (id: string | null) => {
    setSelectedLeagueId(id);
    updateUrl(id);
  };

  const handleRefresh = useCallback(() => {
    setLeagueRefreshKey((k) => k + 1);
  }, []);

  const handleResetSimulatedDB = () => {
    leagueService.reset();
    handleRefresh();
    showToast('info', 'Database Dikosongkan', 'Seluruh data liga berhasil dikosongkan.');
  };

  return (
    <div className="min-h-screen bg-nb-bg text-nb-ink flex flex-col relative pb-32">
      {/* Global Notifications & Modals */}
      <ToastContainer />
      <SessionExpiredModal />
      <RateLimitIndicator />
      <AuthModal />

      <CreateLeagueModal
        isOpen={isCreateLeagueModalOpen}
        onClose={() => setIsCreateLeagueModalOpen(false)}
        onSuccess={(newId) => {
          handleRefresh();
          handleSelectLeague(newId);
        }}
      />

      {/* Main Top Header */}
      <Header
        onOpenCreateModal={() => setIsCreateLeagueModalOpen(true)}
        onHomeClick={() => handleSelectLeague(null)}
        onRefresh={handleRefresh}
      />

      {/* Main Layout Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Operasional Banner (Vintage Neobrutalism Edition) */}
        <div className="mb-8 p-4 bg-nb-card border-3 border-black shadow-brutal flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-black text-black uppercase tracking-wider text-[11px] bg-nb-yellow px-2.5 py-0.5 border-2 border-black">
              STATUS SISTEM
            </span>
            <div className="flex items-center gap-2 font-bold">
              <span className="text-nb-muted">Mode Aktif:</span>
              <span className="px-2 py-0.5 bg-nb-yellow text-black border-2 border-black font-black flex items-center gap-1 shadow-brutal-sm">
                <TableProperties className="w-3.5 h-3.5" /> Liga Round-Robin & Klasemen
              </span>
            </div>
            <span className="text-nb-muted/40 hidden sm:inline">|</span>
            <div className="flex items-center gap-2 font-bold">
              <span className="text-nb-muted">Role:</span>
              {isAdmin ? (
                <span className="px-2 py-0.5 bg-nb-red text-white border-2 border-black font-black flex items-center gap-1 shadow-brutal-sm">
                  <ShieldCheck className="w-3.5 h-3.5" /> ADMIN 
                </span>
              ) : (
                <span className="px-2 py-0.5 bg-nb-cardAlt text-nb-ink border-2 border-black font-black flex items-center gap-1 shadow-brutal-sm">
                  <Eye className="w-3.5 h-3.5 text-nb-yellow" /> USER 
                </span>
              )}
            </div>
            <span className="text-nb-muted/40 hidden sm:inline">|</span>
            <div className="flex items-center gap-1.5 font-bold">
              <span className="text-nb-muted">Engine:</span>
              <span className={`px-2 py-0.5 border-2 border-black font-black ${api.isMockMode() ? 'bg-nb-yellow text-black' : 'bg-nb-green text-black'}`}>
                {api.isMockMode() ? 'Demo Simulator' : 'Live Vercel Backend'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleResetSimulatedDB}
              className="neo-btn-secondary text-[11px] py-1.5 px-3 flex items-center gap-1.5 font-bold"
              title="Kosongkan seluruh data liga"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Kosongkan Data</span>
            </button>
          </div>
        </div>

        {/* Dynamic View Content */}
        {selectedLeagueId ? (
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
          <LeagueAppContent />
        </AuthProvider>
      </NotificationProvider>
    </QueryClientProvider>
  );
}
