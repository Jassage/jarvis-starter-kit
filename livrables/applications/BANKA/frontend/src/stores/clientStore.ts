'use client';
import { create } from 'zustand';
import api from '@/lib/api';

interface Client {
  id: string;
  numeroClient: string;
  type: string;
  statut: string;
  nom?: string;
  prenom?: string;
  raisonSociale?: string;
  telephone: string;
  email?: string;
  adresse: string;
  _count?: { comptes: number; prets: number };
}

interface ClientState {
  clients: Client[];
  total: number;
  pages: number;
  currentPage: number;
  isLoading: boolean;
  selected: Client | null;
  fetchClients: (opts?: { search?: string; statut?: string; type?: string; page?: number }) => Promise<void>;
  fetchClient: (id: string) => Promise<any>;
  createClient: (data: any) => Promise<any>;
  updateClient: (id: string, data: any) => Promise<any>;
  searchClients: (q: string) => Promise<any[]>;
}

export const useClientStore = create<ClientState>((set) => ({
  clients: [],
  total: 0,
  pages: 1,
  currentPage: 1,
  isLoading: false,
  selected: null,

  fetchClients: async (opts = {}) => {
    set({ isLoading: true });
    try {
      const { data } = await api.get('/clients', { params: { ...opts, limit: 20 } });
      set({ clients: data.data.items, total: data.data.total, pages: data.data.pages, currentPage: opts.page || 1, isLoading: false });
    } catch { set({ isLoading: false }); }
  },

  fetchClient: async (id) => {
    const { data } = await api.get(`/clients/${id}`);
    set({ selected: data.data });
    return data.data;
  },

  createClient: async (payload) => {
    const { data } = await api.post('/clients', payload);
    return data.data;
  },

  updateClient: async (id, payload) => {
    const { data } = await api.put(`/clients/${id}`, payload);
    return data.data;
  },

  searchClients: async (q) => {
    const { data } = await api.get('/clients/search', { params: { q } });
    return data.data;
  },
}));
