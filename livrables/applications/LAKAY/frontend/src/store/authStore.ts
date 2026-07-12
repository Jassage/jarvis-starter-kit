'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi, refreshAccessToken } from '../lib/api';

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
  // Access token gardé en mémoire uniquement (jamais en localStorage) : le refresh
  // token, lui, ne touche jamais le JS, il vit dans un cookie httpOnly côté backend.
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  hydrate: () => Promise<void>;
  setAccessToken: (access: string) => void;
  setUser: (user: User) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isLoading: false,
      isAuthenticated: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { data } = await authApi.login(email, password);
          const { accessToken, user } = data.data;
          set({ user, accessToken, isAuthenticated: true });
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        try {
          await authApi.logout();
        } catch { /* ignore */ }
        set({ user: null, accessToken: null, isAuthenticated: false });
      },

      refreshUser: async () => {
        try {
          const { data } = await authApi.getMe();
          set({ user: data.data.user, isAuthenticated: true });
        } catch {
          set({ user: null, isAuthenticated: false });
        }
      },

      // Appelé une fois au démarrage de l'app : échange le cookie httpOnly contre
      // un access token frais en mémoire (le cookie survit au rechargement, pas le state JS).
      // Passe par le même verrou que l'intercepteur Axios (refreshAccessToken) : le refresh
      // token étant à usage unique, un second /auth/refresh concurrent (déclenché par un 401
      // sur une requête tirée avant que ce hydrate() ait fini) casserait la session.
      hydrate: async () => {
        try {
          await refreshAccessToken();
        } catch {
          set({ user: null, accessToken: null, isAuthenticated: false });
        }
      },

      setAccessToken: (access) => set({ accessToken: access, isAuthenticated: true }),

      setUser: (user) => set({ user }),

      // Réinitialise l'état d'auth sans appel réseau (utilisé quand le refresh échoue)
      clearAuth: () => {
        set({ user: null, accessToken: null, isAuthenticated: false });
      },
    }),
    {
      name: 'lakay-auth',
      // Rien de sensible persisté : le seul état durable de la session est le
      // cookie httpOnly côté serveur, rejoué par hydrate() à chaque chargement.
      partialize: () => ({}),
    }
  )
);
