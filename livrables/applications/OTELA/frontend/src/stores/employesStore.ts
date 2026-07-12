'use client';
import { create } from 'zustand';
import api from '@/lib/api';
import type { RoleEmploye } from '@/lib/api';

export interface Employe {
  id: string;
  nom: string;
  email: string;
  role: RoleEmploye;
  etablissementId: string | null;
  isActive: boolean;
  createdAt: string;
}

interface EmployesState {
  employes: Employe[];
  isLoading: boolean;
  error: string | null;
  fetchAll: (etablissementId?: string) => Promise<void>;
  creer: (data: { nom: string; email: string; password: string; role: RoleEmploye; etablissementId?: string | null }) => Promise<void>;
  update: (id: string, data: Partial<{ nom: string; role: RoleEmploye; isActive: boolean }>) => Promise<void>;
  reinitialiserMotDePasse: (id: string, nouveauMotDePasse: string) => Promise<void>;
}

export const useEmployesStore = create<EmployesState>((set, get) => ({
  employes: [],
  isLoading: false,
  error: null,

  fetchAll: async (etablissementId) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get('/employes', { params: etablissementId ? { etablissementId } : undefined });
      set({ employes: data.data.employes, isLoading: false });
    } catch (e: any) {
      set({ error: e.response?.data?.message || 'Erreur de chargement', isLoading: false });
    }
  },

  creer: async (data) => {
    await api.post('/employes', data);
    await get().fetchAll();
  },

  update: async (id, data) => {
    await api.patch(`/employes/${id}`, data);
    await get().fetchAll();
  },

  reinitialiserMotDePasse: async (id, nouveauMotDePasse) => {
    await api.post(`/employes/${id}/reinitialiser-mot-de-passe`, { nouveauMotDePasse });
  },
}));
