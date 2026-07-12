import api from './api';

export type StatutEnregistrement = 'NON_DEMARRE' | 'EN_COURS' | 'DISPONIBLE';

export interface Enregistrement {
  id: string;
  reunionId: string;
  egressId: string | null;
  urlFichier: string | null;
  dureeSecondes: number | null;
  tailleFichier: number | null;
  statut: StatutEnregistrement;
  createdAt: string;
}

export async function demarrerEnregistrement(codeReunion: string) {
  const { data } = await api.post(`/reunions/${codeReunion}/enregistrements/demarrer`);
  return data.data as Enregistrement;
}

export async function arreterEnregistrement(codeReunion: string) {
  const { data } = await api.post(`/reunions/${codeReunion}/enregistrements/arreter`);
  return data.data as Enregistrement;
}

export async function obtenirEnregistrementEnCours(codeReunion: string) {
  const { data } = await api.get(`/reunions/${codeReunion}/enregistrements/en-cours`);
  return data.data as Enregistrement | null;
}

export async function listerEnregistrements(codeReunion: string) {
  const { data } = await api.get(`/reunions/${codeReunion}/enregistrements`);
  return data.data as Enregistrement[];
}
