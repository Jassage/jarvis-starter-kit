'use client';
import { create } from 'zustand';
import api from '@/lib/api';

export type StatutTache = 'A_FAIRE' | 'EN_COURS' | 'TERMINE';

export interface TacheMenage {
  id: string;
  statut: StatutTache;
  dateAssignation: string;
  chambre: { numero: string; typeChambre: { nom: string } };
  employeAssigne: { id: string; nom: string } | null;
}

interface EmployeMenage {
  id: string;
  nom: string;
}

interface MenageState {
  taches: TacheMenage[];
  employes: EmployeMenage[];
  isLoading: boolean;
  error: string | null;
  fetchTaches: (statut?: string) => Promise<void>;
  fetchEmployes: () => Promise<void>;
  updateTache: (id: string, data: { statut?: StatutTache; employeAssigneId?: string | null }) => Promise<void>;
}

export const useMenageStore = create<MenageState>((set, get) => ({
  taches: [],
  employes: [],
  isLoading: false,
  error: null,

  fetchTaches: async (statut) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get('/menage/taches', { params: statut ? { statut } : undefined });
      set({ taches: data.data.taches, isLoading: false });
    } catch (e: any) {
      set({ error: e.response?.data?.message || 'Erreur de chargement', isLoading: false });
    }
  },

  fetchEmployes: async () => {
    const { data } = await api.get('/menage/employes');
    set({ employes: data.data.employes });
  },

  updateTache: async (id, data) => {
    await api.patch(`/menage/taches/${id}`, data);
    await get().fetchTaches();
  },
}));
