'use client';
import { create } from 'zustand';
import api from '@/lib/api';

export type TypeCreneau = 'PROGRAMME' | 'MATCH_DIRECT' | 'PUB';
export type SyncStatus = 'BROUILLON' | 'SYNCHRONISE';

export interface Creneau {
  id: string;
  dateHeureDebut: string;
  dateHeureFin: string;
  typeCreneau: TypeCreneau;
  contenuId: string | null;
  matchId: string | null;
  syncStatus: SyncStatus;
  syncedAt: string | null;
  contenu?: { id: string; titre: string; typeContenu: string; sponsor?: { nomSponsor: string } | null } | null;
  match?: { id: string; nomEvenement: string; equipes: string; sponsorPrincipal?: { nomSponsor: string } | null } | null;
}

export interface CreneauInput {
  dateHeureDebut: string;
  dateHeureFin: string;
  typeCreneau: TypeCreneau;
  contenuId?: string | null;
  matchId?: string | null;
}

interface GrilleState {
  creneaux: Creneau[];
  brouillons: number;
  isLoading: boolean;
  fetchCreneaux: (from?: string, to?: string) => Promise<void>;
  createCreneau: (data: CreneauInput) => Promise<void>;
  updateCreneau: (id: string, data: Partial<CreneauInput>) => Promise<void>;
  deleteCreneau: (id: string) => Promise<void>;
  dupliquerCreneau: (id: string, dateHeureDebut: string) => Promise<void>;
  synchroniserCreneau: (id: string) => Promise<void>;
}

export const useGrilleStore = create<GrilleState>((set, get) => ({
  creneaux: [],
  brouillons: 0,
  isLoading: false,

  fetchCreneaux: async (from, to) => {
    set({ isLoading: true });
    try {
      const { data } = await api.get('/creneaux', { params: { from, to } });
      set({ creneaux: data.data.creneaux, brouillons: data.data.brouillons, isLoading: false });
    } catch (e) {
      set({ isLoading: false });
      throw e;
    }
  },

  createCreneau: async (payload) => {
    await api.post('/creneaux', payload);
    await get().fetchCreneaux();
  },

  updateCreneau: async (id, payload) => {
    await api.patch(`/creneaux/${id}`, payload);
    await get().fetchCreneaux();
  },

  deleteCreneau: async (id) => {
    await api.delete(`/creneaux/${id}`);
    await get().fetchCreneaux();
  },

  dupliquerCreneau: async (id, dateHeureDebut) => {
    await api.post(`/creneaux/${id}/dupliquer`, { dateHeureDebut });
    await get().fetchCreneaux();
  },

  synchroniserCreneau: async (id) => {
    await api.post(`/creneaux/${id}/synchroniser`);
    await get().fetchCreneaux();
  },
}));
