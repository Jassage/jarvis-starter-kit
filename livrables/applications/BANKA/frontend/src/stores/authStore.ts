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
}

interface AuthState {
  utilisateur: Utilisateur | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  login: (email: string, motDePasse: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: Utilisateur) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      utilisateur: null,
      token: null,
      refreshToken: null,
      isLoading: false,

      login: async (email, motDePasse) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/auth/login', { email, motDePasse });
          const { token, refreshToken, utilisateur } = data.data;
          localStorage.setItem('banka_token', token);
          localStorage.setItem('banka_refresh', refreshToken);
          set({ token, refreshToken, utilisateur, isLoading: false });
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
        set({ utilisateur: null, token: null, refreshToken: null });
      },

      setUser: (utilisateur) => set({ utilisateur }),
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
