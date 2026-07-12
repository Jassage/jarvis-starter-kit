import { customAlphabet } from 'nanoid';
import { ModeConnexion } from '@prisma/client';
import prisma from '../../config/database';
import { AppError } from '../../middlewares/errorHandler.middleware';
import { terminerSalle } from '../livekit/livekit.service';

// Alphabet sans caractères ambigus (pas de i/l/o/0/1) — le code se lit et se
// dicte à voix haute (utile pour le partager par téléphone/WhatsApp).
const ALPHABET_SANS_AMBIGU = 'abcdefghjkmnpqrstuvwxyz23456789';
const genererSegment = customAlphabet(ALPHABET_SANS_AMBIGU, 10);
// Purement numérique — un clavier téléphonique ne saisit pas bien des lettres.
const genererDigits = customAlphabet('0123456789', 6);

// Format "meet-like" xxx-xxxx-xxx, plus lisible qu'un id opaque.
async function genererCodeReunionUnique(): Promise<string> {
  for (let tentative = 0; tentative < 5; tentative++) {
    const raw = genererSegment();
    const code = `${raw.slice(0, 3)}-${raw.slice(3, 7)}-${raw.slice(7, 10)}`;
    const existe = await prisma.reunion.findUnique({ where: { codeReunion: code } });
    if (!existe) return code;
  }
  throw new AppError('Impossible de générer un code de réunion unique, réessayez', 500);
}

async function genererCodeTelephoneUnique(): Promise<string> {
  for (let tentative = 0; tentative < 5; tentative++) {
    const code = genererDigits();
    const existe = await prisma.reunion.findUnique({ where: { codeTelephone: code } });
    if (!existe) return code;
  }
  throw new AppError('Impossible de générer un code téléphone unique, réessayez', 500);
}

export async function creerReunion(
  hoteId: string,
  input: {
    titre: string;
    dateHeurePrevue?: Date;
    codeAcces?: string;
    salleAttenteActive?: boolean;
    modeConnexionMinimale?: ModeConnexion;
  }
) {
  const codeReunion = await genererCodeReunionUnique();
  const codeTelephone = await genererCodeTelephoneUnique();
  return prisma.reunion.create({
    data: {
      hoteId,
      titre: input.titre,
      dateHeurePrevue: input.dateHeurePrevue,
      codeAcces: input.codeAcces,
      salleAttenteActive: input.salleAttenteActive ?? false,
      modeConnexionMinimale: input.modeConnexionMinimale ?? 'VIDEO',
      codeReunion,
      codeTelephone,
      livekitRoomName: `reyinyon-${codeReunion}`,
    },
  });
}

export async function listerMesReunions(hoteId: string) {
  return prisma.reunion.findMany({
    where: { hoteId },
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { participants: true } } },
  });
}

// Vue publique (écran de pré-jointe) — ne jamais exposer codeAcces en clair ni hoteId.
export async function obtenirVuePublique(codeReunion: string) {
  const reunion = await prisma.reunion.findUnique({ where: { codeReunion } });
  if (!reunion) throw new AppError('Réunion introuvable', 404);
  return {
    titre: reunion.titre,
    statut: reunion.statut,
    verrouillee: reunion.verrouillee,
    salleAttenteActive: reunion.salleAttenteActive,
    codeAccesRequis: !!reunion.codeAcces,
    modeConnexionMinimale: reunion.modeConnexionMinimale,
  };
}

export async function trouverParCodeTelephone(codeTelephone: string) {
  return prisma.reunion.findUnique({ where: { codeTelephone } });
}

export async function obtenirDetailHote(reunionId: string) {
  const reunion = await prisma.reunion.findUnique({
    where: { id: reunionId },
    include: { participants: { orderBy: { createdAt: 'asc' } } },
  });
  if (!reunion) throw new AppError('Réunion introuvable', 404);
  return reunion;
}

export async function basculerVerrouillage(reunionId: string, verrouillee: boolean) {
  return prisma.reunion.update({ where: { id: reunionId }, data: { verrouillee } });
}

export async function demarrerReunion(reunionId: string) {
  return prisma.reunion.update({ where: { id: reunionId }, data: { statut: 'EN_COURS' } });
}

// Ferme la réunion pour TOUT le monde : supprime la room LiveKit (déconnecte
// tous les flux média en cours) puis marque la réunion terminée et clôt la
// présence des participants encore inscrits comme présents en base.
export async function terminerReunion(reunionId: string, livekitRoomName: string) {
  await terminerSalle(livekitRoomName);
  await prisma.$transaction([
    prisma.reunion.update({ where: { id: reunionId }, data: { statut: 'TERMINEE' } }),
    prisma.participant.updateMany({
      where: { reunionId, dateHeureSortie: null },
      data: { dateHeureSortie: new Date() },
    }),
  ]);
}
