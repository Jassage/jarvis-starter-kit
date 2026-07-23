'use client';
import { create } from 'zustand';
import api from '@/lib/api';

export type PrioriteTicket = 'BASSE' | 'NORMALE' | 'HAUTE' | 'URGENTE';
export type StatutTicket = 'A_FAIRE' | 'EN_COURS' | 'RESOLU';

export interface TicketMaintenance {
  id: string;
  chambre: { id: string; numero: string; typeChambre: { nom: string } } | null;
  zone: string | null;
  titre: string;
  description: string | null;
  priorite: PrioriteTicket;
  statut: StatutTicket;
  bloqueChambre: boolean;
  signalant: { id: string; nom: string };
  employeAssigne: { id: string; nom: string } | null;
  notesResolution: string | null;
  dateSignalement: string;
  dateResolution: string | null;
}

interface EmployeMaintenance {
  id: string;
  nom: string;
}

interface CreerTicketInput {
  chambreId?: string;
  zone?: string;
  titre: string;
  description?: string;
  priorite?: PrioriteTicket;
  bloqueChambre?: boolean;
}

interface MaintenanceState {
  tickets: TicketMaintenance[];
  employes: EmployeMaintenance[];
  isLoading: boolean;
  error: string | null;
  fetchTickets: (statut?: string) => Promise<void>;
  fetchEmployes: () => Promise<void>;
  creerTicket: (data: CreerTicketInput) => Promise<void>;
  updateTicket: (id: string, data: Partial<{ statut: StatutTicket; employeAssigneId: string | null; priorite: PrioriteTicket; notesResolution: string }>) => Promise<void>;
}

export const useMaintenanceStore = create<MaintenanceState>((set, get) => ({
  tickets: [],
  employes: [],
  isLoading: false,
  error: null,

  fetchTickets: async (statut) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get('/maintenance/tickets', { params: statut ? { statut } : undefined });
      set({ tickets: data.data.tickets, isLoading: false });
    } catch (e: any) {
      set({ error: e.response?.data?.message || 'Erreur de chargement', isLoading: false });
    }
  },

  fetchEmployes: async () => {
    const { data } = await api.get('/maintenance/employes');
    set({ employes: data.data.employes });
  },

  creerTicket: async (data) => {
    await api.post('/maintenance/tickets', data);
    await get().fetchTickets();
  },

  updateTicket: async (id, data) => {
    await api.patch(`/maintenance/tickets/${id}`, data);
    await get().fetchTickets();
  },
}));
