'use client';
import { create } from 'zustand';
import api from '@/lib/api';

export interface Etablissement {
  id: string;
  nom: string;
  adresse: string;
  commune: string;
  departement: string;
  devisesAcceptees: ('HTG' | 'USD')[];
  actif: boolean;
}

interface EtablissementsState {
  etablissements: Etablissement[];
  isLoading: boolean;
  error: string | null;
  fetchAll: () => Promise<void>;
  creer: (data: { nom: string; adresse: string; commune: string; departement: string; devisesAcceptees: ('HTG' | 'USD')[] }) => Promise<void>;
  toggleActif: (id: string, actif: boolean) => Promise<void>;
}

export const useEtablissementsStore = create<EtablissementsState>((set, get) => ({
  etablissements: [],
  isLoading: false,
  error: null,

  fetchAll: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get('/etablissements', { params: { actifOnly: 'false' } });
      set({ etablissements: data.data.etablissements, isLoading: false });
    } catch (e: any) {
      set({ error: e.response?.data?.message || 'Erreur de chargement', isLoading: false });
    }
  },

  creer: async (data) => {
    await api.post('/etablissements', data);
    await get().fetchAll();
  },

  toggleActif: async (id, actif) => {
    await api.patch(`/etablissements/${id}`, { actif });
    await get().fetchAll();
  },
}));
