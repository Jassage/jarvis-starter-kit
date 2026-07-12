'use client';
import { create } from 'zustand';
import api, { setAccessToken, refreshAccessToken, RoleEmploye } from '@/lib/api';

export type { RoleEmploye };

interface Employe {
  id: string;
  email: string;
  nom: string;
  role: RoleEmploye;
  etablissementId: string | null;
}

interface AuthState {
  employe: Employe | null;
  isLoading: boolean;
  hydrated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
}

// L'access token ne vit qu'en mémoire (jamais localStorage) — seul le refresh
// token httpOnly cookie survit au rechargement de page.
export const useAuthStore = create<AuthState>()((set) => ({
  employe: null,
  isLoading: false,
  hydrated: false,

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post('/auth/login', { email, password });
      setAccessToken(data.data.accessToken);
      set({ employe: data.data.employe, isLoading: false });
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
    set({ employe: null });
  },

  hydrate: async () => {
    try {
      const { employe } = await refreshAccessToken();
      set({ employe, hydrated: true });
    } catch {
      set({ employe: null, hydrated: true });
    }
  },
}));
