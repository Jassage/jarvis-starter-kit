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

export interface Trou {
  debut: string;
  fin: string;
  dureeMinutes: number;
}

interface GrilleState {
  creneaux: Creneau[];
  brouillons: number;
  isLoading: boolean;
  trous: Trou[];
  totalMinutesTrous: number;
  contenuRepli: { id: string; titre: string } | null;
  fetchCreneaux: (from?: string, to?: string) => Promise<void>;
  fetchContinuite: (from: string, to: string) => Promise<void>;
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
  trous: [],
  totalMinutesTrous: 0,
  contenuRepli: null,

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

  // Continuité d'antenne sur la fenêtre affichée : trous de grille synchronisée +
  // rappel du contenu de repli actif (dérivé de la liste des contenus).
  fetchContinuite: async (from, to) => {
    const [trousRes, contenusRes] = await Promise.all([
      api.get('/creneaux/trous', { params: { from, to } }),
      api.get('/contenus'),
    ]);
    const repli = (contenusRes.data.data.contenus as any[]).find((c) => c.estContenuDeRepli);
    set({
      trous: trousRes.data.data.trous,
      totalMinutesTrous: trousRes.data.data.totalMinutes,
      contenuRepli: repli ? { id: repli.id, titre: repli.titre } : null,
    });
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
