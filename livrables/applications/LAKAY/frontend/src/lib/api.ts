import axios, { AxiosRequestConfig, AxiosError } from 'axios';
import { useAuthStore } from '../store/authStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4003/api';

// Pages nécessitant une session : on n'y renvoie vers /login que si le refresh échoue.
// Les pages publiques restent affichées (dégradation en état déconnecté).
const PROTECTED_PREFIXES = ['/dashboard', '/admin'];

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
// Le refresh token est à usage unique (rotation à chaque appel) : si deux refresh
// partent en parallèle avec le même cookie (ex. hydrate() au bootstrap + un 401
// concurrent sur une autre requête), le second échoue car le premier a déjà fait
// tourner le token côté serveur. `refreshPromise` sert de verrou partagé — tout
// appelant concurrent (y compris hydrate() dans authStore) attend la même promesse
// au lieu de rejouer son propre /auth/refresh.
let refreshPromise: Promise<{ accessToken: string; user: unknown }> | null = null;

export function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${API_URL}/auth/refresh`, {}, { withCredentials: true })
      .then(({ data }) => {
        useAuthStore.getState().setAccessToken(data.data.accessToken);
        useAuthStore.getState().setUser(data.data.user);
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
        // Session expirée (cookie de refresh absent/invalide) : on nettoie l'état d'auth
        useAuthStore.getState().clearAuth();
        // On ne redirige vers /login QUE depuis une page protégée.
        // Sur une page publique (accueil, annonces…), on reste en place, déconnecté.
        const path = typeof window !== 'undefined' ? window.location.pathname : '';
        if (PROTECTED_PREFIXES.some((p) => path.startsWith(p))) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Fonctions utilitaires
export const authApi = {
  register: (data: Record<string, unknown>) => api.post('/auth/register', data),
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  logout: () => api.post('/auth/logout'),
  refresh: () => api.post('/auth/refresh'),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data: Record<string, unknown>) => api.patch('/auth/me', data),
  changePassword: (data: Record<string, unknown>) => api.patch('/auth/change-password', data),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) => api.post('/auth/reset-password', { token, password }),
  verifyEmail: (token: string) => api.get(`/auth/verify-email/${token}`),
};

export const listingsApi = {
  create: (data: Record<string, unknown>) => api.post('/listings', data),
  createListing: (data: Record<string, unknown>) => api.post('/listings', data),
  update: (id: string, data: Record<string, unknown>) => api.patch(`/listings/${id}`, data),
  delete: (id: string) => api.delete(`/listings/${id}`),
  deleteListing: (id: string) => api.delete(`/listings/${id}`),
  getById: (id: string) => api.get(`/listings/${id}`),
  getContact: (id: string) => api.get(`/listings/${id}/contact`),
  getSimilar: (id: string) => api.get(`/listings/${id}/similar`),
  getMyListings: (params?: Record<string, unknown>) => api.get('/listings/me/listings', { params }),
  submit: (id: string) => api.post(`/listings/${id}/submit`),
  submitForReview: (id: string) => api.post(`/listings/${id}/submit`),
  renew: (id: string) => api.post(`/listings/${id}/renew`),
  uploadImages: (id: string, formData: FormData) =>
    api.post(`/listings/${id}/images`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteImage: (listingId: string, imageId: string) => api.delete(`/listings/${listingId}/images/${imageId}`),
  getFeatured: () => api.get('/listings/featured'),
};

export const searchApi = {
  search: (params: Record<string, unknown>) => api.get('/search', { params }),
  autocomplete: (q: string) => api.get('/search/autocomplete', { params: { q } }),
  getStats: () => api.get('/search/stats'),
};

export const messagesApi = {
  start: (data: { otherUserId: string; listingId?: string; firstMessage: string }) => api.post('/messages/start', data),
  getConversations: () => api.get('/messages'),
  getMessages: (conversationId: string, params?: Record<string, string>) => api.get(`/messages/${conversationId}/messages`, { params }),
  sendMessage: (conversationId: string, content: string) => api.post(`/messages/${conversationId}/messages`, { content }),
  getUnreadCount: () => api.get('/messages/unread-count'),
};

export const favoritesApi = {
  getAll: () => api.get('/favorites'),
  getFavorites: () => api.get('/favorites'),
  add: (listingId: string) => api.post(`/favorites/${listingId}`),
  toggle: (listingId: string) => api.post(`/favorites/${listingId}`),
  remove: (listingId: string) => api.delete(`/favorites/${listingId}`),
  removeFavorite: (listingId: string) => api.delete(`/favorites/${listingId}`),
};

export const notificationsApi = {
  getAll: (params?: Record<string, unknown>) => api.get('/notifications', { params }),
  getNotifications: (params?: Record<string, unknown>) => api.get('/notifications', { params }),
  markRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAsRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
  markAllAsRead: () => api.patch('/notifications/read-all'),
  delete: (id: string) => api.delete(`/notifications/${id}`),
};

export const reportsApi = {
  create: (listingId: string, reason: string, description?: string) =>
    api.post('/reports', { listingId, reason, description }),
};

export const agenciesApi = {
  getAll: (params?: Record<string, string>) => api.get('/agencies', { params }),
  getById: (id: string) => api.get(`/agencies/${id}`),
  create: (data: Record<string, unknown>) => api.post('/agencies', data),
  update: (id: string, data: Record<string, unknown>) => api.patch(`/agencies/${id}`, data),
};

export const paymentsApi = {
  getPlans: () => api.get('/payments/plans'),
  getHistory: () => api.get('/payments/history'),
  getMethods: () => api.get('/payments/methods'),
  initiateMoncash: (planId: string, currency?: string) => api.post('/payments/moncash/initiate', { planId, currency }),
  initiateNatcash: (planId: string, currency?: string) => api.post('/payments/natcash/initiate', { planId, currency }),
  stripeCheckout: (planId: string) => api.post('/payments/stripe/checkout', { planId }),
  submitProof: (formData: FormData) =>
    api.post('/payments/submit-proof', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

export const adminApi = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params?: Record<string, unknown>) => api.get('/admin/users', { params }),
  toggleUserActive: (id: string, isActive: boolean) => api.patch(`/admin/users/${id}/toggle-active`, { isActive }),
  changeUserRole: (id: string, role: string) => api.patch(`/admin/users/${id}/role`, { role }),
  getListings: (params?: Record<string, unknown>) => api.get('/admin/listings', { params }),
  reviewListing: (id: string, action: 'APPROVE' | 'REJECT', rejectionReason?: string) =>
    api.post(`/listings/${id}/review`, { action, rejectionReason }),
  suspendListing: (id: string) => api.patch(`/admin/listings/${id}/suspend`),
  getPayments: (params?: Record<string, unknown>) => api.get('/admin/payments', { params }),
  approvePayment: (id: string) => api.post(`/admin/payments/${id}/approve`),
  rejectPayment: (id: string, reason?: string) => api.post(`/admin/payments/${id}/reject`, { reason }),
  getReports: (params?: Record<string, unknown>) => api.get('/admin/reports', { params }),
  resolveReport: (id: string, status: 'RESOLVED' | 'DISMISSED', adminNote?: string) =>
    api.patch(`/admin/reports/${id}`, { status, adminNote }),
  getConfig: () => api.get('/admin/config'),
  updateConfig: (key: string, value: string, label?: string) => api.put('/admin/config', { key, value, label }),
  getAuditLogs: (params?: Record<string, unknown>) => api.get('/admin/audit-logs', { params }),
};

export const aiApi = {
  estimatePrice: (data: Record<string, unknown>) => api.post('/ai/estimate', data),
  generateDescription: (data: Record<string, unknown>) => api.post('/ai/generate-description', data),
  nlSearch: (query: string) => api.post('/ai/search', { query }),
  chat: (message: string, listingId?: string) => api.post('/ai/chat', { message, listingId }),
};

export const visitsApi = {
  create: (data: Record<string, unknown>) => api.post('/visits', data),
  getMy: () => api.get('/visits/my'),
  getReceived: () => api.get('/visits/received'),
  respond: (id: string, status: 'CONFIRMED' | 'CANCELLED', ownerNote?: string) =>
    api.patch(`/visits/${id}/respond`, { status, ownerNote }),
};

export default api;
