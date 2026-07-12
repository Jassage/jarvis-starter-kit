'use client';
import { create } from 'zustand';
import api from '@/lib/api';

export type StatutTable = 'LIBRE' | 'OCCUPEE' | 'RESERVEE';
export type CategorieMenuItem = 'ENTREE' | 'PLAT' | 'DESSERT' | 'BOISSON' | 'CARTE_BAR';
export type StatutCommande = 'EN_COURS' | 'ENVOYEE_CUISINE' | 'SERVIE' | 'PAYEE';

export interface PointDeVente {
  id: string;
  nom: string;
  type: 'RESTAURANT' | 'BAR';
}

export interface MenuItem {
  id: string;
  nom: string;
  prix: string;
  devise: 'HTG' | 'USD';
  categorie: CategorieMenuItem;
  disponible: boolean;
  pointDeVenteId: string;
  pointDeVente?: PointDeVente;
}

export interface LigneCommande {
  id: string;
  quantite: number;
  notes: string | null;
  menuItem: MenuItem;
}

export interface Commande {
  id: string;
  statut: StatutCommande;
  dateHeure: string;
  table: { id: string; numero: string; pointDeVente: PointDeVente };
  lignes: LigneCommande[];
}

export interface TableItem {
  id: string;
  numero: string;
  capacite: number;
  statut: StatutTable;
  pointDeVente: PointDeVente;
  commandes: { id: string; statut: StatutCommande }[];
}

interface RestaurantState {
  tables: TableItem[];
  menu: MenuItem[];
  pointsDeVente: PointDeVente[];
  commandesCuisine: Commande[];
  commandeActive: Commande | null;
  isLoading: boolean;
  fetchTables: () => Promise<void>;
  fetchMenu: () => Promise<void>;
  fetchPointsDeVente: () => Promise<void>;
  fetchCommandesCuisine: () => Promise<void>;
  ouvrirOuReprendreCommande: (table: TableItem) => Promise<void>;
  ajouterLigne: (data: { menuItemId: string; quantite: number; notes?: string }) => Promise<void>;
  envoyerEnCuisine: () => Promise<void>;
  marquerServie: (commandeId: string) => Promise<void>;
  cloturerCommande: (data: { chambreNumero?: string; methodePaiement?: string }) => Promise<void>;
  fermerCommandeActive: () => void;
  creerMenuItem: (data: { pointDeVenteId: string; nom: string; prix: number; devise: 'HTG' | 'USD'; categorie: CategorieMenuItem }) => Promise<void>;
  updateMenuItem: (id: string, data: Partial<{ nom: string; prix: number; categorie: CategorieMenuItem; disponible: boolean }>) => Promise<void>;
}

export const useRestaurantStore = create<RestaurantState>((set, get) => ({
  tables: [],
  menu: [],
  pointsDeVente: [],
  commandesCuisine: [],
  commandeActive: null,
  isLoading: false,

  fetchTables: async () => {
    set({ isLoading: true });
    const { data } = await api.get('/restaurant/tables');
    set({ tables: data.data.tables, isLoading: false });
  },

  fetchMenu: async () => {
    const { data } = await api.get('/restaurant/menu');
    set({ menu: data.data.menu });
  },

  fetchPointsDeVente: async () => {
    const { data } = await api.get('/restaurant/points-de-vente');
    set({ pointsDeVente: data.data.pointsDeVente });
  },

  fetchCommandesCuisine: async () => {
    const { data } = await api.get('/restaurant/commandes/cuisine');
    set({ commandesCuisine: data.data.commandes });
  },

  ouvrirOuReprendreCommande: async (table) => {
    const commandeExistante = table.commandes[0];
    if (commandeExistante) {
      const { data } = await api.get(`/restaurant/commandes/${commandeExistante.id}`);
      set({ commandeActive: data.data.commande });
      return;
    }
    const { data } = await api.post('/restaurant/commandes', { tableId: table.id });
    set({ commandeActive: data.data.commande });
    await get().fetchTables();
  },

  ajouterLigne: async (ligne) => {
    const commande = get().commandeActive;
    if (!commande) return;
    const { data } = await api.post(`/restaurant/commandes/${commande.id}/lignes`, ligne);
    set({ commandeActive: data.data.commande });
  },

  envoyerEnCuisine: async () => {
    const commande = get().commandeActive;
    if (!commande) return;
    const { data } = await api.patch(`/restaurant/commandes/${commande.id}/envoyer-cuisine`);
    set({ commandeActive: data.data.commande });
    await get().fetchTables();
  },

  marquerServie: async (commandeId) => {
    await api.patch(`/restaurant/commandes/${commandeId}/servir`);
    await get().fetchCommandesCuisine();
  },

  cloturerCommande: async (data) => {
    const commande = get().commandeActive;
    if (!commande) return;
    await api.post(`/restaurant/commandes/${commande.id}/cloturer`, data);
    set({ commandeActive: null });
    await get().fetchTables();
  },

  fermerCommandeActive: () => set({ commandeActive: null }),

  creerMenuItem: async (data) => {
    await api.post('/restaurant/menu', data);
    await get().fetchMenu();
  },

  updateMenuItem: async (id, data) => {
    await api.patch(`/restaurant/menu/${id}`, data);
    await get().fetchMenu();
  },
}));
