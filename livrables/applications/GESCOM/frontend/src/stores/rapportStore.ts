"use client";
import { create } from "zustand";
import api from "@/lib/api";

export interface RapportVentes {
  periode: { from: string; to: string };
  caTotal: number;
  nombreVentes: number;
  panierMoyen: number;
  margeTotaleEstimee: number;
  evolution: { date: string; montant: number; count: number }[];
  topProduits: {
    produitId: string;
    nom: string;
    reference: string;
    unite: string;
    quantiteVendue: number;
    montantVendu: number;
    margeEstimee: number;
  }[];
  topClients: {
    clientId: string;
    nom: string;
    type: string;
    montantAchete: number;
    nombreAchats: number;
  }[];
  ventilationModePaiement: {
    modePaiement: string;
    montant: number;
    count: number;
  }[];
}

export interface RapportStock {
  valeurStockTotal: number;
  valorisationParEmplacement: {
    id: string;
    nom: string;
    type: string;
    quantite: number;
    valeur: number;
  }[];
  valorisationParCategorie: {
    categorie: string;
    quantite: number;
    valeur: number;
  }[];
  meilleureRotation: {
    produitId: string;
    nom: string;
    reference: string;
    quantiteStock: number;
    quantiteSortie90j: number;
  }[];
  produitsDormants: {
    produitId: string;
    nom: string;
    reference: string;
    quantiteStock: number;
    quantiteSortie90j: number;
  }[];
  alertesStock: {
    produitId: string;
    nom: string;
    reference: string;
    emplacement: string;
    quantite: number;
    seuilAlerte: number;
  }[];
}

export interface RapportAchats {
  periode: { from: string; to: string };
  montantCommande: number;
  montantRecu: number;
  tauxReception: number;
  nombreCommandes: number;
  topFournisseurs: {
    fournisseurId: string;
    nom: string;
    montantCommande: number;
    montantRecu: number;
    nombreCommandes: number;
  }[];
  commandesEnRetard: {
    id: string;
    numero: string;
    fournisseur: string;
    dateLivraisonPrevue: string;
    statut: string;
  }[];
  ventilationStatut: Record<string, number>;
}

export interface RapportClients {
  nombreClients: number;
  encoursCreditTotal: number;
  ventilationParType: { type: string; count: number; soldeDu: number }[];
  topClientsSoldeDu: {
    id: string;
    nom: string;
    type: string;
    soldeDu: number;
  }[];
  topClientsAcheteurs: {
    id: string;
    nom: string;
    type: string;
    montantAchete: number;
  }[];
}

interface RapportState {
  ventes: RapportVentes | null;
  stock: RapportStock | null;
  achats: RapportAchats | null;
  clients: RapportClients | null;
  isLoading: boolean;
  error: string | null;

  fetchVentes: (params?: { from?: string; to?: string }) => Promise<void>;
  fetchStock: () => Promise<void>;
  fetchAchats: (params?: { from?: string; to?: string }) => Promise<void>;
  fetchClients: () => Promise<void>;
}

let achatsRequestId = 0;

function getErrorMessage(error: unknown, fallback: string): string {
  return (
    (error as any)?.response?.data?.error ||
    (error instanceof Error ? error.message : fallback)
  );
}

export const useRapportStore = create<RapportState>((set) => ({
  ventes: null,
  stock: null,
  achats: null,
  clients: null,
  isLoading: false,
  error: null,

  fetchVentes: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get("/rapports/ventes", { params });
      set({ ventes: data.data, isLoading: false });
    } catch (e) {
      set({
        isLoading: false,
        error: getErrorMessage(
          e,
          "Erreur lors du chargement du rapport ventes",
        ),
      });
      throw e;
    }
  },

  fetchStock: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get("/rapports/stock");
      set({ stock: data.data, isLoading: false });
    } catch (e) {
      set({
        isLoading: false,
        error: getErrorMessage(e, "Erreur lors du chargement du rapport stock"),
      });
      throw e;
    }
  },

  fetchAchats: async (params) => {
    const requestId = ++achatsRequestId;
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get("/rapports/achats", { params });
      if (requestId !== achatsRequestId) return;
      set({ achats: data.data, isLoading: false });
    } catch (e) {
      if (requestId !== achatsRequestId) return;
      set({
        isLoading: false,
        error: getErrorMessage(
          e,
          "Erreur lors du chargement du rapport achats",
        ),
      });
      throw e;
    }
  },

  fetchClients: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get("/rapports/clients");
      set({ clients: data.data, isLoading: false });
    } catch (e) {
      set({
        isLoading: false,
        error: getErrorMessage(
          e,
          "Erreur lors du chargement du rapport clients",
        ),
      });
      throw e;
    }
  },
}));
