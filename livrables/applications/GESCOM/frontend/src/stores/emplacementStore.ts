'use client';
import { create } from 'zustand';
import api from '@/lib/api';

export interface Emplacement {
  id: string;
  nom: string;
  type: 'BOUTIQUE' | 'ENTREPOT';
  adresse?: string | null;
  actif: boolean;
}

interface EmplacementState {
  emplacements: Emplacement[];
  isLoading: boolean;
  fetchEmplacements: () => Promise<void>;
}

export const useEmplacementStore = create<EmplacementState>((set) => ({
  emplacements: [],
  isLoading: false,
  fetchEmplacements: async () => {
    set({ isLoading: true });
    const { data } = await api.get('/emplacements');
    set({ emplacements: data.data, isLoading: false });
  },
}));
