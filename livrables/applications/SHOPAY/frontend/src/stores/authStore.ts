'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/lib/api';

interface Boutique {
  id: string;
  name: string;
  slug: string;
  status: string;
  logoUrl?: string | null;
  themeColor?: string;
}

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'PLATFORM_SUPER_ADMIN' | 'BOUTIQUE_OWNER' | 'BOUTIQUE_STAFF';
  boutiqueId?: string | null;
}

interface AuthState {
  user: User | null;
  boutique: Boutique | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (input: { email: string; password: string; firstName: string; lastName: string; boutiqueName: string }) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User, boutique?: Boutique | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      boutique: null,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/auth/login', { email, password });
          set({ user: data.data.user, boutique: data.data.boutique, isLoading: false });
        } catch (e) {
          set({ isLoading: false });
          throw e;
        }
      },

      register: async (input) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/auth/register', input);
          set({ user: data.data.user, boutique: data.data.boutique, isLoading: false });
        } catch (e) {
          set({ isLoading: false });
          throw e;
        }
      },

      logout: async () => {
        try {
          await api.post('/auth/logout', {});
        } catch {
          // best-effort
        }
        set({ user: null, boutique: null });
      },

      setUser: (user, boutique) => set({ user, boutique: boutique ?? null }),
    }),
    {
      name: 'shopay-auth',
      // On ne persiste que l'info utilisateur (display), jamais les tokens (cookies httpOnly)
      partialize: (state) => ({ user: state.user, boutique: state.boutique }),
    }
  )
);
