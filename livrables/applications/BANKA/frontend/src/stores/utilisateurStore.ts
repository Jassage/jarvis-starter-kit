'use client';
import { create } from 'zustand';
import api from '@/lib/api';

export interface Utilisateur {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  role: string;
  actif: boolean;
  telephone?: string;
  agenceId?: string;
  agence?: { id: string; code: string; nom: string } | null;
  createdAt: string;
}

interface UtilisateurState {
  utilisateurs: Utilisateur[];
  isLoading: boolean;
  fetchUtilisateurs: (agenceId?: string) => Promise<void>;
  createUtilisateur: (data: any) => Promise<Utilisateur>;
  updateUtilisateur: (id: string, data: any) => Promise<Utilisateur>;
  toggleActif: (id: string, actif: boolean) => Promise<void>;
}

export const useUtilisateurStore = create<UtilisateurState>((set, get) => ({
  utilisateurs: [],
  isLoading: false,

  fetchUtilisateurs: async (agenceId) => {
    set({ isLoading: true });
    try {
      const { data } = await api.get('/auth/utilisateurs', { params: agenceId ? { agenceId } : {} });
      set({ utilisateurs: data.data, isLoading: false });
    } catch { set({ isLoading: false }); }
  },

  createUtilisateur: async (payload) => {
    const { data } = await api.post('/auth/utilisateurs', payload);
    const created = data.data as Utilisateur;
    set({ utilisateurs: [...get().utilisateurs, created] });
    return created;
  },

  updateUtilisateur: async (id, payload) => {
    const { data } = await api.put(`/auth/utilisateurs/${id}`, payload);
    const updated = data.data as Utilisateur;
    set({ utilisateurs: get().utilisateurs.map((u) => (u.id === id ? updated : u)) });
    return updated;
  },

  toggleActif: async (id, actif) => {
    await api.put(`/auth/utilisateurs/${id}`, { actif });
    set({ utilisateurs: get().utilisateurs.map((u) => (u.id === id ? { ...u, actif } : u)) });
  },
}));
