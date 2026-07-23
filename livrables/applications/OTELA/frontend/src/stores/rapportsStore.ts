'use client';
import { create } from 'zustand';
import api from '@/lib/api';

export interface FacturationParDevise {
  facture: number;
  paye: number;
  impaye: number;
}

export interface RepartitionType {
  typeChambreId: string;
  nom: string;
  nuitsOccupees: number;
  revenuHTG: number;
  revenuUSD: number;
}

export interface RapportOccupation {
  nbChambres: number;
  nuitsOccupees: number;
  nuitsDisponibles: number;
  tauxOccupation: number;
  revenuParDevise: { HTG: number; USD: number };
  adrParDevise: { HTG: number; USD: number };
  revparParDevise: { HTG: number; USD: number };
  repartitionParType: RepartitionType[];
  facturation: { HTG: FacturationParDevise; USD: FacturationParDevise };
}

export interface RapportChaine {
  parEtablissement: (RapportOccupation & { etablissementId: string; nom: string })[];
  totalParDevise: { HTG: number; USD: number };
  totalFacturationParDevise: { HTG: FacturationParDevise; USD: FacturationParDevise };
}

export interface PointSerie {
  date: string;
  nuitsOccupees: number;
  revenuHTG: number;
  revenuUSD: number;
}

export interface SerieJournaliere {
  nbChambres: number;
  serie: PointSerie[];
}

interface RapportsState {
  rapportEtablissement: RapportOccupation | null;
  rapportChaine: RapportChaine | null;
  serieJournaliere: SerieJournaliere | null;
  isLoading: boolean;
  error: string | null;
  fetchRapportEtablissement: (from?: string, to?: string) => Promise<void>;
  fetchRapportChaine: (from?: string, to?: string) => Promise<void>;
  fetchSerieJournaliere: (from?: string, to?: string) => Promise<void>;
  exporter: (cible: 'etablissement' | 'chaine', from?: string, to?: string) => Promise<void>;
}

export const useRapportsStore = create<RapportsState>((set) => ({
  rapportEtablissement: null,
  rapportChaine: null,
  serieJournaliere: null,
  isLoading: false,
  error: null,

  fetchRapportEtablissement: async (from, to) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get('/rapports/etablissement', { params: { from, to } });
      set({ rapportEtablissement: data.data.rapport, isLoading: false });
    } catch (e: any) {
      set({ error: e.response?.data?.message || 'Erreur de chargement', isLoading: false });
    }
  },

  fetchRapportChaine: async (from, to) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get('/rapports/chaine', { params: { from, to } });
      set({ rapportChaine: data.data.rapport, isLoading: false });
    } catch (e: any) {
      set({ error: e.response?.data?.message || 'Erreur de chargement', isLoading: false });
    }
  },

  fetchSerieJournaliere: async (from, to) => {
    try {
      const { data } = await api.get('/rapports/etablissement/serie', { params: { from, to } });
      set({ serieJournaliere: { nbChambres: data.data.nbChambres, serie: data.data.serie } });
    } catch {
      set({ serieJournaliere: null });
    }
  },

  // Téléchargement authentifié en blob (l'export porte le token, contrairement à un
  // lien direct) — même pattern que FactureModal.tsx::telechargerPdf.
  exporter: async (cible, from, to) => {
    const url = cible === 'etablissement' ? '/rapports/etablissement/export.xlsx' : '/rapports/chaine/export.xlsx';
    const { data } = await api.get(url, { params: { from, to }, responseType: 'blob' });
    const blobUrl = URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = cible === 'etablissement' ? 'rapport-etablissement.xlsx' : 'rapport-chaine.xlsx';
    a.click();
    URL.revokeObjectURL(blobUrl);
  },
}));
