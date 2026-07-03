"use client";
import { create } from "zustand";
import api from "@/lib/api";

export interface CompteComptable {
  id: string;
  numero: string;
  intitule: string;
  type: "ACTIF" | "PASSIF" | "PRODUIT" | "CHARGE";
  actif: boolean;
}

export interface EcritureJournal {
  id: string;
  montant: string;
  libelle: string;
  date: string;
  referenceType?: string | null;
  compteDebit: { numero: string; intitule: string };
  compteCredit: { numero: string; intitule: string };
  utilisateur: { nom: string; prenom: string };
}

export interface DashboardCompta {
  totalActif: number;
  totalPassif: number;
  totalProduits: number;
  totalCharges: number;
  resultatNet: number;
  nbEcrituresMois: number;
  nbEchecsNonResolus: number;
  equilibre: boolean;
}

export interface Bilan {
  actifs: { numero: string; intitule: string; solde: number }[];
  passifs: { numero: string; intitule: string; solde: number }[];
  totalActif: number;
  totalPassif: number;
  equilibre: boolean;
}

export interface Resultat {
  produits: { numero: string; intitule: string; montant: number }[];
  charges: { numero: string; intitule: string; montant: number }[];
  totalProduits: number;
  totalCharges: number;
  resultatNet: number;
  marge: number;
}

export interface LigneGrandLivre {
  date: string;
  libelle: string;
  debit: number;
  credit: number;
  solde: number;
}
export interface GrandLivre extends CompteComptable {
  lignes: LigneGrandLivre[];
  soldeDebit: number;
  soldeCredit: number;
  solde: number;
}

export interface EcritureEchec {
  id: string;
  compteDebitNumero: string;
  compteCreditNumero: string;
  montant: string;
  libelle: string;
  erreur: string;
  referenceType?: string | null;
  resolu: boolean;
  createdAt: string;
}

interface ComptaState {
  comptes: CompteComptable[];
  journal: EcritureJournal[];
  dashboard: DashboardCompta | null;
  bilan: Bilan | null;
  resultat: Resultat | null;
  grandLivre: GrandLivre | null;
  echecs: EcritureEchec[];
  isLoading: boolean;
  error: string | null;

  fetchComptes: () => Promise<void>;
  fetchJournal: () => Promise<void>;
  createEcriture: (data: {
    compteDebitId: string;
    compteCreditId: string;
    montant: number;
    libelle: string;
    date?: string;
  }) => Promise<void>;
  fetchDashboard: () => Promise<void>;
  fetchBilan: () => Promise<void>;
  fetchResultat: () => Promise<void>;
  fetchGrandLivre: (compteId: string) => Promise<void>;
  fetchEchecs: () => Promise<void>;
  resoudreEchec: (id: string) => Promise<void>;
}

function getErrorMessage(error: unknown, fallback: string): string {
  return (
    (error as any)?.response?.data?.error ||
    (error instanceof Error ? error.message : fallback)
  );
}

export const useComptaStore = create<ComptaState>((set, get) => ({
  comptes: [],
  journal: [],
  dashboard: null,
  bilan: null,
  resultat: null,
  grandLivre: null,
  echecs: [],
  isLoading: false,
  error: null,

  fetchComptes: async () => {
    set({ error: null });
    try {
      const { data } = await api.get("/compta/plan-comptable");
      set({ comptes: data.data });
    } catch (error) {
      set({
        error: getErrorMessage(
          error,
          "Erreur lors du chargement du plan comptable",
        ),
      });
      throw error;
    }
  },

  fetchJournal: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get("/compta/journal");
      set({ journal: data.data.items, isLoading: false });
    } catch (e) {
      set({
        isLoading: false,
        error: getErrorMessage(e, "Erreur lors du chargement du journal"),
      });
      throw e;
    }
  },

  createEcriture: async (payload) => {
    await api.post("/compta/journal", payload);
    await Promise.allSettled([get().fetchJournal(), get().fetchDashboard()]);
    set({ error: null });
  },

  fetchDashboard: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get("/compta/dashboard");
      set({ dashboard: data.data, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: getErrorMessage(
          error,
          "Erreur lors du chargement du tableau de bord",
        ),
      });
      throw error;
    }
  },

  fetchBilan: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get("/compta/bilan");
      set({ bilan: data.data, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: getErrorMessage(error, "Erreur lors du chargement du bilan"),
      });
      throw error;
    }
  },

  fetchResultat: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get("/compta/resultat");
      set({ resultat: data.data, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: getErrorMessage(error, "Erreur lors du chargement du résultat"),
      });
      throw error;
    }
  },

  fetchGrandLivre: async (compteId) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get(`/compta/grand-livre/${compteId}`);
      set({ grandLivre: data.data, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: getErrorMessage(
          error,
          "Erreur lors du chargement du grand livre",
        ),
      });
      throw error;
    }
  },

  fetchEchecs: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get("/compta/echecs");
      set({ echecs: data.data.items, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: getErrorMessage(
          error,
          "Erreur lors du chargement des écritures en échec",
        ),
      });
      throw error;
    }
  },

  resoudreEchec: async (id) => {
    await api.patch(`/compta/echecs/${id}/resoudre`);
    await Promise.allSettled([get().fetchEchecs(), get().fetchDashboard()]);
    set({ error: null });
  },
}));
