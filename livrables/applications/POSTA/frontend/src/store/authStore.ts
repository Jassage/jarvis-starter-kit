import { create } from 'zustand';
import { api } from '@/lib/api';
import { Utilisateur } from '@/lib/types';

interface AuthState {
  utilisateur: Utilisateur | null;
  chargement: boolean;
  fetchMe: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  utilisateur: null,
  chargement: true,
  async fetchMe() {
    try {
      const { data } = await api.get('/auth/me');
      set({ utilisateur: data.data.utilisateur, chargement: false });
    } catch {
      set({ utilisateur: null, chargement: false });
    }
  },
  async logout() {
    try {
      await api.post('/auth/logout');
    } finally {
      set({ utilisateur: null });
      window.location.href = '/login';
    }
  },
}));
