'use client';
import { create } from 'zustand';
import api from '@/lib/api';

export interface Etablissement {
  id: string;
  nom: string;
  adresse: string;
  commune: string;
  departement: string;
  devisesAcceptees: ('HTG' | 'USD')[];
  devisePrincipale?: 'HTG' | 'USD';
  actif: boolean;
  logoUrl?: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
  telephone?: string | null;
  email?: string | null;
  siteWeb?: string | null;
  description?: string | null;
  equipements?: string[];
  heureCheckIn?: string;
  heureCheckOut?: string;
  politiqueAnnulation?: string | null;
  fuseauHoraire?: string;
}

// Champs modifiables de la fiche (hors nom/adresse gérés au niveau chaîne).
export type FicheEtablissementInput = Partial<Pick<Etablissement,
  'devisesAcceptees' | 'devisePrincipale' | 'telephone' | 'email' | 'siteWeb' | 'description' |
  'equipements' | 'heureCheckIn' | 'heureCheckOut' | 'politiqueAnnulation' | 'fuseauHoraire'>> & {
  latitude?: number | null;
  longitude?: number | null;
};

interface EtablissementsState {
  etablissements: Etablissement[];
  isLoading: boolean;
  error: string | null;
  fetchAll: () => Promise<void>;
  creer: (data: { nom: string; adresse: string; commune: string; departement: string; devisesAcceptees: ('HTG' | 'USD')[] }) => Promise<void>;
  toggleActif: (id: string, actif: boolean) => Promise<void>;
  majFiche: (id: string, data: FicheEtablissementInput) => Promise<Etablissement>;
  uploadLogo: (id: string, file: File) => Promise<Etablissement>;
}

export const useEtablissementsStore = create<EtablissementsState>((set, get) => ({
  etablissements: [],
  isLoading: false,
  error: null,

  fetchAll: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get('/etablissements', { params: { actifOnly: 'false' } });
      set({ etablissements: data.data.etablissements, isLoading: false });
    } catch (e: any) {
      set({ error: e.response?.data?.message || 'Erreur de chargement', isLoading: false });
    }
  },

  creer: async (data) => {
    await api.post('/etablissements', data);
    await get().fetchAll();
  },

  toggleActif: async (id, actif) => {
    await api.patch(`/etablissements/${id}`, { actif });
    await get().fetchAll();
  },

  majFiche: async (id, data) => {
    const { data: res } = await api.patch(`/etablissements/${id}`, data);
    await get().fetchAll();
    return res.data.etablissement as Etablissement;
  },

  uploadLogo: async (id, file) => {
    const form = new FormData();
    form.append('logo', file);
    // Content-Type multipart posé automatiquement par le navigateur (avec la boundary).
    const { data: res } = await api.post(`/etablissements/${id}/logo`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    await get().fetchAll();
    return res.data.etablissement as Etablissement;
  },
}));
