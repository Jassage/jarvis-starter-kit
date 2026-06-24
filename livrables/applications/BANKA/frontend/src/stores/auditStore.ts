'use client';
import { create } from 'zustand';
import api from '@/lib/api';

export interface AuditEntry {
  id: string;
  table: string;
  action: string;
  entiteId: string;
  ancienneValeur: any;
  nouvelleValeur: any;
  ip: string | null;
  createdAt: string;
  utilisateur: {
    id: string;
    prenom: string;
    nom: string;
    role: string;
  } | null;
}

interface AuditState {
  logs: AuditEntry[];
  total: number;
  pages: number;
  isLoading: boolean;
  fetchLogs: (opts?: { table?: string; action?: string; userId?: string; page?: number; limit?: number }) => Promise<void>;
}

export const useAuditStore = create<AuditState>((set) => ({
  logs: [],
  total: 0,
  pages: 1,
  isLoading: false,

  fetchLogs: async (opts = {}) => {
    set({ isLoading: true });
    try {
      const { data } = await api.get('/audit', { params: { ...opts, limit: opts.limit ?? 30 } });
      set({
        logs: data.data.items,
        total: data.data.total,
        pages: data.data.pages,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },
}));
