import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { useAuthStore } from "../store/auth.store";
import { env } from "../config/env";

const REFRESH_TOKEN_KEY = "konekte_refresh_token";

export const getStoredRefreshToken = () => SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
export const setStoredRefreshToken = (token: string) => SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
export const clearStoredRefreshToken = () => SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);

const api = axios.create({
  baseURL: env.apiUrl,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  config.headers["X-Client-Type"] = "mobile";
  return config;
});

// Même logique que le web (lib/api.ts) : sur un 401, un seul refresh est
// tenté et partagé entre requêtes concurrentes. Ici le refresh token vient
// de SecureStore (équivalent mobile du cookie httpOnly) et est renvoyé dans
// le body, pas dans un cookie.
let refreshPromise: Promise<string | null> | null = null;

const isAuthRoute = (url?: string) =>
  !!url && (url.includes("/auth/refresh") || url.includes("/auth/login") || url.includes("/auth/register"));

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && original && !original._retry && !isAuthRoute(original.url)) {
      original._retry = true;

      if (!refreshPromise) {
        refreshPromise = (async () => {
          const refreshToken = await getStoredRefreshToken();
          if (!refreshToken) return null;

          const { data } = await api.post("/auth/refresh", { refreshToken });
          const { token, user, refreshToken: newRefreshToken } = data.data;
          await setStoredRefreshToken(newRefreshToken);
          useAuthStore.setState({ token, user, authChecked: true });
          return token as string;
        })()
          .catch(async () => {
            await clearStoredRefreshToken();
            useAuthStore.setState({ token: null, user: null, authChecked: true });
            return null;
          })
          .finally(() => {
            refreshPromise = null;
          });
      }

      const newToken = await refreshPromise;
      if (newToken) {
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
