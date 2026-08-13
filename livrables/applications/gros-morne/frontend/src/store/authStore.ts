'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi, refreshAccessToken } from '../lib/api';

interface AdminUser {
  id: string;
  email: string;
  nom: string;
  role: string;
}

interface AuthState {
  adminUser: AdminUser | null;
  // Access token gardé en mémoire uniquement (jamais en localStorage) : le refresh
  // token, lui, ne touche jamais le JS, il vit dans un cookie httpOnly côté backend.
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  login: (email: string, motDePasse: string) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
  setAccessToken: (access: string) => void;
  setAdminUser: (adminUser: AdminUser) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      adminUser: null,
      accessToken: null,
      isLoading: false,
      isAuthenticated: false,

      login: async (email, motDePasse) => {
        set({ isLoading: true });
        try {
          // /auth/login ne renvoie que l'admin dans le corps (l'access token part en
          // cookie httpOnly, illisible en JS) : on enchaîne sur refreshAccessToken()
          // pour obtenir la copie en mémoire nécessaire à l'en-tête Authorization.
          await authApi.login(email, motDePasse);
          const refreshed = await refreshAccessToken();
          set({ adminUser: refreshed.adminUser as AdminUser, accessToken: refreshed.accessToken, isAuthenticated: true });
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        try {
          await authApi.logout();
        } catch {
          /* ignore */
        }
        set({ adminUser: null, accessToken: null, isAuthenticated: false });
      },

      // Appelé une fois au démarrage de l'app admin : échange le cookie httpOnly contre
      // un access token frais en mémoire (le cookie survit au rechargement, pas le state JS).
      // Passe par le même verrou que l'intercepteur Axios (refreshAccessToken) : le refresh
      // token étant à usage unique en rotation, un second /auth/refresh concurrent (déclenché
      // par un 401 sur une requête tirée avant que ce hydrate() ait fini) casserait la session.
      hydrate: async () => {
        try {
          await refreshAccessToken();
        } catch {
          set({ adminUser: null, accessToken: null, isAuthenticated: false });
        }
      },

      setAccessToken: (access) => set({ accessToken: access, isAuthenticated: true }),

      setAdminUser: (adminUser) => set({ adminUser }),

      clearAuth: () => {
        set({ adminUser: null, accessToken: null, isAuthenticated: false });
      },
    }),
    {
      name: 'gros-morne-admin-auth',
      // Rien de sensible persisté : le seul état durable de la session est le
      // cookie httpOnly côté serveur, rejoué par hydrate() à chaque chargement.
      partialize: () => ({}),
    }
  )
);
