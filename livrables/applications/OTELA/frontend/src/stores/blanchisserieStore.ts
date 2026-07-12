'use client';
import { create } from 'zustand';
import api from '@/lib/api';

export type StatutBlanchisserie = 'RECUE' | 'EN_TRAITEMENT' | 'PRETE' | 'LIVREE';

export interface CommandeBlanchisserie {
  id: string;
  articles: string;
  montant: string;
  devise: 'HTG' | 'USD';
  statut: StatutBlanchisserie;
  createdAt: string;
  chambre: { id: string; numero: string };
}

interface BlanchisserieState {
  commandes: CommandeBlanchisserie[];
  isLoading: boolean;
  fetchCommandes: () => Promise<void>;
  creerCommande: (data: { chambreId: string; articles: string; montant: number; devise: 'HTG' | 'USD' }) => Promise<void>;
  updateStatut: (id: string, statut: StatutBlanchisserie) => Promise<void>;
}

export const useBlanchisserieStore = create<BlanchisserieState>((set, get) => ({
  commandes: [],
  isLoading: false,

  fetchCommandes: async () => {
    set({ isLoading: true });
    const { data } = await api.get('/blanchisserie/commandes');
    set({ commandes: data.data.commandes, isLoading: false });
  },

  creerCommande: async (data) => {
    await api.post('/blanchisserie/commandes', data);
    await get().fetchCommandes();
  },

  updateStatut: async (id, statut) => {
    await api.patch(`/blanchisserie/commandes/${id}/statut`, { statut });
    await get().fetchCommandes();
  },
}));
