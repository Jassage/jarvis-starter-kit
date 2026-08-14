'use client';
import { create } from 'zustand';
import api from '@/lib/api';

export interface CreneauMoniteur {
  id: string;
  dateHeureDebut: string;
  dateHeureFin: string;
  typeCreneau: 'PROGRAMME' | 'MATCH_DIRECT' | 'PUB';
  contenu: { id: string; titre: string; sponsor?: { nomSponsor: string } | null } | null;
  match: { id: string; nomEvenement: string; equipes: string; sponsorPrincipal?: { nomSponsor: string } | null } | null;
}

export interface Moniteur {
  horodatage: string;
  enCours: CreneauMoniteur | null;
  resteSecondes: number | null;
  aSuivre: CreneauMoniteur[];
  audience: { total: number; web: number; mobile: number };
  matchsEnCours: Array<{ id: string; nomEvenement: string; equipes: string; dateHeurePrevue: string }>;
  alertes: {
    trous: Array<{ debut: string; fin: string; dureeMinutes: number }>;
    totalMinutesTrous: number;
    brouillons: number;
    contratsExpirant: Array<{ id: string; nomSponsor: string; dateFinContrat: string }>;
    repliDefini: boolean;
  };
}

interface MoniteurState {
  moniteur: Moniteur | null;
  isLoading: boolean;
  fetchMoniteur: () => Promise<void>;
}

export const useMoniteurStore = create<MoniteurState>((set) => ({
  moniteur: null,
  isLoading: false,

  fetchMoniteur: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.get('/moniteur');
      set({ moniteur: data.data, isLoading: false });
    } catch (e) {
      set({ isLoading: false });
      throw e;
    }
  },
}));
