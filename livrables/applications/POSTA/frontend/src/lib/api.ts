import axios, { AxiosError } from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4004/api',
  withCredentials: true,
});

let refreshPromise: Promise<void> | null = null;

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config;
    const status = error.response?.status;
    const url = original?.url || '';

    if (status !== 401 || url.includes('/auth/login') || url.includes('/auth/refresh') || !original) {
      return Promise.reject(error);
    }

    if ((original as { _retried?: boolean })._retried) {
      return Promise.reject(error);
    }
    (original as { _retried?: boolean })._retried = true;

    try {
      if (!refreshPromise) {
        refreshPromise = api.post('/auth/refresh').then(() => undefined).finally(() => {
          refreshPromise = null;
        });
      }
      await refreshPromise;
      return api.request(original);
    } catch {
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  }
);

export function apiErrorMessage(error: unknown, fallback = 'Une erreur est survenue'): string {
  if (axios.isAxiosError(error)) {
    const message = (error.response?.data as { message?: string } | undefined)?.message;
    if (message) return message;
  }
  return fallback;
}
