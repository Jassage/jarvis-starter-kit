'use client';
import { create } from 'zustand';
import api from '@/lib/api';

export interface ServiceSpa {
  id: string;
  nom: string;
  dureeMinutes: number;
  prix: string;
  devise: 'HTG' | 'USD';
  actif: boolean;
}

export interface Praticien {
  id: string;
  nom: string;
  specialites: string | null;
  actif: boolean;
}

export type StatutRendezVous = 'CONFIRME' | 'TERMINE' | 'ANNULE';

export interface RendezVousSpa {
  id: string;
  dateHeure: string;
  statut: StatutRendezVous;
  methodePaiement: string | null;
  serviceSpa: ServiceSpa;
  praticien: Praticien;
  client: { nom: string; telephone: string; email: string };
}

interface SpaState {
  services: ServiceSpa[];
  praticiens: Praticien[];
  rendezVous: RendezVousSpa[];
  isLoading: boolean;
  fetchServices: () => Promise<void>;
  fetchPraticiens: () => Promise<void>;
  fetchRendezVous: (date?: string) => Promise<void>;
  creerRendezVous: (data: { serviceSpaId: string; praticienId: string; dateHeure: string; client: { nom: string; telephone: string; email: string } }) => Promise<void>;
  annulerRendezVous: (id: string) => Promise<void>;
  terminerRendezVous: (id: string, data: { chambreNumero?: string; methodePaiement?: string }) => Promise<void>;
  creerService: (data: { nom: string; dureeMinutes: number; prix: number; devise: 'HTG' | 'USD' }) => Promise<void>;
  updateService: (id: string, data: Partial<{ nom: string; dureeMinutes: number; prix: number; actif: boolean }>) => Promise<void>;
  creerPraticien: (data: { nom: string; specialites?: string }) => Promise<void>;
  updatePraticien: (id: string, data: Partial<{ nom: string; specialites: string; actif: boolean }>) => Promise<void>;
}

export const useSpaStore = create<SpaState>((set, get) => ({
  services: [],
  praticiens: [],
  rendezVous: [],
  isLoading: false,

  fetchServices: async () => {
    const { data } = await api.get('/spa/services');
    set({ services: data.data.services });
  },

  fetchPraticiens: async () => {
    const { data } = await api.get('/spa/praticiens');
    set({ praticiens: data.data.praticiens });
  },

  fetchRendezVous: async (date) => {
    set({ isLoading: true });
    const { data } = await api.get('/spa/rendezvous', { params: date ? { date } : undefined });
    set({ rendezVous: data.data.rendezVous, isLoading: false });
  },

  creerRendezVous: async (rdv) => {
    await api.post('/spa/rendezvous', rdv);
    await get().fetchRendezVous();
  },

  annulerRendezVous: async (id) => {
    await api.patch(`/spa/rendezvous/${id}/annuler`);
    await get().fetchRendezVous();
  },

  terminerRendezVous: async (id, data) => {
    await api.post(`/spa/rendezvous/${id}/terminer`, data);
    await get().fetchRendezVous();
  },

  creerService: async (data) => {
    await api.post('/spa/services', data);
    await get().fetchServices();
  },

  updateService: async (id, data) => {
    await api.patch(`/spa/services/${id}`, data);
    await get().fetchServices();
  },

  creerPraticien: async (data) => {
    await api.post('/spa/praticiens', data);
    await get().fetchPraticiens();
  },

  updatePraticien: async (id, data) => {
    await api.patch(`/spa/praticiens/${id}`, data);
    await get().fetchPraticiens();
  },
}));
