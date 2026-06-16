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
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
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

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post("/auth/login", { email, password });
          const { token, user } = data.data;
          localStorage.setItem("konekte_token", token);
          set({ token, user, isLoading: false });
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
          localStorage.setItem("konekte_token", token);
          set({ token, user, isLoading: false });
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      logout: () => {
        localStorage.removeItem("konekte_token");
        set({ user: null, token: null });
        window.location.href = "/login";
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
    { name: "konekte_auth", partialize: (s) => ({ token: s.token, user: s.user }) }
  )
);
