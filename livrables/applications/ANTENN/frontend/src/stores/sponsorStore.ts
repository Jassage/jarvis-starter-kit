'use client';
import { create } from 'zustand';
import api from '@/lib/api';

export type TypePackageSponsor = 'TITRE_MATCH' | 'BANDEAU' | 'HABILLAGE_PERMANENT';

export interface Sponsor {
  id: string;
  nomSponsor: string;
  logoUrl: string | null;
  typePackage: TypePackageSponsor;
  contactNom: string | null;
  contactTelephone: string | null;
  dateDebutContrat: string;
  dateFinContrat: string;
  joursRestantsContrat: number;
  contratExpireBientot: boolean;
  contratExpire: boolean;
}

export interface SponsorInput {
  nomSponsor: string;
  typePackage: TypePackageSponsor;
  contactNom?: string | null;
  contactTelephone?: string | null;
  dateDebutContrat: string;
  dateFinContrat: string;
}

interface SponsorState {
  sponsors: Sponsor[];
  isLoading: boolean;
  fetchSponsors: () => Promise<void>;
  createSponsor: (data: SponsorInput) => Promise<void>;
  updateSponsor: (id: string, data: Partial<SponsorInput>) => Promise<void>;
  deleteSponsor: (id: string) => Promise<void>;
  uploadLogo: (id: string, file: File) => Promise<void>;
}

export const useSponsorStore = create<SponsorState>((set, get) => ({
  sponsors: [],
  isLoading: false,

  fetchSponsors: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.get('/sponsors');
      set({ sponsors: data.data.sponsors, isLoading: false });
    } catch (e) {
      set({ isLoading: false });
      throw e;
    }
  },

  createSponsor: async (payload) => {
    await api.post('/sponsors', payload);
    await get().fetchSponsors();
  },

  updateSponsor: async (id, payload) => {
    await api.patch(`/sponsors/${id}`, payload);
    await get().fetchSponsors();
  },

  deleteSponsor: async (id) => {
    await api.delete(`/sponsors/${id}`);
    await get().fetchSponsors();
  },

  uploadLogo: async (id, file) => {
    const form = new FormData();
    form.append('logo', file);
    await api.post(`/sponsors/${id}/logo`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
    await get().fetchSponsors();
  },
}));
