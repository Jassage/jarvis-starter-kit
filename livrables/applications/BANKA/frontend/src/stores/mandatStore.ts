'use client';
import { create } from 'zustand';
import api from '@/lib/api';

export interface Mandat {
  id: string;
  compteId: string;
  mandataireId: string;
  mandataire: {
    id: string;
    nom?: string;
    prenom?: string;
    raisonSociale?: string;
    type: string;
    telephone: string;
    numeroClient: string;
  };
  droits: string[];
  dateDebut: string;
  dateFin?: string;
  actif: boolean;
  notes?: string;
  creePar: { prenom: string; nom: string; role: string };
  createdAt: string;
}

interface MandatState {
  mandats: Mandat[];
  isLoading: boolean;
  fetchMandats: (compteId: string) => Promise<void>;
  createMandat: (compteId: string, data: any) => Promise<void>;
  updateMandat: (compteId: string, mandatId: string, data: any) => Promise<void>;
  revoquerMandat: (compteId: string, mandatId: string) => Promise<void>;
}

export const useMandatStore = create<MandatState>((set) => ({
  mandats: [],
  isLoading: false,

  fetchMandats: async (compteId) => {
    set({ isLoading: true });
    try {
      const { data } = await api.get(`/comptes/${compteId}/mandats`);
      set({ mandats: data.data });
    } finally {
      set({ isLoading: false });
    }
  },

  createMandat: async (compteId, payload) => {
    await api.post(`/comptes/${compteId}/mandats`, payload);
  },

  updateMandat: async (compteId, mandatId, payload) => {
    await api.put(`/comptes/${compteId}/mandats/${mandatId}`, payload);
  },

  revoquerMandat: async (compteId, mandatId) => {
    await api.delete(`/comptes/${compteId}/mandats/${mandatId}`);
  },
}));
