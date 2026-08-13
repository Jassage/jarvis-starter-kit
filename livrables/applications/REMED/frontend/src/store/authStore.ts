import { create } from 'zustand';
import { api } from '@/lib/api';
import { Utilisateur } from '@/lib/types';

interface AuthState {
  utilisateur: Utilisateur | null;
  chargement: boolean;
  isLoading: boolean;
  fetchMe: () => Promise<void>;
  login: (email: string, motDePasse: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  utilisateur: null,
  chargement: true,
  isLoading: false,

  async fetchMe() {
    try {
      const { data } = await api.get('/auth/me');
      set({ utilisateur: data.data.utilisateur, chargement: false });
    } catch {
      set({ utilisateur: null, chargement: false });
    }
  },

  async login(email, motDePasse) {
    set({ isLoading: true });
    try {
      const { data } = await api.post('/auth/login', { email, motDePasse });
      set({ utilisateur: data.data.utilisateur, isLoading: false, chargement: false });
    } catch (e) {
      set({ isLoading: false });
      throw e;
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
