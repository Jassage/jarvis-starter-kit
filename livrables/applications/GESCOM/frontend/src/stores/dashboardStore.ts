"use client";
import { create } from "zustand";
import api from "@/lib/api";

export interface RepartitionEmplacement {
  id: string;
  nom: string;
  type: "BOUTIQUE" | "ENTREPOT";
  quantiteTotale: number;
  valeur: number;
}

export interface MouvementRecent {
  id: string;
  type: string;
  quantite: number;
  createdAt: string;
  produit: { nom: string; reference: string };
  emplacement: { nom: string };
  utilisateur: { nom: string; prenom: string };
}

export interface AlerteStock {
  produitId: string;
  reference: string;
  nom: string;
  emplacement: { id: string; nom: string; type: string };
  quantite: number;
  seuilAlerte: number;
}

export interface VenteJour {
  date: string;
  montant: number;
  count: number;
}

export interface TopProduit {
  produitId: string;
  nom: string;
  reference: string;
  unite: string;
  quantiteVendue: number;
  montantVendu: number;
}

export interface ClientRisque {
  id: string;
  nom: string;
  type: "PARTICULIER" | "GROSSISTE";
  soldeDu: number;
}

export interface CommandeAttente {
  id: string;
  numero: string;
  statut: string;
  fournisseur: { nom: string };
  dateLivraisonPrevue: string | null;
  enRetard: boolean;
}

export interface DashboardStats {
  totalProduits: number;
  valeurStockTotal: number;
  produitsSousAlerte: number;
  alertesStock: AlerteStock[];
  repartitionParEmplacement: RepartitionEmplacement[];
  mouvementsRecents: MouvementRecent[];
  ventesDuJour: { count: number; montant: number };
  tendanceVentes: { montantHier: number; variationPct: number };
  ventes7Jours: VenteJour[];
  topProduits: TopProduit[];
  clientsRisque: ClientRisque[];
  clientsRisqueCount: number;
  encoursCreditTotal: number;
  commandesEnAttente: number;
  commandesEnRetard: number;
  commandesListe: CommandeAttente[];
}

interface DashboardState {
  stats: DashboardStats | null;
  isLoading: boolean;
  fetchStats: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  stats: null,
  isLoading: false,
  fetchStats: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.get("/dashboard/stats");
      set({ stats: data.data, isLoading: false });
    } catch (e) {
      set({ isLoading: false });
      throw e;
    }
  },
}));
