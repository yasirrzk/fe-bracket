import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types/auth';
import { X } from 'lucide-react';
import { INITIAL_USERS } from '../../services/mockData';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, login, register, switchRole } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('USER');
  const [isLoading, setIsLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (mode === 'login') {
        await login({ email, password });
      } else {
        await register({ email, username, password, role });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 font-sans backdrop-blur-[1px]">
      <div className="bg-white text-zinc-950 border-2 border-zinc-900 max-w-md w-full p-5 sm:p-6 relative animate-in fade-in zoom-in-95">
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-1 text-zinc-400 hover:text-zinc-950 transition-colors"
          aria-label="Tutup"
        >
          <X className="w-4 h-4 stroke-[1.75]" />
        </button>

        {/* Flat Underline Tab Headers */}
        <div className="flex border-b border-zinc-300 mb-5 gap-4 font-mono text-xs">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`pb-2 font-semibold uppercase tracking-wider transition-colors -mb-[1px] ${
              mode === 'login'
                ? 'border-b-2 border-zinc-950 text-zinc-950 font-bold'
                : 'text-zinc-500 hover:text-zinc-950 border-b-2 border-transparent'
            }`}
          >
            Masuk / Login
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`pb-2 font-semibold uppercase tracking-wider transition-colors -mb-[1px] ${
              mode === 'register'
                ? 'border-b-2 border-zinc-950 text-zinc-950 font-bold'
                : 'text-zinc-500 hover:text-zinc-950 border-b-2 border-transparent'
            }`}
          >
            Daftar Akun Baru
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <div>
              <label htmlFor="auth-username" className="block text-[11px] font-mono font-semibold uppercase mb-1 text-zinc-600">
                Username
              </label>
              <input
                id="auth-username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="contoh: esport_pro"
                className="w-full px-3 py-2 text-xs font-mono bg-white border border-zinc-300 focus:border-zinc-950 text-zinc-950 outline-hidden transition-colors"
              />
            </div>
          )}

          <div>
            <label htmlFor="auth-email" className="block text-[11px] font-mono font-semibold uppercase mb-1 text-zinc-600">
              Email Address
            </label>
            <input
              id="auth-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@bracketops.gg"
              className="w-full px-3 py-2 text-xs font-mono bg-white border border-zinc-300 focus:border-zinc-950 text-zinc-950 outline-hidden transition-colors"
            />
          </div>

          <div>
            <label htmlFor="auth-password" className="block text-[11px] font-mono font-semibold uppercase mb-1 text-zinc-600">
              Password
            </label>
            <input
              id="auth-password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 text-xs font-mono bg-white border border-zinc-300 focus:border-zinc-950 text-zinc-950 outline-hidden transition-colors"
            />
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-[11px] font-mono font-semibold uppercase mb-1 text-zinc-600">
                Pilih Role User
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['USER', 'ADMIN'] as UserRole[]).map((r) => (
                  <button
                    type="button"
                    key={r}
                    onClick={() => setRole(r)}
                    className={`p-2.5 border font-mono text-xs uppercase transition-colors text-center ${
                      role === r
                        ? 'border-zinc-950 bg-zinc-100 font-bold text-zinc-950'
                        : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50'
                    }`}
                  >
                    <div>{r}</div>
                    <div className="text-[10px] normal-case text-zinc-500 mt-0.5">
                      {r === 'ADMIN' ? 'buat liga & kelola jadwal' : 'lihat list & klasemen'}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-2.5 bg-zinc-950 text-white hover:bg-zinc-800 border border-zinc-950 font-mono text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Memproses...' : mode === 'login' ? 'Masuk ke Engine' : 'Buat Akun'}
          </button>
        </form>

        {/* Quick Testing Switcher */}
        <div className="mt-5 pt-3.5 border-t border-zinc-200 font-mono text-xs">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-2">
            Akun Uji Coba Cepat:
          </div>
          <div className="grid grid-cols-2 gap-2">
            {INITIAL_USERS.slice(0, 2).map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => {
                  switchRole(u.role);
                  closeAuthModal();
                }}
                className="p-2 border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-left transition-colors"
              >
                <div className="text-[11px] font-bold text-zinc-950">
                  {u.role === 'ADMIN' ? 'ADMIN' : 'USER'}
                </div>
                <div className="text-zinc-500 text-[10px] truncate">{u.username}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
