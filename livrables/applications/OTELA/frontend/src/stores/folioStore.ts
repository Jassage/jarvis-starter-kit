'use client';
import { create } from 'zustand';
import api from '@/lib/api';

export interface LigneFolio {
  id: string;
  departementSource: string;
  description: string;
  montant: string;
  dateHeure: string;
  employe: { id: string; nom: string } | null;
}

export interface Folio {
  id: string;
  statut: 'OUVERT' | 'FERME';
  dateOuverture: string;
  dateFermeture: string | null;
  devise: 'HTG' | 'USD';
  lignes: LigneFolio[];
}

interface FolioState {
  folio: Folio | null;
  isLoading: boolean;
  fetchFolio: (reservationId: string) => Promise<void>;
  reset: () => void;
}

export const useFolioStore = create<FolioState>((set) => ({
  folio: null,
  isLoading: false,

  fetchFolio: async (reservationId) => {
    set({ isLoading: true });
    try {
      const { data } = await api.get(`/folios/${reservationId}`);
      set({ folio: data.data.folio, isLoading: false });
    } catch {
      // Pas de folio (réservation pas encore arrivée) — état normal, pas une erreur.
      set({ folio: null, isLoading: false });
    }
  },

  reset: () => set({ folio: null }),
}));
