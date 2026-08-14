'use client';
import { create } from 'zustand';
import api from '@/lib/api';
import type { Role } from './authStore';

export interface Utilisateur {
  id: string;
  email: string;
  nom: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
}

export interface LienReinitialisation {
  lien: string;
  expiresAt: string;
  utilisateur: { id: string; email: string; nom: string };
}

interface UtilisateurState {
  utilisateurs: Utilisateur[];
  isLoading: boolean;
  fetchUtilisateurs: () => Promise<void>;
  createUtilisateur: (data: { email: string; nom: string; password: string; role: Role }) => Promise<void>;
  updateUtilisateur: (id: string, data: { nom?: string; role?: Role; isActive?: boolean }) => Promise<void>;
  genererLien: (id: string) => Promise<LienReinitialisation>;
}

export const useUtilisateurStore = create<UtilisateurState>((set, get) => ({
  utilisateurs: [],
  isLoading: false,

  fetchUtilisateurs: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.get('/utilisateurs');
      set({ utilisateurs: data.data.utilisateurs, isLoading: false });
    } catch (e) {
      set({ isLoading: false });
      throw e;
    }
  },

  createUtilisateur: async (payload) => {
    await api.post('/utilisateurs', payload);
    await get().fetchUtilisateurs();
  },

  updateUtilisateur: async (id, payload) => {
    await api.patch(`/utilisateurs/${id}`, payload);
    await get().fetchUtilisateurs();
  },

  genererLien: async (id) => {
    const { data } = await api.post(`/utilisateurs/${id}/lien-reinitialisation`, {});
    return data.data as LienReinitialisation;
  },
}));
