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

// Le refresh token est à usage unique (rotation en base à chaque appel côté
// backend) : deux appels concurrents à /auth/refresh (ex. le hydrate() du layout
// et l'intercepteur 401 d'une requête tierce déclenchés en même temps) échouent
// systématiquement l'un l'autre. Un verrou partagé garantit une seule requête de
// refresh en vol à la fois, réutilisée par tous les appelants concurrents. Appliqué
// dès le départ sur OTELA (correctif découvert après coup sur LAKAY, préventif ici).
export type RoleEmploye = 'RECEPTION' | 'MENAGE' | 'SERVEUR' | 'ADMINISTRATEUR_ETABLISSEMENT' | 'ADMINISTRATEUR_CHAINE';

interface RefreshResult {
  accessToken: string;
  employe: { id: string; email: string; nom: string; role: RoleEmploye; etablissementId: string | null };
}

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

const PROTECTED_PREFIXES = ['/reservations', '/calendrier', '/chambres', '/rapports', '/chaine', '/etablissements', '/reception', '/menage', '/pos', '/cuisine', '/restaurant', '/spa', '/minibar', '/blanchisserie', '/conciergerie', '/voiturier', '/room-service'];

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
