'use client';
import { create } from 'zustand';
import api from '@/lib/api';

export interface RapportSponsor {
  sponsorId: string;
  nomSponsor: string;
  typePackage: string;
  nombreDiffusions: number;
  dureeExpositionSecondes: number;
  nombreVuesEstimees: number;
}

interface RapportState {
  rapport: RapportSponsor[];
  isLoading: boolean;
  fetchRapport: (from?: string, to?: string) => Promise<void>;
}

export const useRapportStore = create<RapportState>((set) => ({
  rapport: [],
  isLoading: false,

  fetchRapport: async (from, to) => {
    set({ isLoading: true });
    try {
      const { data } = await api.get('/rapports/sponsors', { params: { from, to } });
      set({ rapport: data.data.rapport, isLoading: false });
    } catch (e) {
      set({ isLoading: false });
      throw e;
    }
  },
}));
