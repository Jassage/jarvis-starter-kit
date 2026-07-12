'use client';
import { create } from 'zustand';
import api from '@/lib/api';

export interface Vehicule {
  id: string;
  plaqueImmatriculation: string;
  dateArrivee: string;
  dateDepart: string | null;
  emplacement: string;
  montant: string | null;
  chambre: { id: string; numero: string };
}

interface VoiturierState {
  vehicules: Vehicule[];
  isLoading: boolean;
  fetchVehicules: () => Promise<void>;
  enregistrerVehicule: (data: { chambreId: string; plaqueImmatriculation: string; emplacement: string }) => Promise<void>;
  marquerDepart: (id: string, montant?: number) => Promise<void>;
}

export const useVoiturierStore = create<VoiturierState>((set, get) => ({
  vehicules: [],
  isLoading: false,

  fetchVehicules: async () => {
    set({ isLoading: true });
    const { data } = await api.get('/voiturier/vehicules');
    set({ vehicules: data.data.vehicules, isLoading: false });
  },

  enregistrerVehicule: async (data) => {
    await api.post('/voiturier/vehicules', data);
    await get().fetchVehicules();
  },

  marquerDepart: async (id, montant) => {
    await api.post(`/voiturier/vehicules/${id}/depart`, montant ? { montant } : {});
    await get().fetchVehicules();
  },
}));
