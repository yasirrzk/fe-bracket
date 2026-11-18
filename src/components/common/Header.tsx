import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Trophy, LogOut, LogIn, ChevronDown, RefreshCw, Shield, ShieldCheck, Palette, TableProperties } from 'lucide-react';
import { UserRole } from '../../types/auth';

interface HeaderProps {
  activeView: 'tournaments' | 'leagues';
  onViewChange: (view: 'tournaments' | 'leagues') => void;
  onOpenCreateModal: () => void;
  onHomeClick: () => void;
  onRefresh: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  onViewChange,
  onOpenCreateModal,
  onHomeClick,
  onRefresh,
}) => {
  const { user, role, isAdmin, logout, switchRole, openAuthModal, simulateSessionRevocation } = useAuth();
  const [isMockMode, setIsMockMode] = useState(api.isMockMode());
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [theme, setTheme] = useState<'vintage-parchment' | 'vintage-dark'>(() => {
    return (localStorage.getItem('bracket_theme') as any) || 'vintage-parchment';
  });

  useEffect(() => {
    if (theme === 'vintage-dark') {
      document.documentElement.setAttribute('data-theme', 'vintage-dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [theme]);

  const toggleTheme = () => {
    const next = theme === 'vintage-parchment' ? 'vintage-dark' : 'vintage-parchment';
    setTheme(next);
    localStorage.setItem('bracket_theme', next);
    if (next === 'vintage-dark') {
      document.documentElement.setAttribute('data-theme', 'vintage-dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  };

  const toggleMockMode = () => {
    const next = !isMockMode;
    api.setMockMode(next);
    setIsMockMode(next);
    onRefresh();
  };

  return (
    <header className="sticky top-0 z-40 bg-nb-card border-b-3 border-black shadow-[0_3px_0_0_#181512]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 sm:gap-4">
        {/* Left: Logo & View Switcher */}
        <div className="flex items-center gap-3 sm:gap-5">
          <button onClick={onHomeClick} className="flex items-center gap-2.5 group text-left shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-nb-yellow border-3 border-black shadow-brutal-sm flex items-center justify-center group-hover:translate-x-[-1px] group-hover:translate-y-[-1px] group-hover:shadow-brutal transition-all">
              <Trophy className="w-5 h-5 text-black" />
            </div>
            <div className="hidden sm:block">
              <span className="font-mono font-black text-base sm:text-lg text-nb-ink tracking-tight block leading-tight">
                BRACKET<span className="bg-nb-yellow text-black px-1 mx-0.5 border-2 border-black">//</span>OPS
              </span>
              <span className="text-[9px] sm:text-[10px] font-mono font-bold text-nb-muted uppercase tracking-wider block">
                Esport Tournament Engine
              </span>
            </div>
          </button>

          {/* Primary Navigation Switcher (Turnamen vs Liga) */}
          <div className="flex items-center border-3 border-black bg-nb-bg p-0.5 shadow-brutal-sm font-mono text-xs">
            <button
              onClick={() => onViewChange('tournaments')}
              className={`px-2.5 sm:px-3 py-1 font-black uppercase transition-all flex items-center gap-1.5 ${
                activeView === 'tournaments'
                  ? 'bg-nb-yellow text-black border-2 border-black shadow-brutal-sm'
                  : 'text-nb-ink hover:bg-black/10'
              }`}
            >
              <Trophy className="w-3.5 h-3.5 shrink-0" />
              <span>Turnamen</span>
            </button>
            <button
              onClick={() => onViewChange('leagues')}
              className={`px-2.5 sm:px-3 py-1 font-black uppercase transition-all flex items-center gap-1.5 ${
                activeView === 'leagues'
                  ? 'bg-nb-yellow text-black border-2 border-black shadow-brutal-sm'
                  : 'text-nb-ink hover:bg-black/10'
              }`}
            >
              <TableProperties className="w-3.5 h-3.5 shrink-0" />
              <span>Liga & Klasemen</span>
            </button>
          </div>
        </div>

        {/* Center/Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Selector */}
          <button
            onClick={toggleTheme}
            className="px-2.5 py-1.5 bg-nb-cardAlt border-3 border-black text-nb-ink shadow-brutal-sm hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-brutal hover:bg-nb-yellow hover:text-black transition-all flex items-center gap-1.5 font-mono text-xs font-black uppercase"
            title="Ganti Tema Vintage (Kertas Tua vs Dark Sepia)"
          >
            <Palette className="w-3.5 h-3.5 text-nb-yellow" />
            <span className="hidden lg:inline">{theme === 'vintage-parchment' ? '📜 Vintage Paper' : '📻 Vintage Dark'}</span>
          </button>

          {/* Engine Mode */}
          <div className="hidden xl:flex items-center border-3 border-black bg-nb-bg p-0.5 shadow-brutal-sm">
            <button
              onClick={toggleMockMode}
              className={`px-2 py-1 font-mono text-[10px] font-black uppercase transition-all ${
                isMockMode
                  ? 'bg-nb-yellow text-black border-2 border-black shadow-brutal-sm'
                  : 'text-nb-ink hover:bg-black/10'
              }`}
            >
              Simulator
            </button>
            <button
              onClick={toggleMockMode}
              className={`px-2 py-1 font-mono text-[10px] font-black uppercase transition-all ${
                !isMockMode
                  ? 'bg-nb-green text-black border-2 border-black shadow-brutal-sm'
                  : 'text-nb-ink hover:bg-black/10'
              }`}
            >
              Live API
            </button>
          </div>

          <button
            onClick={onRefresh}
            className="p-2 bg-nb-cardAlt border-3 border-black text-nb-ink shadow-brutal-sm hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-brutal hover:bg-nb-cardHover transition-all"
            title="Refresh Data"
            aria-label="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {isAdmin && (
            <button
              onClick={onOpenCreateModal}
              className="neo-btn hidden md:flex text-xs py-2 px-3"
            >
              {activeView === 'tournaments' ? '+ Buat Turnamen' : '+ Buat Liga'}
            </button>
          )}

          {user ? (
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 bg-nb-cardAlt border-3 border-black px-2.5 py-1.5 shadow-brutal-sm hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-brutal transition-all"
              >
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-mono font-black text-nb-ink truncate max-w-[100px]">
                    {user.username}
                  </div>
                  <div className="text-[10px] font-mono font-bold flex items-center gap-1">
                    {isAdmin ? (
                      <span className="text-nb-red font-black flex items-center gap-0.5">
                        <ShieldCheck className="w-3 h-3" /> ADMIN
                      </span>
                    ) : (
                      <span className="text-nb-yellow font-bold flex items-center gap-0.5">
                        <Shield className="w-3 h-3 text-nb-ink" /> USER
                      </span>
                    )}
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-nb-ink" />
              </button>

              {isDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-56 bg-nb-card border-3 border-black shadow-brutal-lg z-50 font-mono text-xs animate-in fade-in zoom-in-95">
                    <div className="px-3 py-2 border-b-3 border-black bg-nb-cardAlt font-black text-[11px] uppercase tracking-wider text-nb-ink">
                      Ganti Role Akun
                    </div>
                    {(['ADMIN', 'USER'] as UserRole[]).map((r) => (
                      <button
                        key={r}
                        onClick={() => {
                          switchRole(r);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2.5 font-bold border-b-2 border-black last:border-b-0 flex items-center justify-between hover:bg-nb-yellow hover:text-black transition-colors ${
                          role === r ? 'bg-nb-yellow text-black font-black' : 'text-nb-ink bg-nb-card'
                        }`}
                      >
                        <span>{r === 'ADMIN' ? '★ ADMIN (Full Access)' : '👤 USER (Lihat Saja)'}</span>
                        {role === r && <span className="font-black text-xs">✓</span>}
                      </button>
                    ))}
                    <div className="border-t-3 border-black" />
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        simulateSessionRevocation();
                      }}
                      className="w-full text-left px-3 py-2 font-bold text-nb-red hover:bg-nb-red hover:text-white transition-colors flex items-center gap-1.5"
                    >
                      <span>⚡ Simulasi 401 Revocation</span>
                    </button>
                    <div className="border-t-3 border-black" />
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-3 py-2 font-bold text-nb-ink hover:bg-black hover:text-white transition-colors flex items-center gap-1.5"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button
              onClick={openAuthModal}
              className="neo-btn flex items-center gap-1.5 text-xs py-2 px-3.5"
            >
              <LogIn className="w-4 h-4" /> Masuk
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
