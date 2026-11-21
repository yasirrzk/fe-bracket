import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";
import { ChevronDown, RefreshCw } from "lucide-react";
import { UserRole } from "../../types/auth";
import logo from "../../../assets/logo1.png";

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
  const {
    user,
    role,
    isAdmin,
    logout,
    switchRole,
    openAuthModal,
    simulateSessionRevocation,
  } = useAuth();
  const [isMockMode, setIsMockMode] = useState(api.isMockMode());
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleMockMode = () => {
    const next = !isMockMode;
    api.setMockMode(next);
    setIsMockMode(next);
    onRefresh();
  };

  return (
    <header className="h-16 bg-white border-b-2 border-zinc-900 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-full flex items-center justify-between gap-3">
        {/* Left: Sharp Logo & Brand */}
        <div className="flex items-center gap-3 sm:gap-6">
          <button
            onClick={onHomeClick}
            className="flex items-center gap-2.5 text-left shrink-0 group focus:outline-hidden"
          >
            <div className="w-9 h-9 border border-zinc-900 overflow-hidden shrink-0 bg-white flex items-center justify-center">
              <img
                src={logo}
                alt="Logo Liga Adik Adik"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="font-sans font-bold text-sm sm:text-base text-zinc-950 tracking-tight leading-none hidden md:inline">
              LIGA ADIK ADIK
            </span>
          </button>

          {/* Mode Switcher: Knockout vs Liga */}
          <div className="inline-flex items-center border border-zinc-300 bg-zinc-100 p-0.5 font-mono text-[11px] sm:text-xs">
            <button
              type="button"
              onClick={() => onViewChange('tournaments')}
              className={`px-2.5 sm:px-3 py-1 font-semibold transition-colors ${
                activeView === 'tournaments'
                  ? 'bg-zinc-950 text-white font-bold'
                  : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              <span className="hidden sm:inline">Turnamen Knockout</span>
              <span className="sm:hidden">Knockout</span>
            </button>
            <button
              type="button"
              onClick={() => onViewChange('leagues')}
              className={`px-2.5 sm:px-3 py-1 font-semibold transition-colors ${
                activeView === 'leagues'
                  ? 'bg-zinc-950 text-white font-bold'
                  : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              <span className="hidden sm:inline">Liga Round-Robin</span>
              <span className="sm:hidden">Liga</span>
            </button>
          </div>
        </div>

        {/* Right: Controls & Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Engine Mode Toggle (Hairline Segmented Control) */}
          <div className="hidden lg:inline-flex items-center border border-zinc-300 bg-zinc-100 p-0.5 font-mono text-[11px]">
            <button
              onClick={() => {
                if (!isMockMode) toggleMockMode();
              }}
              className={`px-2 py-0.5 transition-colors ${
                isMockMode
                  ? "bg-white text-zinc-950 font-bold border border-zinc-300"
                  : "text-zinc-500 hover:text-zinc-950"
              }`}
            >
              Simulator
            </button>
            <button
              onClick={() => {
                if (isMockMode) toggleMockMode();
              }}
              className={`px-2 py-0.5 transition-colors ${
                !isMockMode
                  ? "bg-white text-zinc-950 font-bold border border-zinc-300"
                  : "text-zinc-500 hover:text-zinc-950"
              }`}
            >
              Live API
            </button>
          </div>

          {/* Refresh Action */}
          <button
            onClick={onRefresh}
            className="p-1.5 bg-white hover:bg-zinc-100 border border-zinc-300 text-zinc-600 hover:text-zinc-950 transition-colors"
            title="Refresh Data"
            aria-label="Refresh Data"
          >
            <RefreshCw className="w-3.5 h-3.5 stroke-[1.75]" />
          </button>

          {/* Create Button (Admin Only) */}
          {isAdmin && (
            <button
              onClick={onOpenCreateModal}
              className="bg-zinc-950 text-white hover:bg-zinc-800 border border-zinc-950 font-mono text-xs font-semibold px-2.5 sm:px-3 py-1.5 transition-colors shrink-0"
            >
              <span className="hidden sm:inline">
                {activeView === 'tournaments' ? '+ Buat Turnamen' : '+ Buat Liga'}
              </span>
              <span className="sm:hidden">
                {activeView === 'tournaments' ? '+ Turnamen' : '+ Liga'}
              </span>
            </button>
          )}

          {/* User Auth & Role Control */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 bg-white hover:bg-zinc-50 border border-zinc-300 px-2 sm:px-2.5 py-1 text-left transition-colors"
              >
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-mono font-semibold text-zinc-950 truncate max-w-[90px]">
                    {user.username}
                  </div>
                  <div className="text-[10px] font-mono leading-none">
                    {isAdmin ? (
                      <span className="text-rose-600 font-bold">ADMIN</span>
                    ) : (
                      <span className="text-zinc-500 font-medium">USER</span>
                    )}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-500 stroke-[1.75]" />
              </button>

              {isDropdownOpen && (
                <>
                  <button
                    type="button"
                    aria-label="Tutup menu dropdown"
                    className="fixed inset-0 z-40 bg-transparent border-0 cursor-default"
                    onClick={() => setIsDropdownOpen(false)}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        setIsDropdownOpen(false);
                      }
                    }}
                  />
                  <div className="absolute right-0 mt-1 w-52 bg-white border-2 border-zinc-900 z-50 font-mono text-xs divide-y divide-zinc-200">
                    <div className="px-3 py-1.5 bg-zinc-50 font-semibold text-[10px] uppercase tracking-wider text-zinc-500">
                      Ganti Role Akun
                    </div>
                    {(["ADMIN", "USER"] as UserRole[]).map((r) => (
                      <button
                        key={r}
                        onClick={() => {
                          switchRole(r);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 flex items-center justify-between transition-colors ${
                          role === r
                            ? "bg-zinc-100 text-zinc-950 font-bold"
                            : "text-zinc-600 hover:bg-zinc-50"
                        }`}
                      >
                        <span>
                          {r} {r === "ADMIN" ? "(Full Access)" : "(Read Only)"}
                        </span>
                        {role === r && (
                          <span className="font-bold text-xs text-zinc-950">✓</span>
                        )}
                      </button>
                    ))}
                    <div>
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          simulateSessionRevocation();
                        }}
                        className="w-full text-left px-3 py-2 text-rose-600 hover:bg-rose-50 transition-colors text-[11px]"
                      >
                        Simulasi 401 Revocation
                      </button>
                    </div>
                    <div>
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          logout();
                        }}
                        className="w-full text-left px-3 py-2 text-zinc-700 hover:bg-zinc-100 transition-colors text-[11px]"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button
              onClick={openAuthModal}
              className="bg-zinc-950 text-white hover:bg-zinc-800 border border-zinc-950 font-mono text-xs font-semibold px-3 py-1.5 transition-colors"
            >
              Masuk
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
