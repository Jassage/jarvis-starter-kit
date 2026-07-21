import api from './client';
import type { Bandeau, ConfigChaine, Incrustation } from './epg.api';

// Catalogue de rattrapage (public, sans auth comme l'EPG). Le backend ne sert que
// les replays publiés et dans leur fenêtre de droits — l'app n'a aucun filtrage de
// disponibilité à refaire de son côté.
export interface ReplayCarte {
  id: string;
  titre: string;
  description: string | null;
  vignetteUrl: string | null;
  dureeSecondes: number;
  nombreVues: number;
  publieAt: string | null;
  matchId: string | null;
  creneau: { dateHeureDebut: string } | null;
}

export interface CatalogueResponse {
  replays: ReplayCarte[];
  total: number;
  page: number;
  limit: number;
}

export interface ReplayDetail {
  replay: ReplayCarte & {
    urlVod: string;
    creneau: { dateHeureDebut: string; dateHeureFin: string } | null;
    match: { nomEvenement: string; equipes: string } | null;
  };
  incrustations: Incrustation[];
  bandeaux: Bandeau[];
  configChaine: ConfigChaine | null;
}

export type TypeReplay = 'MATCH' | 'PROGRAMME';

export async function getCatalogue(params: { q?: string; type?: TypeReplay } = {}): Promise<CatalogueResponse> {
  const { data } = await api.get('/replay', { params });
  return data.data;
}

export async function getReplay(id: string): Promise<ReplayDetail> {
  const { data } = await api.get(`/replay/${id}`);
  return data.data;
}

// Compteur de vues à la demande, distinct des diffusions antenne côté rapports.
export async function compterVue(id: string): Promise<void> {
  await api.post(`/replay/${id}/vue`);
}
