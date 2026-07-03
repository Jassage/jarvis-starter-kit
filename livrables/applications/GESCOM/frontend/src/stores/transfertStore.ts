'use client';
import { create } from 'zustand';
import api from '@/lib/api';

export interface LigneTransfert {
  id: string;
  produitId: string;
  quantite: number;
  produit: { nom: string; reference: string; unite: string };
}

export interface Transfert {
  id: string;
  numero: string;
  statut: 'EN_TRANSIT' | 'RECU' | 'ANNULE';
  notes?: string | null;
  dateEnvoi: string;
  dateReception?: string | null;
  emplacementSource: { id: string; nom: string; type: string };
  emplacementDest: { id: string; nom: string; type: string };
  utilisateur: { nom: string; prenom: string };
  lignes: LigneTransfert[];
}

interface TransfertState {
  transferts: Transfert[];
  isLoading: boolean;
  fetchTransferts: (params?: { statut?: string }) => Promise<void>;
  createTransfert: (data: any) => Promise<void>;
  recevoirTransfert: (id: string) => Promise<void>;
  annulerTransfert: (id: string) => Promise<void>;
}

export const useTransfertStore = create<TransfertState>((set, get) => ({
  transferts: [],
  isLoading: false,

  fetchTransferts: async (params) => {
    set({ isLoading: true });
    try {
      const { data } = await api.get('/transferts', { params });
      set({ transferts: data.data, isLoading: false });
    } catch (e) {
      set({ isLoading: false });
      throw e;
    }
  },

  createTransfert: async (payload) => {
    await api.post('/transferts', payload);
    await get().fetchTransferts();
  },

  recevoirTransfert: async (id) => {
    await api.patch(`/transferts/${id}/recevoir`);
    await get().fetchTransferts();
  },

  annulerTransfert: async (id) => {
    await api.patch(`/transferts/${id}/annuler`);
    await get().fetchTransferts();
  },
}));
