'use client';
import { create } from 'zustand';
import api from '@/lib/api';

export interface StockInfo {
  id: string;
  quantite: number;
  emplacement: { id: string; nom: string; type: string };
}

export interface Produit {
  id: string;
  reference: string;
  nom: string;
  categorie?: string | null;
  unite: string;
  prixAchatMoyen: string;
  prixVenteDetail: string;
  prixVenteGros?: string | null;
  seuilAlerte: number;
  actif: boolean;
  stocks?: StockInfo[];
  stockTotal?: number;
}

export interface ProduitInput {
  reference: string;
  nom: string;
  categorie?: string;
  unite: string;
  prixAchatMoyen: number;
  prixVenteDetail: number;
  prixVenteGros?: number;
  seuilAlerte: number;
}

interface ProduitState {
  produits: Produit[];
  isLoading: boolean;
  fetchProduits: (search?: string) => Promise<void>;
  createProduit: (data: ProduitInput) => Promise<void>;
  updateProduit: (id: string, data: Partial<ProduitInput>) => Promise<void>;
  archiveProduit: (id: string) => Promise<void>;
}

export const useProduitStore = create<ProduitState>((set, get) => ({
  produits: [],
  isLoading: false,

  fetchProduits: async (search) => {
    set({ isLoading: true });
    try {
      const { data } = await api.get('/produits', { params: search ? { search } : undefined });
      set({ produits: data.data, isLoading: false });
    } catch (e) {
      set({ isLoading: false });
      throw e;
    }
  },

  createProduit: async (payload) => {
    await api.post('/produits', payload);
    await get().fetchProduits();
  },

  updateProduit: async (id, payload) => {
    await api.put(`/produits/${id}`, payload);
    await get().fetchProduits();
  },

  archiveProduit: async (id) => {
    await api.delete(`/produits/${id}`);
    await get().fetchProduits();
  },
}));
