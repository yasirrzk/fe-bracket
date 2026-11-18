/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { subscribeHttpEvent } from '../services/api';

export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
}

interface NotificationContextType {
  toasts: ToastItem[];
  showToast: (type: ToastItem['type'], title: string, message: string) => void;
  removeToast: (id: string) => void;
  isSessionExpiredModalOpen: boolean;
  closeSessionExpiredModal: () => void;
  openSessionExpiredModal: (reason?: string) => void;
  sessionExpiredReason: string;
  cooldownSeconds: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [isSessionExpiredModalOpen, setIsSessionExpiredModalOpen] = useState(false);
  const [sessionExpiredReason, setSessionExpiredReason] = useState('');
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((type: ToastItem['type'], title: string, message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  }, [removeToast]);

  const openSessionExpiredModal = useCallback((reason = 'Sesi akun anda telah kadaluarsa atau di-blacklist pada Redis.') => {
    setSessionExpiredReason(reason);
    setIsSessionExpiredModalOpen(true);
  }, []);

  const closeSessionExpiredModal = useCallback(() => {
    setIsSessionExpiredModalOpen(false);
  }, []);

  // Listen to Global HTTP Events from Axios Interceptors
  useEffect(() => {
    const unsub401 = subscribeHttpEvent('unauthorized', (payload) => {
      openSessionExpiredModal(payload?.message);
    });

    const unsub403 = subscribeHttpEvent('forbidden', (payload) => {
      showToast('error', '403 Forbidden // Akses Ditolak', payload?.message || 'Aksi ini memerlukan hak akses Admin/Organizer.');
    });

    const unsub429 = subscribeHttpEvent('rateLimited', (payload) => {
      const seconds = payload?.retryAfter || 3;
      setCooldownSeconds(seconds);
      showToast('warning', '429 Too Many Requests // ThrottlerGuard', payload?.message || 'Rate limit tercapai.');
    });

    const unsub500 = subscribeHttpEvent('networkError', (payload) => {
      showToast('error', 'Backend Notice (500)', payload?.message || 'Koneksi ke backend server gagal. Beralih ke Simulated Engine jika diperlukan.');
    });

    return () => {
      unsub401();
      unsub403();
      unsub429();
      unsub500();
    };
  }, [openSessionExpiredModal, showToast]);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const interval = setInterval(() => {
      setCooldownSeconds((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownSeconds]);

  return (
    <NotificationContext.Provider
      value={{
        toasts,
        showToast,
        removeToast,
        isSessionExpiredModalOpen,
        closeSessionExpiredModal,
        openSessionExpiredModal,
        sessionExpiredReason,
        cooldownSeconds,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotification must be used within NotificationProvider');
  return context;
};
