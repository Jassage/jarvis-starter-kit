"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "@/lib/api";

interface User {
  id: string;
  email: string;
  firstName: string;
  isEmailVerified: boolean;
  subscriptionPlan: string;
  mainPhoto?: string | null;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  authChecked: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  bootstrap: () => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  birthDate: string;
  gender: string;
  city: string;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      authChecked: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post("/auth/login", { email, password });
          const { token, user } = data.data;
          set({ token, user, isLoading: false, authChecked: true });
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      register: async (formData) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post("/auth/register", formData);
          const { token, user } = data.data;
          set({ token, user, isLoading: false, authChecked: true });
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      logout: () => {
        api.post("/auth/logout").catch(() => {});
        set({ user: null, token: null });
        window.location.href = "/login";
      },

      // Appelé au chargement de l'app : échange le cookie httpOnly de refresh
      // contre un nouvel access token (celui-ci n'est plus persisté en
      // localStorage, il ne vit qu'en mémoire le temps de la session).
      bootstrap: async () => {
        try {
          const { data } = await api.post("/auth/refresh");
          const { token, user } = data.data;
          set({ token, user, authChecked: true });
        } catch {
          set({ token: null, user: null, authChecked: true });
        }
      },

      refreshUser: async () => {
        try {
          const { data } = await api.get("/auth/me");
          const u = data.data;
          set({
            user: {
              id: u.id,
              email: u.email,
              firstName: u.profile?.firstName ?? "",
              isEmailVerified: u.isEmailVerified,
              subscriptionPlan: u.subscriptionPlan,
              mainPhoto: u.photos?.find((p: { isMain: boolean }) => p.isMain)?.url ?? null,
            },
          });
        } catch {
          get().logout();
        }
      },
    }),
    { name: "konekte_auth", partialize: (s) => ({ user: s.user }) }
  )
);
