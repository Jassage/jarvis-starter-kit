import api from './api';

export type TypeMessage = 'TEXTE' | 'PHOTO' | 'AUDIO';

export interface MessageChat {
  id: string;
  type: TypeMessage;
  contenu: string | null;
  urlFichier: string | null;
  envoyeA: string;
  participantId: string;
  participant: { nomAffiche: string };
}

export async function envoyerMessage(codeReunion: string, participantId: string, reconnectToken: string, contenu: string) {
  const { data } = await api.post(`/reunions/${codeReunion}/messages`, { participantId, reconnectToken, contenu });
  return data.data as MessageChat;
}

// Photo ou message vocal — multipart, distinct de envoyerMessage (JSON).
export async function envoyerMessageMedia(
  codeReunion: string,
  participantId: string,
  reconnectToken: string,
  type: 'PHOTO' | 'AUDIO',
  fichier: Blob,
  nomFichier: string
) {
  const formData = new FormData();
  formData.append('participantId', participantId);
  formData.append('reconnectToken', reconnectToken);
  formData.append('type', type);
  formData.append('fichier', fichier, nomFichier);

  const { data } = await api.post(`/reunions/${codeReunion}/messages/media`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data as MessageChat;
}

export async function obtenirHistorique(codeReunion: string, participantId: string, reconnectToken: string) {
  const { data } = await api.get(`/reunions/${codeReunion}/messages`, { params: { participantId, reconnectToken } });
  return data.data as MessageChat[];
}
