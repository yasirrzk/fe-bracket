import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types/auth';
import { X, Lock, Mail, User, Shield } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-nb-card text-nb-ink border-3 border-black shadow-brutal-xl max-w-md w-full p-6 relative animate-in fade-in zoom-in-95 font-sans">
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-1 hover:bg-black hover:text-white transition-colors"
          aria-label="Tutup"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Tab Headers */}
        <div className="flex border-b-3 border-black mb-6 gap-2">
          <button
            onClick={() => setMode('login')}
            className={`px-5 py-2.5 font-mono text-xs font-black uppercase -mb-[3px] border-3 border-black transition-all ${
              mode === 'login'
                ? 'bg-nb-yellow text-black shadow-brutal border-b-nb-yellow'
                : 'bg-nb-cardAlt text-nb-ink hover:bg-nb-cardHover'
            }`}
          >
            Masuk // Login
          </button>
          <button
            onClick={() => setMode('register')}
            className={`px-5 py-2.5 font-mono text-xs font-black uppercase -mb-[3px] border-3 border-black transition-all ${
              mode === 'register'
                ? 'bg-nb-yellow text-black shadow-brutal border-b-nb-yellow'
                : 'bg-nb-cardAlt text-nb-ink hover:bg-nb-cardHover'
            }`}
          >
            Daftar Akun Baru
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-mono font-black uppercase mb-1 text-nb-ink">Username</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-3 text-nb-muted" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. esport_fan"
                  className="neo-input pl-10"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-mono font-black uppercase mb-1 text-nb-ink">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-nb-muted" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@bracketops.gg"
                className="neo-input pl-10"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-black uppercase mb-1 text-nb-ink">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-nb-muted" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="neo-input pl-10"
              />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-mono font-black uppercase mb-1 flex items-center gap-1.5 text-nb-ink">
                <Shield className="w-3.5 h-3.5 text-nb-yellow" />
                Pilih Role User
              </label>
              <div className="grid grid-cols-2 gap-3">
                {(['USER', 'ADMIN'] as UserRole[]).map((r) => (
                  <button
                    type="button"
                    key={r}
                    onClick={() => setRole(r)}
                    className={`p-3 border-3 border-black font-mono text-xs font-black uppercase transition-all text-center ${
                      role === r
                        ? 'bg-nb-yellow text-black shadow-brutal translate-x-[-1px] translate-y-[-1px]'
                        : 'bg-nb-cardAlt text-nb-ink hover:bg-nb-cardHover shadow-brutal-sm'
                    }`}
                  >
                    <div>{r === 'ADMIN' ? '★ ADMIN' : '👤 USER BIASA'}</div>
                    <div className={`text-[10px] font-medium lowercase mt-0.5 ${role === r ? 'text-black/80' : 'text-nb-muted'}`}>
                      {r === 'ADMIN' ? 'buat turnamen & isi peserta' : 'lihat list & bracket'}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="neo-btn w-full mt-4 py-3 text-xs"
          >
            {isLoading ? 'MEMPROSES...' : mode === 'login' ? 'MASUK KE ENGINE' : 'BUAT AKUN BARU'}
          </button>
        </form>

        {/* Quick Testing Switcher */}
        <div className="mt-6 pt-4 border-t-3 border-black">
          <div className="text-[11px] font-mono font-black uppercase text-nb-muted mb-2">
            ⚡ Quick-Switch Akun Uji Coba:
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {INITIAL_USERS.slice(0, 2).map((u) => (
              <button
                key={u.id}
                onClick={() => {
                  switchRole(u.role);
                  closeAuthModal();
                }}
                className="p-2.5 bg-nb-cardAlt border-2 border-black text-left font-mono hover:bg-nb-yellow hover:text-black transition-all shadow-brutal-sm active:translate-y-0.5 text-nb-ink"
              >
                <div className={`text-xs font-black ${u.role === 'ADMIN' ? 'text-nb-red' : 'text-nb-yellow'}`}>
                  {u.role === 'ADMIN' ? '★ ADMIN' : '👤 USER BIASA'}
                </div>
                <div className="text-nb-muted text-[11px] truncate font-bold">{u.username}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
