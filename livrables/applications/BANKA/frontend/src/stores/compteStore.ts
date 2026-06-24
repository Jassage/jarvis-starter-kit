'use client';
import { create } from 'zustand';
import api from '@/lib/api';

interface Compte {
  id: string;
  numeroCompte: string;
  type: string;
  devise: string;
  solde: number;
  statut: string;
  clientId: string;
  client?: any;
  agence?: any;
}

interface CompteState {
  comptes: Compte[];
  total: number;
  pages: number;
  isLoading: boolean;
  selected: any | null;
  releve: { compte: any; transactions: any[]; total: number; pages: number } | null;
  fetchComptes: (opts?: any) => Promise<void>;
  searchComptes: (query: string, statut?: string) => Promise<Compte[]>;
  fetchCompte: (id: string) => Promise<any>;
  fetchReleve: (id: string, opts?: any) => Promise<void>;
  createCompte: (data: any) => Promise<any>;
  updateCompte: (id: string, data: any) => Promise<any>;
}

export const useCompteStore = create<CompteState>((set) => ({
  comptes: [],
  total: 0,
  pages: 1,
  isLoading: false,
  selected: null,
  releve: null,

  fetchComptes: async (opts = {}) => {
    set({ isLoading: true });
    try {
      const { data } = await api.get('/comptes', { params: { ...opts, limit: 20 } });
      set({ comptes: data.data.items, total: data.data.total, pages: data.data.pages, isLoading: false });
    } catch { set({ isLoading: false }); }
  },

  searchComptes: async (query: string, statut = 'ACTIF') => {
    try {
      const { data } = await api.get('/comptes', { params: { search: query, statut, limit: 10 } });
      return data.data.items as Compte[];
    } catch { return []; }
  },

  fetchCompte: async (id) => {
    const { data } = await api.get(`/comptes/${id}`);
    set({ selected: data.data });
    return data.data;
  },

  fetchReleve: async (id, opts = {}) => {
    const { data } = await api.get(`/comptes/${id}/releve`, { params: opts });
    set({ releve: data.data });
  },

  createCompte: async (payload) => {
    const { data } = await api.post('/comptes', payload);
    return data.data;
  },

  updateCompte: async (id, payload) => {
    const { data } = await api.put(`/comptes/${id}`, payload);
    return data.data;
  },
}));
