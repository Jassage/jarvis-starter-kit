'use client';
import { create } from 'zustand';
import api from '@/lib/api';

interface PretState {
  prets: any[];
  total: number;
  pages: number;
  isLoading: boolean;
  selected: any | null;
  fetchPrets: (opts?: any) => Promise<void>;
  fetchPret: (id: string) => Promise<any>;
  createPret: (data: any) => Promise<any>;
  approuver: (id: string) => Promise<any>;
  rejeter: (id: string, notes?: string) => Promise<any>;
  annuler: (id: string, notes?: string) => Promise<any>;
  decaisser: (id: string, data: any) => Promise<any>;
  rembourser: (id: string, data: any) => Promise<any>;
}

export const usePretStore = create<PretState>((set) => ({
  prets: [],
  total: 0,
  pages: 1,
  isLoading: false,
  selected: null,

  fetchPrets: async (opts = {}) => {
    set({ isLoading: true });
    try {
      const { data } = await api.get('/prets', { params: opts });
      set({ prets: data.data.items, total: data.data.total, pages: data.data.pages, isLoading: false });
    } catch (err) { set({ isLoading: false }); throw err; }
  },

  fetchPret: async (id) => {
    const { data } = await api.get(`/prets/${id}`);
    set({ selected: data.data });
    return data.data;
  },

  createPret: async (payload) => {
    const { data } = await api.post('/prets', payload);
    return data.data;
  },

  approuver: async (id) => {
    const { data } = await api.patch(`/prets/${id}/approuver`);
    return data.data;
  },

  rejeter: async (id, notes) => {
    const { data } = await api.patch(`/prets/${id}/rejeter`, { notes });
    return data.data;
  },

  annuler: async (id, notes) => {
    const { data } = await api.patch(`/prets/${id}/annuler`, { notes });
    return data.data;
  },

  decaisser: async (id, payload) => {
    const { data } = await api.patch(`/prets/${id}/decaisser`, payload);
    return data.data;
  },

  rembourser: async (id, payload) => {
    const { data } = await api.post(`/prets/${id}/remboursement`, payload);
    return data.data;
  },
}));
