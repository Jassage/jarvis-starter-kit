'use client';
import { create } from 'zustand';
import api from '@/lib/api';

export interface LigneCommande {
  id: string;
  produitId: string;
  quantiteCommandee: number;
  quantiteRecue: number;
  prixUnitaireAchat: string;
  produit: { nom: string; reference: string; unite: string };
}

export interface Commande {
  id: string;
  numero: string;
  statut: 'BROUILLON' | 'ENVOYEE' | 'RECUE_PARTIELLE' | 'RECUE' | 'ANNULEE';
  notes?: string | null;
  dateCommande: string;
  dateLivraisonPrevue?: string | null;
  fournisseur: { id: string; nom: string };
  emplacement: { id: string; nom: string; type: string };
  utilisateur: { nom: string; prenom: string };
  lignes: LigneCommande[];
}

interface AchatState {
  commandes: Commande[];
  isLoading: boolean;
  fetchCommandes: (params?: { statut?: string }) => Promise<void>;
  createCommande: (data: any) => Promise<void>;
  envoyerCommande: (id: string) => Promise<void>;
  recevoirCommande: (id: string, lignes: { ligneId: string; quantiteRecue: number }[]) => Promise<void>;
  annulerCommande: (id: string) => Promise<void>;
}

export const useAchatStore = create<AchatState>((set, get) => ({
  commandes: [],
  isLoading: false,

  fetchCommandes: async (params) => {
    set({ isLoading: true });
    try {
      const { data } = await api.get('/achats', { params });
      set({ commandes: data.data, isLoading: false });
    } catch (e) {
      set({ isLoading: false });
      throw e;
    }
  },

  createCommande: async (payload) => {
    await api.post('/achats', payload);
    await get().fetchCommandes();
  },

  envoyerCommande: async (id) => {
    await api.patch(`/achats/${id}/envoyer`);
    await get().fetchCommandes();
  },

  recevoirCommande: async (id, lignes) => {
    await api.patch(`/achats/${id}/recevoir`, { lignes });
    await get().fetchCommandes();
  },

  annulerCommande: async (id) => {
    await api.patch(`/achats/${id}/annuler`);
    await get().fetchCommandes();
  },
}));
