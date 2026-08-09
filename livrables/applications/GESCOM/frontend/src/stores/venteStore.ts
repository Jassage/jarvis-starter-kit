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
  _count?: { retours: number };
}

export interface LigneRetour {
  id: string;
  ligneVenteId: string;
  quantite: number;
  montantLigne: string;
  ligneVente: { quantite: number; produit: { nom: string; reference: string; unite: string } };
}

export interface RetourVente {
  id: string;
  numero: string;
  motif?: string | null;
  montantTotal: string;
  createdAt: string;
  utilisateur: { nom: string; prenom: string };
  lignes: LigneRetour[];
}

export interface RetourInput {
  motif?: string;
  lignes: { ligneVenteId: string; quantite: number }[];
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
  retours: RetourVente[];
  fetchVentes: (params?: { emplacementId?: string; statut?: string; dateFrom?: string; dateTo?: string }) => Promise<void>;
  createVente: (data: VenteInput) => Promise<Vente>;
  cancelVente: (id: string) => Promise<void>;
  fetchRetours: (venteId: string) => Promise<void>;
  createRetour: (venteId: string, data: RetourInput) => Promise<void>;
}

export const useVenteStore = create<VenteState>((set, get) => ({
  ventes: [],
  isLoading: false,
  retours: [],

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

  fetchRetours: async (venteId) => {
    const { data } = await api.get(`/ventes/${venteId}/retours`);
    set({ retours: data.data });
  },

  createRetour: async (venteId, payload) => {
    await api.post(`/ventes/${venteId}/retours`, payload);
    await get().fetchVentes();
  },
}));
