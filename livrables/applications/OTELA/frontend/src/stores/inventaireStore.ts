'use client';
import { create } from 'zustand';
import api from '@/lib/api';

export type CategorieInventaire = 'LINGE' | 'CONSOMMABLE' | 'PRODUIT_ENTRETIEN' | 'AUTRE';
export type TypeMouvement = 'ENTREE' | 'SORTIE' | 'AJUSTEMENT';

export interface ArticleInventaire {
  id: string;
  nom: string;
  categorie: CategorieInventaire;
  unite: string;
  quantiteStock: number;
  seuilAlerte: number;
  actif: boolean;
}

export interface MouvementInventaire {
  id: string;
  type: TypeMouvement;
  quantite: number;
  stockApres: number;
  motif: string | null;
  employe: { id: string; nom: string } | null;
  createdAt: string;
}

interface InventaireState {
  articles: ArticleInventaire[];
  mouvements: MouvementInventaire[];
  isLoading: boolean;
  error: string | null;
  fetchArticles: () => Promise<void>;
  creerArticle: (data: { nom: string; categorie?: CategorieInventaire; unite?: string; seuilAlerte?: number }) => Promise<void>;
  updateArticle: (id: string, data: Partial<{ nom: string; categorie: CategorieInventaire; unite: string; seuilAlerte: number; actif: boolean }>) => Promise<void>;
  fetchMouvements: (articleId: string) => Promise<void>;
  enregistrerMouvement: (articleId: string, data: { type: TypeMouvement; quantite: number; motif?: string }) => Promise<void>;
}

export const useInventaireStore = create<InventaireState>((set, get) => ({
  articles: [],
  mouvements: [],
  isLoading: false,
  error: null,

  fetchArticles: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get('/inventaire/articles');
      set({ articles: data.data.articles, isLoading: false });
    } catch (e: any) {
      set({ error: e.response?.data?.message || 'Erreur de chargement', isLoading: false });
    }
  },

  creerArticle: async (data) => {
    await api.post('/inventaire/articles', data);
    await get().fetchArticles();
  },

  updateArticle: async (id, data) => {
    await api.patch(`/inventaire/articles/${id}`, data);
    await get().fetchArticles();
  },

  fetchMouvements: async (articleId) => {
    const { data } = await api.get(`/inventaire/articles/${articleId}/mouvements`);
    set({ mouvements: data.data.mouvements });
  },

  enregistrerMouvement: async (articleId, data) => {
    await api.post(`/inventaire/articles/${articleId}/mouvements`, data);
    await get().fetchArticles();
  },
}));
