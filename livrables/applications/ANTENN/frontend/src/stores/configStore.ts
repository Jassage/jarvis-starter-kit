'use client';
import { create } from 'zustand';
import api from '@/lib/api';

export type PositionOverlay = 'HAUT_GAUCHE' | 'HAUT_DROITE' | 'BAS_GAUCHE' | 'BAS_DROITE';

export interface ConfigChaine {
  id: string;
  nomChaine: string;
  logoUrl: string | null;
  logoPosition: PositionOverlay;
  logoOpacite: number;
  logoActif: boolean;
}

export interface ConfigInput {
  nomChaine?: string;
  logoPosition?: PositionOverlay;
  logoOpacite?: number;
  logoActif?: boolean;
}

interface ConfigState {
  config: ConfigChaine | null;
  isLoading: boolean;
  fetchConfig: () => Promise<void>;
  updateConfig: (data: ConfigInput) => Promise<void>;
  uploadLogo: (file: File) => Promise<void>;
}

export const useConfigStore = create<ConfigState>((set, get) => ({
  config: null,
  isLoading: false,

  fetchConfig: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.get('/config');
      set({ config: data.data.config, isLoading: false });
    } catch (e) {
      set({ isLoading: false });
      throw e;
    }
  },

  updateConfig: async (payload) => {
    const { data } = await api.patch('/config', payload);
    set({ config: data.data.config });
  },

  uploadLogo: async (file) => {
    const form = new FormData();
    form.append('logo', file);
    const { data } = await api.post('/config/logo', form, { headers: { 'Content-Type': 'multipart/form-data' } });
    set({ config: data.data.config });
  },
}));
