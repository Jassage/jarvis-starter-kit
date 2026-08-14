'use client';
import { create } from 'zustand';

export type ToastTon = 'succes' | 'erreur' | 'info';

export interface Toast {
  id: number;
  ton: ToastTon;
  message: string;
}

interface ToastState {
  toasts: Toast[];
  pousser: (ton: ToastTon, message: string) => void;
  succes: (message: string) => void;
  erreur: (message: string) => void;
  retirer: (id: number) => void;
}

// Durée d'affichage : assez longue pour être lue en régie sans quitter des yeux la
// grille, assez courte pour ne pas s'empiler pendant une session de programmation.
const DUREE_MS = 4500;

let compteur = 0;

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],

  pousser: (ton, message) => {
    const id = ++compteur;
    set({ toasts: [...get().toasts, { id, ton, message }] });
    setTimeout(() => get().retirer(id), DUREE_MS);
  },

  succes: (message) => get().pousser('succes', message),
  erreur: (message) => get().pousser('erreur', message),

  retirer: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
}));

// Raccourci pour les appels d'API : remonte le message du backend quand il existe
// (les services renvoient des messages métier lisibles), sinon un repli générique.
export function messageErreur(err: unknown, repli = 'Une erreur est survenue'): string {
  const axiosLike = err as { response?: { data?: { message?: string } } };
  return axiosLike?.response?.data?.message || repli;
}
