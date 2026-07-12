'use client';
import { create } from 'zustand';
import api, { setAccessToken, refreshAccessToken, AuthUser } from '@/lib/api';

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  hydrated: boolean;
  register: (nom: string, email: string, password: string, telephone?: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
}

// L'access token ne vit qu'en mémoire (jamais localStorage) — seul le refresh
// token httpOnly cookie survit au rechargement de page.
export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isLoading: false,
  hydrated: false,

  register: async (nom, email, password, telephone) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post('/auth/register', { nom, email, password, telephone });
      setAccessToken(data.data.accessToken);
      set({ user: data.data.user, isLoading: false });
    } catch (e) {
      set({ isLoading: false });
      throw e;
    }
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post('/auth/login', { email, password });
      setAccessToken(data.data.accessToken);
      set({ user: data.data.user, isLoading: false });
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
    set({ user: null });
  },

  hydrate: async () => {
    try {
      const { user } = await refreshAccessToken();
      set({ user, hydrated: true });
    } catch {
      set({ user: null, hydrated: true });
    }
  },
}));
