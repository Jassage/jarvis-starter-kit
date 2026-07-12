import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { Reunion, ModeConnexionParticipant } from '@prisma/client';
import prisma from '../../config/database';
import { AppError } from '../../middlewares/errorHandler.middleware';
import { assurerSalle, genererToken, couperMicroParticipant, couperCameraParticipant, retirerDuFluxMedia } from '../livekit/livekit.service';

function genererReconnectToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

function hasherToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function infoReunionPublique(reunion: Reunion) {
  return {
    id: reunion.id,
    titre: reunion.titre,
    livekitRoomName: reunion.livekitRoomName,
    modeConnexionMinimale: reunion.modeConnexionMinimale,
  };
}

async function emettreAccesLivekit(reunion: Reunion, identity: string, nomAffiche: string) {
  await assurerSalle(reunion.livekitRoomName);
  return genererToken({ roomName: reunion.livekitRoomName, identity, nom: nomAffiche });
}

export async function rejoindre(
  codeReunion: string,
  input: { nomAffiche: string; codeAcces?: string; reconnectToken?: string; modeConnexion?: ModeConnexionParticipant },
  utilisateurConnecte: { id: string } | undefined
) {
  const reunion = await prisma.reunion.findUnique({ where: { codeReunion } });
  if (!reunion) throw new AppError('Réunion introuvable', 404);
  if (reunion.statut === 'TERMINEE') throw new AppError('Cette réunion est terminée', 409);

  const estHote = !!utilisateurConnecte && utilisateurConnecte.id === reunion.hoteId;

  // Reprise de session en priorité absolue, avant même le contrôle de
  // verrouillage/code d'accès : un participant déjà admis ne doit jamais
  // re-subir la salle d'attente après une coupure (brief : "rejoindre en un
  // clic... sans qu'il ait à redemander l'autorisation d'entrée").
  if (input.reconnectToken) {
    const hash = hasherToken(input.reconnectToken);
    const existant = await prisma.participant.findUnique({ where: { reconnectTokenHash: hash } });
    if (existant && existant.reunionId === reunion.id && existant.statutAttente === 'ADMIS') {
      const livekitToken = await emettreAccesLivekit(reunion, existant.livekitIdentity, existant.nomAffiche);
      const misAJour = await prisma.participant.update({
        where: { id: existant.id },
        data: { dateHeureSortie: null },
      });
      return {
        participant: misAJour,
        livekitToken,
        reconnectToken: input.reconnectToken,
        enAttente: false,
        reunion: infoReunionPublique(reunion),
      };
    }
    // Token invalide/expiré/mauvaise réunion : retombe sur un flux de jointe normal.
  }

  if (reunion.verrouillee && !estHote) {
    throw new AppError("Cette réunion est verrouillée par l'hôte", 409);
  }

  if (reunion.codeAcces && !estHote) {
    if (!input.codeAcces || input.codeAcces !== reunion.codeAcces) {
      throw new AppError("Code d'accès incorrect", 401);
    }
  }

  const livekitIdentity = uuidv4();
  const reconnectToken = genererReconnectToken();
  const reconnectTokenHash = hasherToken(reconnectToken);
  const salleAttenteApplicable = reunion.salleAttenteActive && !estHote;

  const participant = await prisma.participant.create({
    data: {
      reunionId: reunion.id,
      utilisateurId: utilisateurConnecte?.id,
      nomAffiche: input.nomAffiche,
      modeConnexion: input.modeConnexion ?? 'VIDEO',
      statutAttente: salleAttenteApplicable ? 'EN_ATTENTE' : 'ADMIS',
      dateHeureEntree: salleAttenteApplicable ? null : new Date(),
      livekitIdentity,
      reconnectTokenHash,
    },
  });

  if (salleAttenteApplicable) {
    return { participant, enAttente: true, reconnectToken, reunion: infoReunionPublique(reunion) };
  }

  if (estHote && reunion.statut === 'PLANIFIEE') {
    await prisma.reunion.update({ where: { id: reunion.id }, data: { statut: 'EN_COURS' } });
  }

  const livekitToken = await emettreAccesLivekit(reunion, livekitIdentity, input.nomAffiche);
  return { participant, livekitToken, reconnectToken, enAttente: false, reunion: infoReunionPublique(reunion) };
}

// Auth légère pour les invités sans compte : le participant prouve son
// identité en renvoyant le reconnectToken opaque reçu à la jointe (jamais un
// Bearer JWT complet, disproportionné pour un simple envoi de message de chat).
export async function verifierParticipantParToken(participantId: string, reconnectToken: string) {
  const hash = hasherToken(reconnectToken);
  const participant = await prisma.participant.findUnique({ where: { id: participantId } });
  if (!participant || participant.reconnectTokenHash !== hash) {
    throw new AppError('Authentification participant invalide', 401);
  }
  return participant;
}

// Départ volontaire (bouton "Quitter" côté participant) — distinct de
// `retirer` (action hôte). Idempotent : un second appel (ex. double-clic, ou
// le disconnect LiveKit qui se déclenche en parallèle) ne doit pas échouer.
export async function quitterVolontairement(participantId: string, reconnectToken: string) {
  const participant = await verifierParticipantParToken(participantId, reconnectToken);
  if (participant.dateHeureSortie) return participant;
  return prisma.participant.update({
    where: { id: participantId },
    data: { dateHeureSortie: new Date() },
  });
}

export async function listerEnAttente(reunionId: string) {
  return prisma.participant.findMany({
    where: { reunionId, statutAttente: 'EN_ATTENTE' },
    orderBy: { createdAt: 'asc' },
  });
}

export async function obtenirStatutAttente(participantId: string) {
  const participant = await prisma.participant.findUnique({ where: { id: participantId } });
  if (!participant) throw new AppError('Participant introuvable', 404);
  return { statutAttente: participant.statutAttente };
}

async function chargerParticipantEtReunion(participantId: string) {
  const participant = await prisma.participant.findUnique({
    where: { id: participantId },
    include: { reunion: true },
  });
  if (!participant) throw new AppError('Participant introuvable', 404);
  return participant;
}

export async function admettre(participantId: string) {
  const participant = await chargerParticipantEtReunion(participantId);
  if (participant.statutAttente !== 'EN_ATTENTE') throw new AppError("Ce participant n'est pas en attente", 409);

  const misAJour = await prisma.participant.update({
    where: { id: participantId },
    data: { statutAttente: 'ADMIS', dateHeureEntree: new Date() },
  });
  const livekitToken = await emettreAccesLivekit(participant.reunion, participant.livekitIdentity, participant.nomAffiche);
  return { participant: misAJour, livekitToken };
}

export async function rejeter(participantId: string) {
  const participant = await chargerParticipantEtReunion(participantId);
  if (participant.statutAttente !== 'EN_ATTENTE') throw new AppError("Ce participant n'est pas en attente", 409);
  return prisma.participant.update({ where: { id: participantId }, data: { statutAttente: 'REJETE' } });
}

export async function couperMicro(participantId: string) {
  const participant = await chargerParticipantEtReunion(participantId);
  await couperMicroParticipant(participant.reunion.livekitRoomName, participant.livekitIdentity);
}

export async function couperCamera(participantId: string) {
  const participant = await chargerParticipantEtReunion(participantId);
  await couperCameraParticipant(participant.reunion.livekitRoomName, participant.livekitIdentity);
}

export async function retirer(participantId: string) {
  const participant = await chargerParticipantEtReunion(participantId);
  await retirerDuFluxMedia(participant.reunion.livekitRoomName, participant.livekitIdentity);
  return prisma.participant.update({ where: { id: participantId }, data: { dateHeureSortie: new Date() } });
}
