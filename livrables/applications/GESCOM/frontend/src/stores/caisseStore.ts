'use client';
import { create } from 'zustand';
import api from '@/lib/api';

export interface SessionCaisse {
  id: string;
  emplacementId: string;
  statut: 'OUVERTE' | 'FERMEE';
  soldeOuverture: string;
  soldeTheorique?: string | null;
  soldeFermeture?: string | null;
  ecartConstate?: string | null;
  notes?: string | null;
  emplacement: { nom: string; type: string };
  ouvertPar: { nom: string; prenom: string };
  fermePar?: { nom: string; prenom: string } | null;
  dateOuverture: string;
  dateFermeture?: string | null;
  soldeAttenduActuel?: number;
  _count?: { ventes: number };
}

interface CaisseState {
  sessionActive: SessionCaisse | null;
  historique: SessionCaisse[];
  isLoading: boolean;
  fetchActive: (emplacementId: string) => Promise<void>;
  fetchHistorique: (emplacementId?: string) => Promise<void>;
  ouvrir: (data: { emplacementId: string; soldeOuverture: number; notes?: string }) => Promise<void>;
  fermer: (id: string, soldeFermeture: number, notes?: string) => Promise<void>;
}

export const useCaisseStore = create<CaisseState>((set, get) => ({
  sessionActive: null,
  historique: [],
  isLoading: false,

  fetchActive: async (emplacementId) => {
    set({ isLoading: true });
    try {
      const { data } = await api.get('/caisse/active', { params: { emplacementId } });
      set({ sessionActive: data.data, isLoading: false });
    } catch (e) {
      set({ isLoading: false });
      throw e;
    }
  },

  fetchHistorique: async (emplacementId) => {
    const { data } = await api.get('/caisse', { params: { emplacementId } });
    set({ historique: data.data.items });
  },

  ouvrir: async (payload) => {
    await api.post('/caisse/ouvrir', payload);
    await get().fetchActive(payload.emplacementId);
    await get().fetchHistorique(payload.emplacementId);
  },

  fermer: async (id, soldeFermeture, notes) => {
    const emplacementId = get().sessionActive?.emplacementId;
    await api.patch(`/caisse/${id}/fermer`, { soldeFermeture, notes });
    if (emplacementId) {
      await get().fetchActive(emplacementId);
      await get().fetchHistorique(emplacementId);
    }
  },
}));
