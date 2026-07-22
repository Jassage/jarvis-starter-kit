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

export interface PhotoChambre {
  id: string;
  url: string;
  legende: string | null;
  ordre: number;
  estPrincipale: boolean;
}

export interface TypeChambre {
  id: string;
  nom: string;
  capaciteMax: number;
  description: string | null;
  nombreLits: number;
  equipements: string[];
  superficie: number | null;
  tarifs: Tarif[];
  photos: PhotoChambre[];
}

export type StatutChambre = 'DISPONIBLE' | 'RESERVEE' | 'OCCUPEE' | 'MAINTENANCE' | 'NETTOYAGE_EN_COURS';

export interface Chambre {
  id: string;
  numero: string;
  statut: StatutChambre;
  typeChambre: { id: string; nom: string };
}

interface TypeChambreInput {
  nom: string;
  capaciteMax: number;
  description?: string;
  nombreLits?: number;
  equipements?: string[];
  superficie?: number | null;
}

interface ChambresState {
  types: TypeChambre[];
  chambres: Chambre[];
  isLoading: boolean;
  error: string | null;
  fetchAll: () => Promise<void>;
  creerType: (data: TypeChambreInput) => Promise<void>;
  majType: (id: string, data: Partial<TypeChambreInput>) => Promise<void>;
  creerTarif: (typeChambreId: string, data: { devise: 'HTG' | 'USD'; typeSejour: TypeSejour; montant: number; dateDebutSaison: string; dateFinSaison: string }) => Promise<void>;
  creerChambre: (data: { typeChambreId: string; numero: string }) => Promise<void>;
  toggleMaintenance: (id: string, enMaintenance: boolean) => Promise<void>;
  ajouterPhotos: (typeChambreId: string, files: File[], legendes?: string[]) => Promise<void>;
  modifierPhoto: (photoId: string, data: { legende?: string | null; ordre?: number; estPrincipale?: boolean }) => Promise<void>;
  supprimerPhoto: (photoId: string) => Promise<void>;
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

  majType: async (id, data) => {
    await api.patch(`/chambres/types/${id}`, data);
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

  // Passe par l'endpoint dédié /maintenance (accessible au rôle MAINTENANCE), pas par
  // le PATCH générique réservé à la direction.
  toggleMaintenance: async (id, enMaintenance) => {
    await api.patch(`/chambres/${id}/maintenance`, { enMaintenance });
    await get().fetchAll();
  },

  ajouterPhotos: async (typeChambreId, files, legendes) => {
    const form = new FormData();
    files.forEach((f) => form.append('photos', f));
    (legendes ?? []).forEach((l) => form.append('legendes', l));
    await api.post(`/chambres/types/${typeChambreId}/photos`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
    await get().fetchAll();
  },

  modifierPhoto: async (photoId, data) => {
    await api.patch(`/chambres/photos/${photoId}`, data);
    await get().fetchAll();
  },

  supprimerPhoto: async (photoId) => {
    await api.delete(`/chambres/photos/${photoId}`);
    await get().fetchAll();
  },
}));
