import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

export interface AuthUser {
  id: string;
  email: string;
  nom: string;
}

interface RefreshResult {
  accessToken: string;
  user: AuthUser;
}

// Le refresh token est à usage unique (rotation en base à chaque appel côté
// backend) : deux appels concurrents à /auth/refresh échoueraient l'un
// l'autre. Un verrou partagé garantit une seule requête de refresh en vol à la
// fois — appliqué dès le départ (pattern OTELA/ANTENN, correctif découvert
// après coup sur LAKAY).
let refreshPromise: Promise<RefreshResult> | null = null;

export function refreshAccessToken(): Promise<RefreshResult> {
  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {}, { withCredentials: true })
      .then(({ data }) => {
        setAccessToken(data.data.accessToken);
        return data.data as RefreshResult;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

const PROTECTED_PREFIXES = ['/dashboard'];

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const onProtectedPage = typeof window !== 'undefined' && PROTECTED_PREFIXES.some((p) => window.location.pathname.startsWith(p));
    if (error.response?.status === 401 && onProtectedPage && !error.config._retry) {
      error.config._retry = true;
      try {
        await refreshAccessToken();
        return api(error.config);
      } catch {
        window.location.href = '/login';
      }
    } else if (error.response?.status === 401 && onProtectedPage) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
