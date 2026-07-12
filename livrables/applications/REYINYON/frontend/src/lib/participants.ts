import api from './api';

export type StatutAttente = 'EN_ATTENTE' | 'ADMIS' | 'REJETE';
export type ModeConnexionParticipant = 'VIDEO' | 'AUDIO_SEUL' | 'DIAL_IN_TELEPHONE';

export interface RejoindreResultat {
  participant: { id: string; nomAffiche: string; statutAttente: StatutAttente; livekitIdentity: string };
  enAttente: boolean;
  reconnectToken: string;
  livekitToken?: string;
  reunion?: { id: string; titre: string; livekitRoomName: string; modeConnexionMinimale: string };
}

export async function rejoindreReunion(
  codeReunion: string,
  input: { nomAffiche: string; codeAcces?: string; reconnectToken?: string; modeConnexion?: ModeConnexionParticipant }
) {
  const { data } = await api.post(`/reunions/${codeReunion}/rejoindre`, input);
  return data.data as RejoindreResultat;
}

export async function obtenirStatutAttente(participantId: string) {
  const { data } = await api.get(`/participants/${participantId}/statut`);
  return data.data.statutAttente as StatutAttente;
}

export async function listerEnAttente(codeReunion: string) {
  const { data } = await api.get(`/reunions/${codeReunion}/attente`);
  return data.data as Array<{ id: string; nomAffiche: string; createdAt: string }>;
}

export async function admettreParticipant(participantId: string) {
  await api.patch(`/participants/${participantId}/admettre`);
}

export async function rejeterParticipant(participantId: string) {
  await api.patch(`/participants/${participantId}/rejeter`);
}

export async function couperMicroParticipant(participantId: string) {
  await api.post(`/participants/${participantId}/muter`);
}

export async function couperCameraParticipant(participantId: string) {
  await api.post(`/participants/${participantId}/couper-camera`);
}

export async function retirerParticipant(participantId: string) {
  await api.post(`/participants/${participantId}/retirer`);
}

export async function quitterReunion(participantId: string, reconnectToken: string) {
  await api.post(`/participants/${participantId}/quitter`, { reconnectToken });
}
