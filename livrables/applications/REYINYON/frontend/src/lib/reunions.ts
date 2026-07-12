import api from './api';

export type StatutReunion = 'PLANIFIEE' | 'EN_COURS' | 'TERMINEE';
export type ModeConnexion = 'VIDEO' | 'AUDIO_SEUL' | 'DIAL_IN';

export interface Reunion {
  id: string;
  hoteId: string;
  titre: string;
  dateHeurePrevue: string | null;
  statut: StatutReunion;
  codeReunion: string;
  codeAcces: string | null;
  codeTelephone: string | null;
  salleAttenteActive: boolean;
  verrouillee: boolean;
  modeConnexionMinimale: ModeConnexion;
  livekitRoomName: string;
  createdAt: string;
  updatedAt: string;
  _count?: { participants: number };
}

export interface VuePublique {
  titre: string;
  statut: StatutReunion;
  verrouillee: boolean;
  salleAttenteActive: boolean;
  codeAccesRequis: boolean;
  modeConnexionMinimale: ModeConnexion;
}

export async function creerReunion(input: {
  titre: string;
  dateHeurePrevue?: string;
  codeAcces?: string;
  salleAttenteActive?: boolean;
  modeConnexionMinimale?: ModeConnexion;
}) {
  const { data } = await api.post('/reunions', input);
  return data.data as Reunion;
}

export async function listerMesReunions() {
  const { data } = await api.get('/reunions');
  return data.data as Reunion[];
}

export async function obtenirDetailHote(codeReunion: string) {
  const { data } = await api.get(`/reunions/${codeReunion}/detail`);
  return data.data as Reunion & {
    participants: Array<{ id: string; nomAffiche: string; statutAttente: string; dateHeureEntree: string | null; dateHeureSortie: string | null }>;
    numeroDialIn: string | null;
  };
}

export async function obtenirVuePublique(codeReunion: string) {
  const { data } = await api.get(`/reunions/${codeReunion}/public`);
  return data.data as VuePublique;
}

export async function verrouillerReunion(codeReunion: string, verrouillee: boolean) {
  const { data } = await api.patch(`/reunions/${codeReunion}/verrouiller`, { verrouillee });
  return data.data as Reunion;
}

export async function demarrerReunion(codeReunion: string) {
  const { data } = await api.patch(`/reunions/${codeReunion}/demarrer`);
  return data.data as Reunion;
}

export async function terminerReunion(codeReunion: string) {
  await api.patch(`/reunions/${codeReunion}/terminer`);
}
