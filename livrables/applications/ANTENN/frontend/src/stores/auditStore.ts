'use client';
import { create } from 'zustand';
import api from '@/lib/api';

export interface EntreeAudit {
  id: string;
  action: string;
  utilisateurEmail: string;
  utilisateurNom: string;
  cible: string | null;
  cibleId: string | null;
  details: string | null;
  adresseIp: string | null;
  createdAt: string;
}

interface AuditState {
  entrees: EntreeAudit[];
  total: number;
  page: number;
  isLoading: boolean;
  fetchAudit: (params?: { action?: string; page?: number }) => Promise<void>;
}

export const useAuditStore = create<AuditState>((set) => ({
  entrees: [],
  total: 0,
  page: 1,
  isLoading: false,

  fetchAudit: async (params = {}) => {
    set({ isLoading: true });
    try {
      const { data } = await api.get('/audit', {
        params: { ...(params.action ? { action: params.action } : {}), page: params.page ?? 1, limit: 50 },
      });
      set({ entrees: data.data.entrees, total: data.data.total, page: data.data.page, isLoading: false });
    } catch (e) {
      set({ isLoading: false });
      throw e;
    }
  },
}));
