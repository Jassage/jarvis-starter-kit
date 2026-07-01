'use client';
import { create } from 'zustand';
import api from '@/lib/api';

export interface Client {
  id: string;
  nom: string;
  telephone?: string | null;
  adresse?: string | null;
  type: 'PARTICULIER' | 'GROSSISTE';
  soldeDu: string;
  actif: boolean;
}

export interface ClientInput {
  nom: string;
  telephone?: string;
  adresse?: string;
  type: 'PARTICULIER' | 'GROSSISTE';
}

interface ClientState {
  clients: Client[];
  isLoading: boolean;
  fetchClients: (search?: string) => Promise<void>;
  createClient: (data: ClientInput) => Promise<void>;
  updateClient: (id: string, data: Partial<ClientInput>) => Promise<void>;
  archiveClient: (id: string) => Promise<void>;
}

export const useClientStore = create<ClientState>((set, get) => ({
  clients: [],
  isLoading: false,

  fetchClients: async (search) => {
    set({ isLoading: true });
    try {
      const { data } = await api.get('/clients', { params: search ? { search } : undefined });
      set({ clients: data.data, isLoading: false });
    } catch (e) {
      set({ isLoading: false });
      throw e;
    }
  },

  createClient: async (payload) => {
    await api.post('/clients', payload);
    await get().fetchClients();
  },

  updateClient: async (id, payload) => {
    await api.put(`/clients/${id}`, payload);
    await get().fetchClients();
  },

  archiveClient: async (id) => {
    await api.delete(`/clients/${id}`);
    await get().fetchClients();
  },
}));
