'use client';
import { create } from 'zustand';
import api from '@/lib/api';

export interface StockLigne {
  id: string;
  quantite: number;
  produit: { id: string; reference: string; nom: string; unite: string; seuilAlerte: number; prixAchatMoyen: string; prixVenteDetail: string; actif: boolean };
  emplacement: { id: string; nom: string; type: string };
}

export interface Alerte {
  produitId: string;
  reference: string;
  nom: string;
  emplacement: { id: string; nom: string; type: string };
  quantite: number;
  seuilAlerte: number;
}

export interface Mouvement {
  id: string;
  type: string;
  quantite: number;
  raison?: string | null;
  createdAt: string;
  produit: { nom: string; reference: string };
  emplacement: { nom: string };
  utilisateur: { nom: string; prenom: string };
}

export interface AjustementInput {
  produitId: string;
  emplacementId: string;
  quantite: number;
  type: 'ENTREE' | 'AJUSTEMENT';
  raison?: string;
}

interface StockState {
  stocks: StockLigne[];
  alertes: Alerte[];
  mouvements: Mouvement[];
  isLoading: boolean;
  fetchStock: (emplacementId?: string) => Promise<void>;
  fetchAlertes: () => Promise<void>;
  fetchMouvements: () => Promise<void>;
  ajusterStock: (data: AjustementInput) => Promise<void>;
}

export const useStockStore = create<StockState>((set, get) => ({
  stocks: [],
  alertes: [],
  mouvements: [],
  isLoading: false,

  fetchStock: async (emplacementId) => {
    set({ isLoading: true });
    try {
      const { data } = await api.get('/stock', { params: emplacementId ? { emplacementId } : undefined });
      set({ stocks: data.data, isLoading: false });
    } catch (e) {
      set({ isLoading: false });
      throw e;
    }
  },

  fetchAlertes: async () => {
    const { data } = await api.get('/stock/alertes');
    set({ alertes: data.data });
  },

  fetchMouvements: async () => {
    const { data } = await api.get('/stock/mouvements');
    set({ mouvements: data.data });
  },

  ajusterStock: async (payload) => {
    await api.post('/stock/ajustement', payload);
    await Promise.all([get().fetchStock(), get().fetchAlertes(), get().fetchMouvements()]);
  },
}));
