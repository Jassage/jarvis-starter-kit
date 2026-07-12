'use client';
import { create } from 'zustand';
import api from '@/lib/api';

export type StatutConciergerie = 'RECUE' | 'EN_COURS' | 'TERMINEE';

export interface DemandeConciergerie {
  id: string;
  description: string;
  statut: StatutConciergerie;
  dateHeure: string;
  montant: string | null;
  chambre: { id: string; numero: string };
  employeAssigne: { id: string; nom: string } | null;
}

interface ConciergerieState {
  demandes: DemandeConciergerie[];
  isLoading: boolean;
  fetchDemandes: () => Promise<void>;
  creerDemande: (data: { chambreId: string; description: string }) => Promise<void>;
  assigner: (id: string, employeAssigneId: string) => Promise<void>;
  terminer: (id: string, montant?: number) => Promise<void>;
}

export const useConciergerieStore = create<ConciergerieState>((set, get) => ({
  demandes: [],
  isLoading: false,

  fetchDemandes: async () => {
    set({ isLoading: true });
    const { data } = await api.get('/conciergerie/demandes');
    set({ demandes: data.data.demandes, isLoading: false });
  },

  creerDemande: async (data) => {
    await api.post('/conciergerie/demandes', data);
    await get().fetchDemandes();
  },

  assigner: async (id, employeAssigneId) => {
    await api.patch(`/conciergerie/demandes/${id}/assigner`, { employeAssigneId });
    await get().fetchDemandes();
  },

  terminer: async (id, montant) => {
    await api.post(`/conciergerie/demandes/${id}/terminer`, montant ? { montant } : {});
    await get().fetchDemandes();
  },
}));
