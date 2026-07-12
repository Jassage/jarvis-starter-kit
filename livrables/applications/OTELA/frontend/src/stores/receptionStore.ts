'use client';
import { create } from 'zustand';
import api from '@/lib/api';

export interface ReservationDuJour {
  id: string;
  dateArrivee: string;
  dateDepart: string;
  client: { nom: string; telephone: string; email: string };
  chambre: { id: string; numero: string; typeChambre: { nom: string } };
  facture?: { montantTotal: string; devise: 'HTG' | 'USD'; paiements: { montant: string }[] } | null;
}

interface ChambreStatutCount {
  statut: string;
  count: number;
}

interface ReceptionState {
  arrivees: ReservationDuJour[];
  departs: ReservationDuJour[];
  chambresParStatut: ChambreStatutCount[];
  isLoading: boolean;
  error: string | null;
  fetchVueDuJour: () => Promise<void>;
  checkin: (reservationId: string) => Promise<void>;
  checkout: (reservationId: string) => Promise<void>;
}

export const useReceptionStore = create<ReceptionState>((set, get) => ({
  arrivees: [],
  departs: [],
  chambresParStatut: [],
  isLoading: false,
  error: null,

  fetchVueDuJour: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get('/reception/vue-du-jour');
      set({
        arrivees: data.data.arrivees,
        departs: data.data.departs,
        chambresParStatut: data.data.chambresParStatut,
        isLoading: false,
      });
    } catch (e: any) {
      set({ error: e.response?.data?.message || 'Erreur de chargement', isLoading: false });
    }
  },

  checkin: async (reservationId) => {
    await api.post(`/reception/${reservationId}/checkin`);
    await get().fetchVueDuJour();
  },

  checkout: async (reservationId) => {
    await api.post(`/reception/${reservationId}/checkout`);
    await get().fetchVueDuJour();
  },
}));
