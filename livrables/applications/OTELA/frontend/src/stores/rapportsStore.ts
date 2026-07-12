'use client';
import { create } from 'zustand';
import api from '@/lib/api';

export interface FacturationParDevise {
  facture: number;
  paye: number;
  impaye: number;
}

export interface RapportOccupation {
  nbChambres: number;
  nuitsOccupees: number;
  nuitsDisponibles: number;
  tauxOccupation: number;
  revenuParDevise: { HTG: number; USD: number };
  facturation: { HTG: FacturationParDevise; USD: FacturationParDevise };
}

export interface RapportChaine {
  parEtablissement: (RapportOccupation & { etablissementId: string; nom: string })[];
  totalParDevise: { HTG: number; USD: number };
  totalFacturationParDevise: { HTG: FacturationParDevise; USD: FacturationParDevise };
}

interface RapportsState {
  rapportEtablissement: RapportOccupation | null;
  rapportChaine: RapportChaine | null;
  isLoading: boolean;
  error: string | null;
  fetchRapportEtablissement: (from?: string, to?: string) => Promise<void>;
  fetchRapportChaine: (from?: string, to?: string) => Promise<void>;
}

export const useRapportsStore = create<RapportsState>((set) => ({
  rapportEtablissement: null,
  rapportChaine: null,
  isLoading: false,
  error: null,

  fetchRapportEtablissement: async (from, to) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get('/rapports/etablissement', { params: { from, to } });
      set({ rapportEtablissement: data.data.rapport, isLoading: false });
    } catch (e: any) {
      set({ error: e.response?.data?.message || 'Erreur de chargement', isLoading: false });
    }
  },

  fetchRapportChaine: async (from, to) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get('/rapports/chaine', { params: { from, to } });
      set({ rapportChaine: data.data.rapport, isLoading: false });
    } catch (e: any) {
      set({ error: e.response?.data?.message || 'Erreur de chargement', isLoading: false });
    }
  },
}));
