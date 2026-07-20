'use client';
import { create } from 'zustand';
import api from '@/lib/api';

export type TypeContenu = 'VIDEO_BOUCLE' | 'SPOT_PUBLICITAIRE' | 'HABILLAGE_LOGO';

export interface Contenu {
  id: string;
  titre: string;
  typeContenu: TypeContenu;
  urlFichier: string;
  dureeSecondes: number;
  sponsorId: string | null;
  sponsor?: { id: string; nomSponsor: string } | null;
  estContenuDeRepli?: boolean;
}

export interface ContenuInput {
  titre: string;
  typeContenu: TypeContenu;
  urlFichier: string;
  dureeSecondes: number;
  sponsorId?: string | null;
}

interface ContenuState {
  contenus: Contenu[];
  isLoading: boolean;
  fetchContenus: () => Promise<void>;
  createContenu: (data: ContenuInput) => Promise<void>;
  updateContenu: (id: string, data: Partial<ContenuInput>) => Promise<void>;
  deleteContenu: (id: string) => Promise<void>;
  definirRepli: (id: string) => Promise<void>;
  retirerRepli: (id: string) => Promise<void>;
}

export const useContenuStore = create<ContenuState>((set, get) => ({
  contenus: [],
  isLoading: false,

  fetchContenus: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.get('/contenus');
      set({ contenus: data.data.contenus, isLoading: false });
    } catch (e) {
      set({ isLoading: false });
      throw e;
    }
  },

  createContenu: async (payload) => {
    await api.post('/contenus', payload);
    await get().fetchContenus();
  },

  updateContenu: async (id, payload) => {
    await api.patch(`/contenus/${id}`, payload);
    await get().fetchContenus();
  },

  deleteContenu: async (id) => {
    await api.delete(`/contenus/${id}`);
    await get().fetchContenus();
  },

  definirRepli: async (id) => {
    await api.post(`/contenus/${id}/repli`);
    await get().fetchContenus();
  },

  retirerRepli: async (id) => {
    await api.delete(`/contenus/${id}/repli`);
    await get().fetchContenus();
  },
}));
