'use client';
import { create } from 'zustand';
import api from '@/lib/api';

export interface RepartitionEmplacement {
  id: string;
  nom: string;
  type: 'BOUTIQUE' | 'ENTREPOT';
  quantiteTotale: number;
  valeur: number;
}

export interface MouvementRecent {
  id: string;
  type: string;
  quantite: number;
  createdAt: string;
  produit: { nom: string; reference: string };
  emplacement: { nom: string };
  utilisateur: { nom: string; prenom: string };
}

export interface DashboardStats {
  totalProduits: number;
  valeurStockTotal: number;
  produitsSousAlerte: number;
  repartitionParEmplacement: RepartitionEmplacement[];
  mouvementsRecents: MouvementRecent[];
  ventesDuJour: { count: number; montant: number };
  commandesEnAttente: number;
}

interface DashboardState {
  stats: DashboardStats | null;
  isLoading: boolean;
  fetchStats: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  stats: null,
  isLoading: false,
  fetchStats: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.get('/dashboard/stats');
      set({ stats: data.data, isLoading: false });
    } catch (e) {
      set({ isLoading: false });
      throw e;
    }
  },
}));
