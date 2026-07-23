'use client';
import { create } from 'zustand';
import api from '@/lib/api';

export interface ReservationDuJour {
  id: string;
  reference?: string | null;
  dateArrivee: string;
  dateDepart: string;
  client: { nom: string; telephone: string; email: string };
  chambre: { id: string; numero: string; typeChambre: { nom: string } };
  facture?: { montantTotal: string; devise: 'HTG' | 'USD'; paiements: { montant: string }[] } | null;
  signatureUrl?: string | null;
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
  checkin: (reservationId: string, signature: Blob) => Promise<void>;
  checkout: (reservationId: string) => Promise<void>;
  whatsappLog: (reservationId: string, type: string) => Promise<void>;
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

  // Le check-in exige désormais la signature du client (point #8) — envoyée en
  // multipart comme tout autre upload du portefeuille, jamais en JSON base64.
  checkin: async (reservationId, signature) => {
    const form = new FormData();
    form.append('signature', signature, 'signature.png');
    await api.post(`/reception/${reservationId}/checkin`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
    await get().fetchVueDuJour();
  },

  checkout: async (reservationId) => {
    await api.post(`/reception/${reservationId}/checkout`);
    await get().fetchVueDuJour();
  },

  // Consigne qu'un rappel WhatsApp a été déclenché (le lien wa.me est déjà ouvert par
  // l'appelant) — en tâche de fond, ne doit jamais bloquer ni faire échouer l'action
  // pour le personnel si la requête échoue.
  whatsappLog: async (reservationId, type) => {
    try {
      await api.post(`/reservations/${reservationId}/whatsapp-log`, { type });
    } catch {
      /* best-effort — le message a déjà été ouvert côté client */
    }
  },
}));
