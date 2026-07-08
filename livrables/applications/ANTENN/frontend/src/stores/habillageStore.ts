'use client';
import { create } from 'zustand';
import api from '@/lib/api';

export type PositionOverlay = 'HAUT_GAUCHE' | 'HAUT_DROITE' | 'BAS_GAUCHE' | 'BAS_DROITE';

export interface Incrustation {
  id: string;
  creneauId: string | null;
  matchId: string | null;
  sponsorId: string;
  logoUrl: string;
  position: PositionOverlay;
  opacite: number;
  actif: boolean;
  sponsor?: { nomSponsor: string };
}

export interface BandeauItem {
  texte: string;
  logoUrl?: string;
  sponsorId?: string;
}

export interface Bandeau {
  id: string;
  creneauId: string | null;
  matchId: string | null;
  items: BandeauItem[];
  vitesseDefilement: number;
  actif: boolean;
}

interface HabillageState {
  incrustations: Incrustation[];
  bandeaux: Bandeau[];
  isLoading: boolean;
  fetchAll: () => Promise<void>;
  createIncrustation: (data: Omit<Incrustation, 'id' | 'sponsor'>) => Promise<void>;
  deleteIncrustation: (id: string) => Promise<void>;
  createBandeau: (data: Omit<Bandeau, 'id'>) => Promise<void>;
  deleteBandeau: (id: string) => Promise<void>;
}

export const useHabillageStore = create<HabillageState>((set, get) => ({
  incrustations: [],
  bandeaux: [],
  isLoading: false,

  fetchAll: async () => {
    set({ isLoading: true });
    try {
      const [inc, band] = await Promise.all([
        api.get('/habillage/incrustations'),
        api.get('/habillage/bandeaux'),
      ]);
      set({ incrustations: inc.data.data.incrustations, bandeaux: band.data.data.bandeaux, isLoading: false });
    } catch (e) {
      set({ isLoading: false });
      throw e;
    }
  },

  createIncrustation: async (payload) => {
    await api.post('/habillage/incrustations', payload);
    await get().fetchAll();
  },

  deleteIncrustation: async (id) => {
    await api.delete(`/habillage/incrustations/${id}`);
    await get().fetchAll();
  },

  createBandeau: async (payload) => {
    await api.post('/habillage/bandeaux', payload);
    await get().fetchAll();
  },

  deleteBandeau: async (id) => {
    await api.delete(`/habillage/bandeaux/${id}`);
    await get().fetchAll();
  },
}));
