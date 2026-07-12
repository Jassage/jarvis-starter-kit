'use client';
import { create } from 'zustand';
import api from '@/lib/api';

export type TypeSejour = 'NUITEE' | 'JOUR';

export interface Tarif {
  id: string;
  devise: 'HTG' | 'USD';
  typeSejour: TypeSejour;
  montant: string;
  dateDebutSaison: string;
  dateFinSaison: string;
}

export interface TypeChambre {
  id: string;
  nom: string;
  capaciteMax: number;
  description: string | null;
  tarifs: Tarif[];
}

export type StatutChambre = 'DISPONIBLE' | 'OCCUPEE' | 'MAINTENANCE' | 'NETTOYAGE_EN_COURS';

export interface Chambre {
  id: string;
  numero: string;
  statut: StatutChambre;
  typeChambre: { id: string; nom: string };
}

interface ChambresState {
  types: TypeChambre[];
  chambres: Chambre[];
  isLoading: boolean;
  error: string | null;
  fetchAll: () => Promise<void>;
  creerType: (data: { nom: string; capaciteMax: number; description?: string }) => Promise<void>;
  creerTarif: (typeChambreId: string, data: { devise: 'HTG' | 'USD'; typeSejour: TypeSejour; montant: number; dateDebutSaison: string; dateFinSaison: string }) => Promise<void>;
  creerChambre: (data: { typeChambreId: string; numero: string }) => Promise<void>;
  toggleMaintenance: (id: string, statut: 'DISPONIBLE' | 'MAINTENANCE') => Promise<void>;
}

export const useChambresStore = create<ChambresState>((set, get) => ({
  types: [],
  chambres: [],
  isLoading: false,
  error: null,

  fetchAll: async () => {
    set({ isLoading: true, error: null });
    try {
      const [typesRes, chambresRes] = await Promise.all([
        api.get('/chambres/types'),
        api.get('/chambres'),
      ]);
      set({ types: typesRes.data.data.types, chambres: chambresRes.data.data.chambres, isLoading: false });
    } catch (e: any) {
      set({ error: e.response?.data?.message || 'Erreur de chargement', isLoading: false });
    }
  },

  creerType: async (data) => {
    await api.post('/chambres/types', data);
    await get().fetchAll();
  },

  creerTarif: async (typeChambreId, data) => {
    await api.post(`/chambres/types/${typeChambreId}/tarifs`, data);
    await get().fetchAll();
  },

  creerChambre: async (data) => {
    await api.post('/chambres', data);
    await get().fetchAll();
  },

  toggleMaintenance: async (id, statut) => {
    await api.patch(`/chambres/${id}`, { statut });
    await get().fetchAll();
  },
}));
