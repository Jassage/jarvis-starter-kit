'use client';
import { create } from 'zustand';
import api from '@/lib/api';

export interface Config {
  cle: string;
  valeur: string;
  description: string;
  updatedAt: string | null;
}

interface ConfigState {
  configs: Config[];
  isLoading: boolean;
  fetchConfigs: () => Promise<void>;
  updateConfig: (cle: string, valeur: string) => Promise<void>;
  bulkUpdate: (entries: { cle: string; valeur: string }[]) => Promise<void>;
}

export const useConfigurationStore = create<ConfigState>((set) => ({
  configs: [],
  isLoading: false,

  fetchConfigs: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.get('/configurations');
      set({ configs: data.data });
    } finally {
      set({ isLoading: false });
    }
  },

  updateConfig: async (cle, valeur) => {
    await api.put(`/configurations/${cle}`, { valeur });
  },

  bulkUpdate: async (entries) => {
    await api.post('/configurations/bulk', { entries });
  },
}));
