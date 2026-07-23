'use client';
import { create } from 'zustand';
import api from '@/lib/api';

export interface Avis {
  id: string;
  note: number;
  commentaire: string | null;
  visible: boolean;
  reponseDirection: string | null;
  reponseDate: string | null;
  createdAt: string;
  reservation: { reference: string | null; client: { nom: string } };
  etablissement: { nom: string };
}

interface AvisState {
  avis: Avis[];
  isLoading: boolean;
  error: string | null;
  fetchAvis: () => Promise<void>;
  moderer: (id: string, data: Partial<{ visible: boolean; reponseDirection: string }>) => Promise<void>;
}

export const useAvisStore = create<AvisState>((set, get) => ({
  avis: [],
  isLoading: false,
  error: null,

  fetchAvis: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get('/avis');
      set({ avis: data.data.avis, isLoading: false });
    } catch (e: any) {
      set({ error: e.response?.data?.message || 'Erreur de chargement', isLoading: false });
    }
  },

  moderer: async (id, data) => {
    await api.patch(`/avis/${id}`, data);
    await get().fetchAvis();
  },
}));
