'use client';
import { create } from 'zustand';
import api from '@/lib/api';

export interface EntreeAudit {
  id: string;
  employeNom: string | null;
  employeRole: string | null;
  etablissementId: string | null;
  action: string;
  entite: string;
  entiteId: string | null;
  details: Record<string, unknown> | null;
  ip: string | null;
  createdAt: string;
}

export interface FiltresAudit {
  action?: string;
  from?: string;
  to?: string;
}

interface AuditState {
  entrees: EntreeAudit[];
  actions: string[];
  total: number;
  isLoading: boolean;
  error: string | null;
  fetch: (filtres: FiltresAudit) => Promise<void>;
  fetchActions: () => Promise<void>;
}

export const useAuditStore = create<AuditState>((set) => ({
  entrees: [],
  actions: [],
  total: 0,
  isLoading: false,
  error: null,

  fetch: async (filtres) => {
    set({ isLoading: true, error: null });
    try {
      const params: Record<string, string> = { limit: '200' };
      if (filtres.action) params.action = filtres.action;
      if (filtres.from) params.from = filtres.from;
      if (filtres.to) params.to = filtres.to;
      const { data } = await api.get('/audit', { params });
      set({ entrees: data.data.entrees, total: data.meta?.total ?? data.data.entrees.length, isLoading: false });
    } catch (e: any) {
      set({ error: e.response?.data?.message || 'Erreur de chargement', isLoading: false });
    }
  },

  fetchActions: async () => {
    try {
      const { data } = await api.get('/audit/actions');
      set({ actions: data.data.actions });
    } catch {
      /* liste de filtres facultative — l'échec ne bloque pas la page */
    }
  },
}));
