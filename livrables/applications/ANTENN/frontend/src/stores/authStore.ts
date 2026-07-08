'use client';
import { create } from 'zustand';
import api, { setAccessToken, refreshAccessToken } from '@/lib/api';

export type Role = 'ADMINISTRATEUR' | 'OPERATEUR_REGIE';

interface Utilisateur {
  id: string;
  email: string;
  nom: string;
  role: Role;
}

interface AuthState {
  utilisateur: Utilisateur | null;
  isLoading: boolean;
  hydrated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
}

// L'access token ne vit qu'en mémoire (jamais localStorage) — seul le refresh
// token httpOnly cookie survit au rechargement de page (cf. auth.controller.ts backend).
export const useAuthStore = create<AuthState>()((set) => ({
  utilisateur: null,
  isLoading: false,
  hydrated: false,

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post('/auth/login', { email, password });
      setAccessToken(data.data.accessToken);
      set({ utilisateur: data.data.user, isLoading: false });
    } catch (e) {
      set({ isLoading: false });
      throw e;
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout', {});
    } catch {}
    setAccessToken(null);
    set({ utilisateur: null });
  },

  hydrate: async () => {
    try {
      const { user } = await refreshAccessToken();
      set({ utilisateur: user, hydrated: true });
    } catch {
      set({ utilisateur: null, hydrated: true });
    }
  },
}));
