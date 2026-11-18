/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, LoginDto, RegisterDto } from '../types/auth';
import { api } from '../services/api';
import { INITIAL_USERS } from '../services/mockData';
import { useNotification } from './NotificationContext';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isAdmin: boolean;
  isAuthenticated: boolean;
  login: (dto: LoginDto) => Promise<void>;
  register: (dto: RegisterDto) => Promise<void>;
  logout: () => Promise<void>;
  switchRole: (role: UserRole) => void;
  simulateSessionRevocation: () => void;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'bracket_ops_user';
const TOKEN_STORAGE_KEY = 'bracket_ops_token';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { showToast, openSessionExpiredModal } = useNotification();
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(USER_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_USERS[0]; // Default to Admin for testing
      }
    }
    return INITIAL_USERS[0];
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  }, [user]);

  const login = async (dto: LoginDto) => {
    try {
      const resp = await api.login(dto);
      setUser(resp.user);
      localStorage.setItem(TOKEN_STORAGE_KEY, resp.accessToken);
      showToast('success', 'Login Berhasil', `Selamat datang, ${resp.user.username} [${resp.user.role}]`);
      setIsAuthModalOpen(false);
    } catch (err: any) {
      showToast('error', 'Login Gagal', err.response?.data?.message || err.message || 'Kredensial tidak valid');
      throw err;
    }
  };

  const register = async (dto: RegisterDto) => {
    try {
      const resp = await api.register(dto);
      setUser(resp.user);
      localStorage.setItem(TOKEN_STORAGE_KEY, resp.accessToken);
      showToast('success', 'Registrasi Berhasil', `Akun ${resp.user.username} [${resp.user.role}] berhasil dibuat!`);
      setIsAuthModalOpen(false);
    } catch (err: any) {
      showToast('error', 'Registrasi Gagal', err.response?.data?.message || err.message || 'Gagal mendaftar');
      throw err;
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      // Ignore errors on logout
    } finally {
      setUser(null);
      localStorage.removeItem(USER_STORAGE_KEY);
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      showToast('info', 'Logged Out', 'Sesi Anda telah berakhir.');
    }
  };

  const switchRole = (newRole: UserRole) => {
    const matchingPreseed = INITIAL_USERS.find((u) => u.role === newRole);
    if (matchingPreseed) {
      setUser(matchingPreseed);
      showToast('info', 'Role Diperbarui', `Beralih ke akun: ${matchingPreseed.username} (${newRole})`);
    } else if (user) {
      const updated = { ...user, role: newRole };
      setUser(updated);
      showToast('info', 'Role Diperbarui', `Role Anda sekarang: ${newRole}`);
    }
  };

  const simulateSessionRevocation = () => {
    setUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    openSessionExpiredModal('Simulasi: Token JWT Anda telah dimasukkan ke dalam Redis Blacklist (401 Unauthorized).');
  };

  const currentRole: UserRole = user?.role === 'ADMIN' ? 'ADMIN' : 'USER';

  return (
    <AuthContext.Provider
      value={{
        user,
        role: currentRole,
        isAdmin: currentRole === 'ADMIN',
        isAuthenticated: !!user,
        login,
        register,
        logout,
        switchRole,
        simulateSessionRevocation,
        isAuthModalOpen,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
