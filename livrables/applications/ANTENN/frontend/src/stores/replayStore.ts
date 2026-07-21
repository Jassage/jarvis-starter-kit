'use client';
import { create } from 'zustand';
import api from '@/lib/api';

export type StatutReplay = 'BROUILLON' | 'PUBLIE' | 'RETIRE';

export interface Replay {
  id: string;
  titre: string;
  description: string | null;
  urlVod: string;
  vignetteUrl: string | null;
  dureeSecondes: number;
  statut: StatutReplay;
  disponibleDu: string | null;
  disponibleAu: string | null;
  nombreVues: number;
  publieAt: string | null;
  creneauId: string | null;
  matchId: string | null;
  creneau?: { id: string; dateHeureDebut: string; dateHeureFin: string; typeCreneau: string } | null;
  match?: { id: string; nomEvenement: string; equipes: string } | null;
}

// Créneau déjà diffusé et pas encore publié en replay (alimente "Publier depuis la grille").
export interface CreneauReplayable {
  id: string;
  dateHeureDebut: string;
  dateHeureFin: string;
  typeCreneau: 'PROGRAMME' | 'MATCH_DIRECT' | 'PUB';
  contenu?: { id: string; titre: string; urlFichier: string } | null;
  match?: { id: string; nomEvenement: string; equipes: string } | null;
}

export interface ReplayInput {
  titre: string;
  description?: string | null;
  urlVod: string;
  dureeSecondes: number;
  disponibleDu?: string | null;
  disponibleAu?: string | null;
}

interface ReplayState {
  replays: Replay[];
  creneauxReplayables: CreneauReplayable[];
  isLoading: boolean;
  fetchReplays: () => Promise<void>;
  fetchCreneauxReplayables: () => Promise<void>;
  createReplay: (data: ReplayInput) => Promise<void>;
  createDepuisCreneau: (creneauId: string, data: Partial<ReplayInput>) => Promise<void>;
  updateReplay: (id: string, data: Partial<ReplayInput>) => Promise<void>;
  uploadVignette: (id: string, fichier: File) => Promise<void>;
  publier: (id: string) => Promise<void>;
  retirer: (id: string) => Promise<void>;
  deleteReplay: (id: string) => Promise<void>;
}

export const useReplayStore = create<ReplayState>((set, get) => ({
  replays: [],
  creneauxReplayables: [],
  isLoading: false,

  fetchReplays: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.get('/replay/admin');
      set({ replays: data.data.replays, isLoading: false });
    } catch (e) {
      set({ isLoading: false });
      throw e;
    }
  },

  fetchCreneauxReplayables: async () => {
    const { data } = await api.get('/replay/admin/creneaux-replayables');
    set({ creneauxReplayables: data.data.creneaux });
  },

  createReplay: async (payload) => {
    await api.post('/replay', payload);
    await get().fetchReplays();
  },

  createDepuisCreneau: async (creneauId, payload) => {
    await api.post(`/replay/depuis-creneau/${creneauId}`, payload);
    await Promise.all([get().fetchReplays(), get().fetchCreneauxReplayables()]);
  },

  updateReplay: async (id, payload) => {
    await api.patch(`/replay/${id}`, payload);
    await get().fetchReplays();
  },

  uploadVignette: async (id, fichier) => {
    const form = new FormData();
    form.append('vignette', fichier);
    await api.post(`/replay/${id}/vignette`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
    await get().fetchReplays();
  },

  publier: async (id) => {
    await api.post(`/replay/${id}/publier`);
    await get().fetchReplays();
  },

  retirer: async (id) => {
    await api.post(`/replay/${id}/retirer`);
    await get().fetchReplays();
  },

  deleteReplay: async (id) => {
    await api.delete(`/replay/${id}`);
    await Promise.all([get().fetchReplays(), get().fetchCreneauxReplayables()]);
  },
}));
