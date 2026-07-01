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
  emplacementId?: string | null;
  emplacement?: { id: string; nom: string; type: string } | null;
}

interface AuthState {
  utilisateur: Utilisateur | null;
  isLoading: boolean;
  login: (email: string, motDePasse: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: Utilisateur) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      utilisateur: null,
      isLoading: false,

      login: async (email, motDePasse) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/auth/login', { email, motDePasse });
          // Les tokens access + refresh sont dans des cookies httpOnly posés par le serveur
          set({ utilisateur: data.data.utilisateur, isLoading: false });
        } catch (e) {
          set({ isLoading: false });
          throw e;
        }
      },

      logout: async () => {
        try {
          await api.post('/auth/logout', {});
        } catch {}
        set({ utilisateur: null });
      },

      setUser: (utilisateur) => set({ utilisateur }),
    }),
    {
      name: 'gescom-auth',
      // On ne persiste que l'info utilisateur (display), jamais les tokens
      partialize: (state) => ({ utilisateur: state.utilisateur }),
    }
  )
);
