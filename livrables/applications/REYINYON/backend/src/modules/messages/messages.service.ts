import prisma from '../../config/database';
import { AppError } from '../../middlewares/errorHandler.middleware';
import { verifierParticipantParToken } from '../participants/participants.service';

async function chargerReunionEtParticipant(codeReunion: string, participantId: string, reconnectToken: string) {
  const reunion = await prisma.reunion.findUnique({ where: { codeReunion } });
  if (!reunion) throw new AppError('Réunion introuvable', 404);

  const participant = await verifierParticipantParToken(participantId, reconnectToken);
  if (participant.reunionId !== reunion.id) throw new AppError('Participant étranger à cette réunion', 403);

  return { reunion, participant };
}

// Persistance = source de vérité (historique consultable par un participant
// qui rejoint en cours de route) — la diffusion en temps réel aux autres
// participants passe par le data channel LiveKit côté frontend, pas par un
// second transport temps réel (Socket.io) redondant avec le SFU déjà en place.
export async function envoyerMessage(codeReunion: string, participantId: string, reconnectToken: string, contenu: string) {
  const { reunion, participant } = await chargerReunionEtParticipant(codeReunion, participantId, reconnectToken);

  return prisma.messageChat.create({
    data: { reunionId: reunion.id, participantId: participant.id, type: 'TEXTE', contenu },
    include: { participant: { select: { nomAffiche: true } } },
  });
}

// Photo ou message vocal — même vérification d'identité que le texte, le
// fichier a déjà été écrit sur disque par multer (config/upload.ts) avant
// d'arriver ici, on ne fait que l'enregistrer dans l'historique du chat.
export async function envoyerMessageMedia(
  codeReunion: string,
  participantId: string,
  reconnectToken: string,
  type: 'PHOTO' | 'AUDIO',
  nomFichier: string
) {
  const { reunion, participant } = await chargerReunionEtParticipant(codeReunion, participantId, reconnectToken);

  return prisma.messageChat.create({
    data: { reunionId: reunion.id, participantId: participant.id, type, urlFichier: `/uploads/chat/${nomFichier}` },
    include: { participant: { select: { nomAffiche: true } } },
  });
}

export async function historique(codeReunion: string, participantId: string, reconnectToken: string) {
  const { reunion } = await chargerReunionEtParticipant(codeReunion, participantId, reconnectToken);

  return prisma.messageChat.findMany({
    where: { reunionId: reunion.id },
    orderBy: { envoyeA: 'asc' },
    include: { participant: { select: { nomAffiche: true } } },
  });
}
