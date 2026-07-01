'use client';
import { create } from 'zustand';
import api from '@/lib/api';

export interface LigneVente {
  id: string;
  produitId: string;
  quantite: number;
  prixUnitaire: string;
  montantLigne: string;
  produit: { nom: string; reference: string; unite: string };
}

export interface Vente {
  id: string;
  numero: string;
  statut: 'BROUILLON' | 'VALIDEE' | 'ANNULEE';
  modePaiement: 'ESPECES' | 'CHEQUE' | 'VIREMENT' | 'CREDIT';
  montantTotal: string;
  montantPaye: string;
  dateVente: string;
  client?: { id: string; nom: string; type: string } | null;
  emplacement: { id: string; nom: string; type: string };
  utilisateur: { nom: string; prenom: string };
  lignes: LigneVente[];
}

export interface LigneVenteInput {
  produitId: string;
  quantite: number;
  prixUnitaire: number;
}

export interface VenteInput {
  emplacementId: string;
  clientId?: string;
  modePaiement: 'ESPECES' | 'CHEQUE' | 'VIREMENT' | 'CREDIT';
  montantPaye?: number;
  lignes: LigneVenteInput[];
}

interface VenteState {
  ventes: Vente[];
  isLoading: boolean;
  fetchVentes: (params?: { emplacementId?: string; statut?: string; dateFrom?: string; dateTo?: string }) => Promise<void>;
  createVente: (data: VenteInput) => Promise<Vente>;
  cancelVente: (id: string) => Promise<void>;
}

export const useVenteStore = create<VenteState>((set, get) => ({
  ventes: [],
  isLoading: false,

  fetchVentes: async (params) => {
    set({ isLoading: true });
    try {
      const { data } = await api.get('/ventes', { params });
      set({ ventes: data.data, isLoading: false });
    } catch (e) {
      set({ isLoading: false });
      throw e;
    }
  },

  createVente: async (payload) => {
    const { data } = await api.post('/ventes', payload);
    await get().fetchVentes();
    return data.data;
  },

  cancelVente: async (id) => {
    await api.patch(`/ventes/${id}/annuler`);
    await get().fetchVentes();
  },
}));
