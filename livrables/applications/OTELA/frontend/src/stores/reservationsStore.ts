'use client';
import { create } from 'zustand';
import api from '@/lib/api';
import type { TypeSejour } from './chambresStore';

export interface Reservation {
  id: string;
  etablissementId: string;
  chambreId: string;
  clientId: string;
  dateArrivee: string;
  dateDepart: string;
  nombrePersonnes: number;
  devise: 'HTG' | 'USD';
  typeSejour: TypeSejour;
  montantTotal: string;
  statut: 'CONFIRMEE' | 'EN_ATTENTE' | 'ANNULEE' | 'TERMINEE' | 'NO_SHOW';
  dateCreation: string;
  client: { id: string; nom: string; telephone: string; email: string };
  chambre: { id: string; numero: string; typeChambre: { id: string; nom: string } };
  etablissement: { id: string; nom: string };
}

interface ReservationsState {
  reservations: Reservation[];
  isLoading: boolean;
  error: string | null;
  fetchReservations: (filters?: { statut?: string; search?: string; from?: string; to?: string }) => Promise<void>;
  annuler: (id: string) => Promise<void>;
  creerManuelle: (data: {
    etablissementId: string;
    chambreId?: string;
    typeChambreId?: string;
    dateArrivee: string;
    dateDepart: string;
    nombrePersonnes: number;
    devise: 'HTG' | 'USD';
    typeSejour?: TypeSejour;
    client: { nom: string; telephone: string; email: string };
  }) => Promise<void>;
}

export const useReservationsStore = create<ReservationsState>((set, get) => ({
  reservations: [],
  isLoading: false,
  error: null,

  fetchReservations: async (filters) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get('/reservations', { params: filters });
      set({ reservations: data.data.reservations, isLoading: false });
    } catch (e: any) {
      set({ error: e.response?.data?.message || 'Erreur de chargement', isLoading: false });
    }
  },

  annuler: async (id) => {
    await api.patch(`/reservations/${id}/annuler`);
    await get().fetchReservations();
  },

  creerManuelle: async (data) => {
    await api.post('/reservations', data);
    await get().fetchReservations();
  },
}));
