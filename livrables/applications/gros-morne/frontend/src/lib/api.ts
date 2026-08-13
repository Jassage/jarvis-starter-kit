import axios, { AxiosRequestConfig, AxiosError } from 'axios';
import { useAuthStore } from '../store/authStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4010/api';
const API_ORIGIN = API_URL.replace(/\/api\/?$/, '');

// Les médias sont stockés en base avec une URL relative (`/uploads/xxx`), servie par le
// backend (`app.use('/uploads', express.static(...))`) et non par le frontend Next.js.
export function mediaUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  if (/^https?:\/\//.test(url)) return url;
  return `${API_ORIGIN}${url}`;
}

// Pages nécessitant une session : on n'y renvoie vers /admin/login que si le refresh échoue.
// Les pages publiques du site vitrine restent affichées (dégradation en état déconnecté).
const PROTECTED_PREFIXES = ['/admin'];
const LOGIN_PATH = '/admin/login';

export const api = axios.create({
  baseURL: API_URL,
  // Requis pour que le cookie httpOnly du refresh token transite (login/refresh/logout)
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Injecter le token JWT (access token en mémoire uniquement, jamais persisté)
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Refresh automatique sur 401.
// Le refresh token est à usage unique côté rotation : si deux refresh partent en parallèle
// avec le même cookie (ex. hydrate() au bootstrap + un 401 concurrent sur une autre requête),
// `refreshPromise` sert de verrou partagé — tout appelant concurrent (y compris hydrate()
// dans authStore) attend la même promesse au lieu de rejouer son propre /auth/refresh.
let refreshPromise: Promise<{ accessToken: string; adminUser: unknown }> | null = null;

export function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${API_URL}/auth/refresh`, {}, { withCredentials: true })
      .then(({ data }) => {
        useAuthStore.getState().setAccessToken(data.data.accessToken);
        useAuthStore.getState().setAdminUser(data.data.adminUser);
        return data.data;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { accessToken } = await refreshAccessToken();
        originalRequest.headers = { ...originalRequest.headers, Authorization: `Bearer ${accessToken}` };
        return api(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().clearAuth();
        const path = typeof window !== 'undefined' ? window.location.pathname : '';
        if (PROTECTED_PREFIXES.some((p) => path.startsWith(p)) && path !== LOGIN_PATH) {
          window.location.href = LOGIN_PATH;
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const authApi = {
  login: (email: string, motDePasse: string) => api.post('/auth/login', { email, motDePasse }),
  logout: () => api.post('/auth/logout'),
  refresh: () => api.post('/auth/refresh'),
  getMe: () => api.get('/auth/me'),
};

export const contenuApi = {
  list: (page: string) => api.get('/contenu', { params: { page } }),
  create: (data: Record<string, unknown>) => api.post('/contenu', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/contenu/${id}`, data),
  remove: (id: string) => api.delete(`/contenu/${id}`),
};

export const mediaApi = {
  list: () => api.get('/media'),
  upload: (formData: FormData) =>
    api.post('/media', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

export const sectionsCommunalesApi = {
  list: () => api.get('/sections-communales'),
  create: (data: Record<string, unknown>) => api.post('/sections-communales', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/sections-communales/${id}`, data),
  remove: (id: string) => api.delete(`/sections-communales/${id}`),
};

export const personnalitesApi = {
  list: (categorie?: string) => api.get('/personnalites', { params: categorie ? { categorie } : {} }),
  get: (id: string) => api.get(`/personnalites/${id}`),
  create: (data: Record<string, unknown>) => api.post('/personnalites', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/personnalites/${id}`, data),
  remove: (id: string) => api.delete(`/personnalites/${id}`),
  ajouterEtape: (id: string, data: Record<string, unknown>) => api.post(`/personnalites/${id}/etapes`, data),
  modifierEtape: (etapeId: string, data: Record<string, unknown>) => api.put(`/personnalites/etapes/${etapeId}`, data),
  supprimerEtape: (etapeId: string) => api.delete(`/personnalites/etapes/${etapeId}`),
  ajouterPhoto: (id: string, mediaId: string, ordre = 0) => api.post(`/personnalites/${id}/photos`, { mediaId, ordre }),
  supprimerPhoto: (photoId: string) => api.delete(`/personnalites/photos/${photoId}`),
};

export const tourismeApi = {
  list: (params?: { categorie?: string; q?: string }) => api.get('/tourisme', { params: params ?? {} }),
  listAdmin: () => api.get('/tourisme/admin'),
  create: (data: Record<string, unknown>) => api.post('/tourisme', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/tourisme/${id}`, data),
  remove: (id: string) => api.delete(`/tourisme/${id}`),
};

export const actualitesApi = {
  list: (params?: { categorie?: string; q?: string }) => api.get('/actualites', { params: params ?? {} }),
  listAdmin: () => api.get('/actualites/admin'),
  get: (id: string) => api.get(`/actualites/${id}`),
  create: (data: Record<string, unknown>) => api.post('/actualites', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/actualites/${id}`, data),
  remove: (id: string) => api.delete(`/actualites/${id}`),
};

export const agendaApi = {
  list: (params?: { categorie?: string; q?: string }) => api.get('/agenda', { params: params ?? {} }),
  listAdmin: () => api.get('/agenda/admin'),
  create: (data: Record<string, unknown>) => api.post('/agenda', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/agenda/${id}`, data),
  remove: (id: string) => api.delete(`/agenda/${id}`),
};

export const galerieApi = {
  list: (categorie?: string) => api.get('/galerie', { params: categorie ? { categorie } : {} }),
  listAdmin: () => api.get('/galerie/admin'),
  create: (data: Record<string, unknown>) => api.post('/galerie', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/galerie/${id}`, data),
  remove: (id: string) => api.delete(`/galerie/${id}`),
};

export const videosApi = {
  list: (categorie?: string) => api.get('/videos', { params: categorie ? { categorie } : {} }),
  listAdmin: () => api.get('/videos/admin'),
  create: (data: Record<string, unknown>) => api.post('/videos', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/videos/${id}`, data),
  remove: (id: string) => api.delete(`/videos/${id}`),
};

function repertoireApi(base: string) {
  return {
    list: (params?: Record<string, string>) => api.get(`/${base}`, { params }),
    listAdmin: () => api.get(`/${base}/admin`),
    create: (data: Record<string, unknown>) => api.post(`/${base}`, data),
    update: (id: string, data: Record<string, unknown>) => api.put(`/${base}/${id}`, data),
    remove: (id: string) => api.delete(`/${base}/${id}`),
  };
}

export const entreprisesApi = repertoireApi('entreprises');
export const hotelsApi = repertoireApi('hotels');
export const restaurantsApi = repertoireApi('restaurants');
export const ecolesApi = repertoireApi('ecoles');
export const santeApi = repertoireApi('sante');
export const associationsApi = repertoireApi('associations');
export const servicesMunicipauxApi = repertoireApi('services-municipaux');
export const annuaireApi = {
  ...repertoireApi('annuaire'),
  // Phase 3 : agrégation server-side des 7 verticaux (recherche + filtre secteur réels),
  // consommée par la page publique /annuaire à la place de 7 appels + filtre côté client.
  toutes: (params?: { secteur?: string; q?: string }) => api.get('/annuaire/toutes', { params: params ?? {} }),
};

export const rechercheApi = {
  chercher: (q: string) => api.get('/recherche', { params: { q } }),
};

export const heroImagesApi = {
  get: (page: string) => api.get(`/hero-images/${page}`),
  listAdmin: () => api.get('/hero-images/admin'),
  upsert: (page: string, mediaId: string) => api.put(`/hero-images/${page}`, { mediaId }),
  remove: (page: string) => api.delete(`/hero-images/${page}`),
};

export const temoignagesApi = {
  list: () => api.get('/temoignages'),
  listAdmin: () => api.get('/temoignages/admin'),
  create: (data: Record<string, unknown>) => api.post('/temoignages', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/temoignages/${id}`, data),
  remove: (id: string) => api.delete(`/temoignages/${id}`),
};

export const partenairesApi = {
  list: (emplacement?: string) => api.get('/partenaires', { params: emplacement ? { emplacement } : {} }),
  listAdmin: () => api.get('/partenaires/admin'),
  create: (data: Record<string, unknown>) => api.post('/partenaires', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/partenaires/${id}`, data),
  remove: (id: string) => api.delete(`/partenaires/${id}`),
};

export const faqApi = {
  list: (categorie?: string) => api.get('/faqs', { params: categorie ? { categorie } : {} }),
  listAdmin: () => api.get('/faqs/admin'),
  create: (data: Record<string, unknown>) => api.post('/faqs', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/faqs/${id}`, data),
  remove: (id: string) => api.delete(`/faqs/${id}`),
};

export const contactApi = {
  envoyer: (data: Record<string, unknown>) => api.post('/contact', data),
  list: (statut?: string) => api.get('/contact', { params: statut ? { statut } : {} }),
  changerStatut: (id: string, statut: string) => api.put(`/contact/${id}/statut`, { statut }),
  remove: (id: string) => api.delete(`/contact/${id}`),
};

export const newsletterApi = {
  sabonner: (email: string) => api.post('/newsletter', { email }),
  list: () => api.get('/newsletter'),
  remove: (id: string) => api.delete(`/newsletter/${id}`),
  exportUrl: () => `${API_URL}/newsletter/export`,
  envoyer: (sujet: string, message: string) => api.post('/newsletter/envoyer', { sujet, message }),
};

export const siteSettingsApi = {
  get: () => api.get('/site-settings'),
  update: (data: Record<string, unknown>) => api.put('/site-settings', data),
};

export const documentsApi = {
  list: () => api.get('/documents'),
  listAdmin: () => api.get('/documents/admin'),
  create: (data: Record<string, unknown>) => api.post('/documents', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/documents/${id}`, data),
  remove: (id: string) => api.delete(`/documents/${id}`),
};

export const activityLogApi = {
  list: (params?: { entite?: string; page?: number; limit?: number }) => api.get('/activity-log', { params }),
  listEntites: () => api.get('/activity-log/entites'),
};

export default api;
