'use client';
import { create } from 'zustand';
import api from '@/lib/api';

export type StatutDiffusionMatch = 'PLANIFIE' | 'EN_COURS' | 'TERMINE';

export interface Match {
  id: string;
  nomEvenement: string;
  equipes: string;
  dateHeurePrevue: string;
  statutDiffusion: StatutDiffusionMatch;
  ingestUrlRtmp: string | null;
  sponsorPrincipalId: string | null;
  sponsorPrincipal?: { id: string; nomSponsor: string } | null;
}

export interface MatchInput {
  nomEvenement: string;
  equipes: string;
  dateHeurePrevue: string;
  ingestUrlRtmp?: string | null;
  sponsorPrincipalId?: string | null;
}

interface MatchState {
  matchs: Match[];
  isLoading: boolean;
  fetchMatchs: () => Promise<void>;
  createMatch: (data: MatchInput) => Promise<void>;
  updateMatch: (id: string, data: Partial<MatchInput>) => Promise<void>;
  demarrerDirect: (id: string) => Promise<void>;
  terminerDirect: (id: string) => Promise<void>;
}

export const useMatchStore = create<MatchState>((set, get) => ({
  matchs: [],
  isLoading: false,

  fetchMatchs: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.get('/matchs');
      set({ matchs: data.data.matchs, isLoading: false });
    } catch (e) {
      set({ isLoading: false });
      throw e;
    }
  },

  createMatch: async (payload) => {
    await api.post('/matchs', payload);
    await get().fetchMatchs();
  },

  updateMatch: async (id, payload) => {
    await api.patch(`/matchs/${id}`, payload);
    await get().fetchMatchs();
  },

  demarrerDirect: async (id) => {
    await api.post(`/matchs/${id}/demarrer`);
    await get().fetchMatchs();
  },

  terminerDirect: async (id) => {
    await api.post(`/matchs/${id}/terminer`);
    await get().fetchMatchs();
  },
}));
