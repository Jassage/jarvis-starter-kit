'use client';
import { create } from 'zustand';
import api from '@/lib/api';

export interface Fournisseur {
  id: string;
  nom: string;
  telephone?: string | null;
  adresse?: string | null;
  actif: boolean;
}

interface FournisseurState {
  fournisseurs: Fournisseur[];
  fetchFournisseurs: (search?: string) => Promise<void>;
  createFournisseur: (data: { nom: string; telephone?: string; adresse?: string }) => Promise<void>;
  updateFournisseur: (id: string, data: Partial<{ nom: string; telephone: string; adresse: string }>) => Promise<void>;
  archiveFournisseur: (id: string) => Promise<void>;
}

export const useFournisseurStore = create<FournisseurState>((set, get) => ({
  fournisseurs: [],

  fetchFournisseurs: async (search) => {
    const { data } = await api.get('/fournisseurs', { params: search ? { search } : undefined });
    set({ fournisseurs: data.data });
  },

  createFournisseur: async (payload) => {
    await api.post('/fournisseurs', payload);
    await get().fetchFournisseurs();
  },

  updateFournisseur: async (id, payload) => {
    await api.put(`/fournisseurs/${id}`, payload);
    await get().fetchFournisseurs();
  },

  archiveFournisseur: async (id) => {
    await api.delete(`/fournisseurs/${id}`);
    await get().fetchFournisseurs();
  },
}));
