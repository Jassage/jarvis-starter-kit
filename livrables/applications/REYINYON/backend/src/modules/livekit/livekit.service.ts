import { AccessToken, TrackSource } from 'livekit-server-sdk';
import { env } from '../../config/env';
import { roomServiceClient } from '../../config/livekit';
import { AppError } from '../../middlewares/errorHandler.middleware';
import logger from '../../utils/logger';

export async function genererToken(params: { roomName: string; identity: string; nom: string }): Promise<string> {
  const at = new AccessToken(env.LIVEKIT_API_KEY, env.LIVEKIT_API_SECRET, {
    identity: params.identity,
    name: params.nom,
    ttl: '6h',
  });
  at.addGrant({
    room: params.roomName,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
    canUpdateOwnMetadata: true,
  });
  return at.toJwt();
}

// Idempotent — createRoom sur une room déjà existante ne fait rien de
// destructif côté LiveKit (juste un no-op côté serveur média).
export async function assurerSalle(roomName: string): Promise<void> {
  try {
    await roomServiceClient.createRoom({ name: roomName, emptyTimeout: 60 * 30 });
  } catch (err) {
    logger.warn({ err, roomName }, 'assurerSalle: création ignorée (probablement déjà existante)');
  }
}

// Coupe UNE piste précise (micro OU caméra, jamais les deux d'un coup — un
// hôte doit pouvoir couper un micro bruyant sans éteindre la caméra de la
// personne). Volontairement à sens unique : LiveKit (comme Zoom/Meet) ne
// permet pas à un hôte de RALLUMER le micro/la caméra d'un participant à sa
// place, pour des raisons de vie privée — seul le participant peut le faire
// lui-même (bouton mic/caméra dans RoomControls côté client).
async function couperPiste(roomName: string, identity: string, source: TrackSource): Promise<void> {
  let participant;
  try {
    participant = await roomServiceClient.getParticipant(roomName, identity);
  } catch {
    throw new AppError("Ce participant n'est pas connecté au flux média", 404);
  }
  const piste = participant.tracks.find((t) => t.source === source);
  if (!piste?.sid) return; // déjà désactivée côté client, rien à faire
  await roomServiceClient.mutePublishedTrack(roomName, identity, piste.sid, true);
}

export async function couperMicroParticipant(roomName: string, identity: string): Promise<void> {
  await couperPiste(roomName, identity, TrackSource.MICROPHONE);
}

export async function couperCameraParticipant(roomName: string, identity: string): Promise<void> {
  await couperPiste(roomName, identity, TrackSource.CAMERA);
}

export async function retirerDuFluxMedia(roomName: string, identity: string): Promise<void> {
  try {
    await roomServiceClient.removeParticipant(roomName, identity);
  } catch (err) {
    // Déjà déconnecté du flux média (ex. perte de connexion) — pas bloquant,
    // le retrait côté base de données (dateHeureSortie) reste la source de vérité.
    logger.warn({ err, roomName, identity }, 'retirerDuFluxMedia: participant déjà absent du flux média');
  }
}

export async function terminerSalle(roomName: string): Promise<void> {
  try {
    await roomServiceClient.deleteRoom(roomName);
  } catch (err) {
    logger.warn({ err, roomName }, 'terminerSalle: suppression ignorée (room probablement déjà vide/absente)');
  }
}
