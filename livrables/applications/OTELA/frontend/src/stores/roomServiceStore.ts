'use client';
import { create } from 'zustand';
import api from '@/lib/api';
import { MenuItem, StatutCommande } from './restaurantStore';

export interface LigneCommandeRoomService {
  id: string;
  quantite: number;
  notes: string | null;
  menuItem: MenuItem;
}

export interface CommandeRoomService {
  id: string;
  statut: StatutCommande;
  dateHeure: string;
  chambre: { id: string; numero: string };
  lignes: LigneCommandeRoomService[];
}

interface RoomServiceState {
  commandesCuisine: CommandeRoomService[];
  commandeActive: CommandeRoomService | null;
  fetchCommandesCuisine: () => Promise<void>;
  ouvrirCommande: (chambreId: string) => Promise<void>;
  ajouterLigne: (data: { menuItemId: string; quantite: number; notes?: string }) => Promise<void>;
  envoyerEnCuisine: () => Promise<void>;
  marquerLivree: (commandeId: string) => Promise<void>;
  cloturerCommande: () => Promise<void>;
  fermerCommandeActive: () => void;
}

export const useRoomServiceStore = create<RoomServiceState>((set, get) => ({
  commandesCuisine: [],
  commandeActive: null,

  fetchCommandesCuisine: async () => {
    const { data } = await api.get('/room-service/commandes/cuisine');
    set({ commandesCuisine: data.data.commandes });
  },

  ouvrirCommande: async (chambreId) => {
    const { data } = await api.post('/room-service/commandes', { chambreId });
    set({ commandeActive: data.data.commande });
  },

  ajouterLigne: async (ligne) => {
    const commande = get().commandeActive;
    if (!commande) return;
    const { data } = await api.post(`/room-service/commandes/${commande.id}/lignes`, ligne);
    set({ commandeActive: data.data.commande });
  },

  envoyerEnCuisine: async () => {
    const commande = get().commandeActive;
    if (!commande) return;
    const { data } = await api.patch(`/room-service/commandes/${commande.id}/envoyer-cuisine`);
    set({ commandeActive: data.data.commande });
  },

  marquerLivree: async (commandeId) => {
    await api.patch(`/room-service/commandes/${commandeId}/livrer`);
    await get().fetchCommandesCuisine();
  },

  cloturerCommande: async () => {
    const commande = get().commandeActive;
    if (!commande) return;
    await api.post(`/room-service/commandes/${commande.id}/cloturer`);
    set({ commandeActive: null });
  },

  fermerCommandeActive: () => set({ commandeActive: null }),
}));
