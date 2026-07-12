'use client';
import { create } from 'zustand';
import api from '@/lib/api';

export interface ArticleMinibar {
  id: string;
  nom: string;
  prix: string;
  devise: 'HTG' | 'USD';
}

export interface ConsommationMinibar {
  id: string;
  quantite: number;
  dateConstat: string;
  articleMinibar: ArticleMinibar;
  chambre: { id: string; numero: string };
}

interface MinibarState {
  articles: ArticleMinibar[];
  consommations: ConsommationMinibar[];
  isLoading: boolean;
  fetchArticles: () => Promise<void>;
  fetchConsommations: () => Promise<void>;
  creerArticle: (data: { nom: string; prix: number; devise: 'HTG' | 'USD' }) => Promise<void>;
  constaterConsommation: (chambreId: string, articles: { articleMinibarId: string; quantite: number }[]) => Promise<void>;
}

export const useMinibarStore = create<MinibarState>((set, get) => ({
  articles: [],
  consommations: [],
  isLoading: false,

  fetchArticles: async () => {
    const { data } = await api.get('/minibar/articles');
    set({ articles: data.data.articles });
  },

  fetchConsommations: async () => {
    set({ isLoading: true });
    const { data } = await api.get('/minibar/consommations');
    set({ consommations: data.data.consommations, isLoading: false });
  },

  creerArticle: async (data) => {
    await api.post('/minibar/articles', data);
    await get().fetchArticles();
  },

  constaterConsommation: async (chambreId, articles) => {
    await api.post('/minibar/consommations', { chambreId, articles });
    await get().fetchConsommations();
  },
}));
