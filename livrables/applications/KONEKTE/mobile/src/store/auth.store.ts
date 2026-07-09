import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api, { setStoredRefreshToken, getStoredRefreshToken, clearStoredRefreshToken } from "../api/client";

interface User {
  id: string;
  email: string;
  firstName: string;
  isEmailVerified: boolean;
  subscriptionPlan: string;
  mainPhoto?: string | null;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  birthDate: string;
  gender: string;
  city: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  authChecked: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  bootstrap: () => Promise<void>;
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
          const { token, user, refreshToken } = data.data;
          await setStoredRefreshToken(refreshToken);
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
          const { token, user, refreshToken } = data.data;
          await setStoredRefreshToken(refreshToken);
          set({ token, user, isLoading: false, authChecked: true });
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      // Pas de redirection impérative ici (contrairement au web) : le
      // RootNavigator observe `user` et bascule seul vers AuthStack.
      logout: async () => {
        const refreshToken = await getStoredRefreshToken();
        api.post("/auth/logout", { refreshToken }).catch(() => {});
        await clearStoredRefreshToken();
        set({ user: null, token: null });
      },

      // Appelé au démarrage de l'app : échange le refresh token stocké dans
      // SecureStore contre un nouvel access token. Équivalent mobile du
      // bootstrap web (qui utilise le cookie httpOnly à la place).
      bootstrap: async () => {
        try {
          const refreshToken = await getStoredRefreshToken();
          if (!refreshToken) {
            set({ token: null, user: null, authChecked: true });
            return;
          }
          const { data } = await api.post("/auth/refresh", { refreshToken });
          const { token, user, refreshToken: newRefreshToken } = data.data;
          await setStoredRefreshToken(newRefreshToken);
          set({ token, user, authChecked: true });
        } catch {
          await clearStoredRefreshToken();
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
    {
      name: "konekte_auth",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ user: s.user }),
    }
  )
);
