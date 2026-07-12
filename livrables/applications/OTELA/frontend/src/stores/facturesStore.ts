'use client';
import { create } from 'zustand';
import api from '@/lib/api';

export type StatutPaiement = 'IMPAYE' | 'PARTIEL' | 'PAYE';
export type MethodePaiement = 'ESPECES' | 'CARTE' | 'MONCASH' | 'AUTRE';

export interface Paiement {
  id: string;
  montant: string;
  methode: MethodePaiement;
  datePaiement: string;
  employe: { id: string; nom: string } | null;
}

export interface Facture {
  id: string;
  reservationId: string;
  montantHT: string;
  taxes: string;
  montantTotal: string;
  devise: 'HTG' | 'USD';
  statutPaiement: StatutPaiement;
  paiements: Paiement[];
}

interface FacturesState {
  facture: Facture | null;
  isLoading: boolean;
  error: string | null;
  fetchFacture: (reservationId: string) => Promise<void>;
  enregistrerPaiement: (factureId: string, data: { montant: number; methode: MethodePaiement }) => Promise<void>;
  reset: () => void;
}

export const useFacturesStore = create<FacturesState>((set) => ({
  facture: null,
  isLoading: false,
  error: null,

  fetchFacture: async (reservationId) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get(`/factures/${reservationId}`);
      set({ facture: data.data.facture, isLoading: false });
    } catch (e: any) {
      set({ error: e.response?.data?.message || 'Erreur de chargement', isLoading: false });
    }
  },

  enregistrerPaiement: async (factureId, data) => {
    const { data: res } = await api.post(`/factures/${factureId}/paiements`, data);
    set({ facture: res.data.facture });
  },

  reset: () => set({ facture: null, error: null }),
}));
