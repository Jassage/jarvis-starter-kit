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
          // Les tokens access + refresh sont dans des cookies httpOnly posés par le serveur
          set({ utilisateur: result.utilisateur, isLoading: false, requiresTwoFactor: false, tempToken: null });
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
          // Les cookies httpOnly sont posés par le serveur dans la réponse
          set({ utilisateur: data.data.utilisateur, isLoading: false, requiresTwoFactor: false, tempToken: null });
        } catch (e) {
          set({ isLoading: false });
          throw e;
        }
      },

      logout: async () => {
        try {
          // Le serveur lit le refresh token depuis le cookie et le révoque, puis clear les deux cookies
          await api.post('/auth/logout', {});
        } catch {}
        set({ utilisateur: null, requiresTwoFactor: false, tempToken: null });
      },

      setUser: (utilisateur) => set({ utilisateur }),

      clearTwoFactor: () => set({ requiresTwoFactor: false, tempToken: null }),
    }),
    {
      name: 'banka-auth',
      // On ne persiste que l'info utilisateur (display), jamais les tokens
      partialize: (state) => ({ utilisateur: state.utilisateur }),
    }
  )
);
