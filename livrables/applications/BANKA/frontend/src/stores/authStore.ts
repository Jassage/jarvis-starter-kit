'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/lib/api';

interface Utilisateur {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  role: string;
  agenceId?: string | null;
  agence?: { id: string; code: string; nom: string } | null;
  twoFactorEnabled: boolean;
}

interface AuthState {
  utilisateur: Utilisateur | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  requiresTwoFactor: boolean;
  tempToken: string | null;
  login: (email: string, motDePasse: string) => Promise<void>;
  verify2FA: (code: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: Utilisateur) => void;
  clearTwoFactor: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      utilisateur: null,
      token: null,
      refreshToken: null,
      isLoading: false,
      requiresTwoFactor: false,
      tempToken: null,

      login: async (email, motDePasse) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/auth/login', { email, motDePasse });
          const result = data.data;
          if (result.requiresTwoFactor) {
            set({ isLoading: false, requiresTwoFactor: true, tempToken: result.tempToken });
            return;
          }
          const { token, refreshToken, utilisateur } = result;
          localStorage.setItem('banka_token', token);
          localStorage.setItem('banka_refresh', refreshToken);
          set({ token, refreshToken, utilisateur, isLoading: false, requiresTwoFactor: false, tempToken: null });
        } catch (e) {
          set({ isLoading: false });
          throw e;
        }
      },

      verify2FA: async (code: string) => {
        set({ isLoading: true });
        try {
          const { tempToken } = get();
          const { data } = await api.post('/auth/2fa/verify', { tempToken, code });
          const { token, refreshToken, utilisateur } = data.data;
          localStorage.setItem('banka_token', token);
          localStorage.setItem('banka_refresh', refreshToken);
          set({ token, refreshToken, utilisateur, isLoading: false, requiresTwoFactor: false, tempToken: null });
        } catch (e) {
          set({ isLoading: false });
          throw e;
        }
      },

      logout: async () => {
        try {
          const { refreshToken } = get();
          if (refreshToken) await api.post('/auth/logout', { refreshToken });
        } catch {}
        localStorage.removeItem('banka_token');
        localStorage.removeItem('banka_refresh');
        set({ utilisateur: null, token: null, refreshToken: null, requiresTwoFactor: false, tempToken: null });
      },

      setUser: (utilisateur) => set({ utilisateur }),

      clearTwoFactor: () => set({ requiresTwoFactor: false, tempToken: null }),
    }),
    {
      name: 'banka-auth',
      partialize: (state) => ({
        utilisateur: state.utilisateur,
        token: state.token,
        refreshToken: state.refreshToken,
      }),
    }
  )
);
