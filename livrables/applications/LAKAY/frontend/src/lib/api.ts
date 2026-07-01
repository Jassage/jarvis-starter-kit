import axios, { AxiosRequestConfig, AxiosError } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4003/api';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: false,
  headers: { 'Content-Type': 'application/json' },
});

// Injecter le token JWT
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('lakay_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Refresh automatique sur 401
let isRefreshing = false;
let failedQueue: Array<{ resolve: (v: string) => void; reject: (e: unknown) => void }> = [];

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers = { ...originalRequest.headers, Authorization: `Bearer ${token}` };
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('lakay_refresh_token');
        if (!refreshToken) throw new Error('No refresh token');

        const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
        const newToken = data.data.accessToken;
        localStorage.setItem('lakay_token', newToken);
        localStorage.setItem('lakay_refresh_token', data.data.refreshToken);

        failedQueue.forEach((p) => p.resolve(newToken));
        failedQueue = [];
        originalRequest.headers = { ...originalRequest.headers, Authorization: `Bearer ${newToken}` };
        return api(originalRequest);
      } catch (refreshError) {
        failedQueue.forEach((p) => p.reject(refreshError));
        failedQueue = [];
        localStorage.removeItem('lakay_token');
        localStorage.removeItem('lakay_refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Fonctions utilitaires
export const authApi = {
  register: (data: Record<string, unknown>) => api.post('/auth/register', data),
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  logout: (refreshToken: string) => api.post('/auth/logout', { refreshToken }),
  refresh: (refreshToken: string) => api.post('/auth/refresh', { refreshToken }),
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

export const agenciesApi = {
  getAll: (params?: Record<string, string>) => api.get('/agencies', { params }),
  getById: (id: string) => api.get(`/agencies/${id}`),
  create: (data: Record<string, unknown>) => api.post('/agencies', data),
  update: (id: string, data: Record<string, unknown>) => api.patch(`/agencies/${id}`, data),
};

export const paymentsApi = {
  getPlans: () => api.get('/payments/plans'),
  getHistory: () => api.get('/payments/history'),
  initiateMoncash: (planId: string, currency?: string) => api.post('/payments/moncash/initiate', { planId, currency }),
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
  getReports: (params?: Record<string, unknown>) => api.get('/admin/reports', { params }),
  resolveReport: (id: string, status: 'RESOLVED' | 'DISMISSED', adminNote?: string) =>
    api.patch(`/admin/reports/${id}`, { status, adminNote }),
  getConfig: () => api.get('/admin/config'),
  updateConfig: (key: string, value: string) => api.put(`/admin/config/${key}`, { value }),
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
