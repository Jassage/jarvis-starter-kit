import axios from "axios";
import { useAuthStore } from "@/store/auth.store";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// L'access token expire vite (15 min). Sur un 401, on tente une fois de
// l'échanger contre un nouveau via le cookie httpOnly de refresh, puis on
// rejoue la requête d'origine. Les 401 concurrents partagent le même appel
// de refresh pour ne pas faire tourner plusieurs rotations en parallèle.
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
        refreshPromise = api
          .post("/auth/refresh")
          .then(({ data }) => {
            const { token, user } = data.data;
            useAuthStore.setState({ token, user, authChecked: true });
            return token as string;
          })
          .catch(() => {
            useAuthStore.setState({ token: null, user: null, authChecked: true });
            if (typeof window !== "undefined") window.location.href = "/login";
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
