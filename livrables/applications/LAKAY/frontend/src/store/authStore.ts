'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '../lib/api';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  avatar?: string;
  phone?: string;
  bio?: string;
  whatsapp?: string;
  isVerified: boolean;
  subscription?: { plan: string; endDate?: string };
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setTokens: (access: string, refresh: string) => void;
  setUser: (user: User) => void;
}

const readToken = (key: string) =>
  typeof window !== 'undefined' ? localStorage.getItem(key) : null;

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      // Initialisés depuis localStorage au démarrage pour éviter la double source de vérité
      accessToken: readToken('lakay_token'),
      refreshToken: readToken('lakay_refresh_token'),
      isLoading: false,
      isAuthenticated: !!readToken('lakay_token'),

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { data } = await authApi.login(email, password);
          const { accessToken, refreshToken, user } = data.data;
          localStorage.setItem('lakay_token', accessToken);
          localStorage.setItem('lakay_refresh_token', refreshToken);
          set({ user, accessToken, refreshToken, isAuthenticated: true });
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        try {
          const { refreshToken } = get();
          if (refreshToken) await authApi.logout(refreshToken);
        } catch { /* ignore */ }
        localStorage.removeItem('lakay_token');
        localStorage.removeItem('lakay_refresh_token');
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
      },

      refreshUser: async () => {
        try {
          const { data } = await authApi.getMe();
          set({ user: data.data.user, isAuthenticated: true });
        } catch {
          set({ user: null, isAuthenticated: false });
        }
      },

      setTokens: (access, refresh) => {
        localStorage.setItem('lakay_token', access);
        localStorage.setItem('lakay_refresh_token', refresh);
        set({ accessToken: access, refreshToken: refresh, isAuthenticated: true });
      },

      setUser: (user) => set({ user }),
    }),
    {
      name: 'lakay-auth',
      // Tokens non persistés ici : localStorage 'lakay_token' est la source de vérité
      // (lue par l'intercepteur Axios et initialisée dans le state au démarrage)
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
