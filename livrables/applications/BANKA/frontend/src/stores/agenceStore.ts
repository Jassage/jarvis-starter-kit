'use client';
import { create } from 'zustand';
import api from '@/lib/api';

export interface Agence {
  id: string;
  code: string;
  nom: string;
  adresse?: string;
  telephone?: string;
  actif: boolean;
  createdAt: string;
  _count?: { utilisateurs: number; comptes: number; prets: number };
}

interface AgenceState {
  agences: Agence[];
  isLoading: boolean;
  fetchAgences: () => Promise<void>;
  createAgence: (data: any) => Promise<Agence>;
  updateAgence: (id: string, data: any) => Promise<Agence>;
}

export const useAgenceStore = create<AgenceState>((set, get) => ({
  agences: [],
  isLoading: false,

  fetchAgences: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.get('/agences');
      set({ agences: data.data, isLoading: false });
    } catch { set({ isLoading: false }); }
  },

  createAgence: async (payload) => {
    const { data } = await api.post('/agences', payload);
    const created = data.data as Agence;
    set({ agences: [...get().agences, created] });
    return created;
  },

  updateAgence: async (id, payload) => {
    const { data } = await api.put(`/agences/${id}`, payload);
    const updated = data.data as Agence;
    set({ agences: get().agences.map((a) => (a.id === id ? updated : a)) });
    return updated;
  },
}));
