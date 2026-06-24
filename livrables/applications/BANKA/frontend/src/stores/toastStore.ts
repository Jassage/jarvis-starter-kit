'use client';
import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastState {
  toasts: Toast[];
  add: (toast: Omit<Toast, 'id'>) => void;
  remove: (id: string) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],

  add: (toast) => {
    const id = Math.random().toString(36).slice(2);
    set({ toasts: [...get().toasts, { ...toast, id }] });
    const duration = toast.duration ?? (toast.type === 'error' ? 6000 : 4000);
    setTimeout(() => get().remove(id), duration);
  },

  remove: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),

  success: (title, message) => get().add({ type: 'success', title, message }),
  error:   (title, message) => get().add({ type: 'error',   title, message }),
  warning: (title, message) => get().add({ type: 'warning', title, message }),
  info:    (title, message) => get().add({ type: 'info',    title, message }),
}));
