'use client';
import { create } from 'zustand';
import api from '@/lib/api';

interface TransactionState {
  transactions: any[];
  total: number;
  pages: number;
  isLoading: boolean;
  fetchTransactions: (opts?: any) => Promise<void>;
  depot: (data: any) => Promise<any>;
  retrait: (data: any) => Promise<any>;
  virement: (data: any) => Promise<any>;
  valider: (id: string) => Promise<any>;
  rejeter: (id: string, motif?: string) => Promise<any>;
}

export const useTransactionStore = create<TransactionState>((set) => ({
  transactions: [],
  total: 0,
  pages: 1,
  isLoading: false,

  fetchTransactions: async (opts = {}) => {
    set({ isLoading: true });
    try {
      const { data } = await api.get('/transactions', { params: opts });
      set({ transactions: data.data.items, total: data.data.total, pages: data.data.pages, isLoading: false });
    } catch (err) { set({ isLoading: false }); throw err; }
  },

  depot: async (payload) => {
    const { data } = await api.post('/transactions/depot', payload);
    return data.data;
  },

  retrait: async (payload) => {
    const { data } = await api.post('/transactions/retrait', payload);
    return data.data;
  },

  virement: async (payload) => {
    const { data } = await api.post('/transactions/virement', payload);
    return data.data;
  },

  valider: async (id) => {
    const { data } = await api.patch(`/transactions/${id}/valider`);
    return data.data;
  },

  rejeter: async (id, motif) => {
    const { data } = await api.patch(`/transactions/${id}/rejeter`, { motif });
    return data.data;
  },
}));
