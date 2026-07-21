import prisma from '../../config/database';
import { AppError } from '../../middlewares/errorHandler.middleware';
import { Prisma } from '@prisma/client';
import { getConfig } from '../config/config.service';

// Ce que la régie voit d'un replay : sa source à l'antenne.
const INCLUDE_ADMIN = {
  creneau: { select: { id: true, dateHeureDebut: true, dateHeureFin: true, typeCreneau: true } },
  match: { select: { id: true, nomEvenement: true, equipes: true } },
} as const;

// Fenêtre de droits de diffusion : un replay n'est publiquement visible que s'il est
// PUBLIE *et* dans sa fenêtre. Les deux bornes sont optionnelles (aucune borne = pas
// de limite de licence). Une licence expirée retire donc le replay du catalogue toute
// seule, sans qu'un opérateur ait à intervenir.
function filtrePublic(now = new Date()): Prisma.ReplayWhereInput {
  return {
    statut: 'PUBLIE',
    AND: [
      { OR: [{ disponibleDu: null }, { disponibleDu: { lte: now } }] },
      { OR: [{ disponibleAu: null }, { disponibleAu: { gt: now } }] },
    ],
  };
}

// ─────────────────────────────────────────
// PUBLIC
// ─────────────────────────────────────────

interface CatalogueOptions {
  q?: string;
  type?: 'MATCH' | 'PROGRAMME';
  page?: number;
  limit?: number;
}

export async function getCatalogue({ q, type, page = 1, limit = 24 }: CatalogueOptions) {
  const where: Prisma.ReplayWhereInput = {
    ...filtrePublic(),
    ...(q ? { titre: { contains: q, mode: 'insensitive' } } : {}),
    // Un replay de match porte toujours un matchId (posé depuis le créneau source
    // ou fourni à la création) — c'est le discriminant, pas le type de créneau.
    ...(type === 'MATCH' ? { matchId: { not: null } } : {}),
    ...(type === 'PROGRAMME' ? { matchId: null } : {}),
  };

  const [replays, total] = await Promise.all([
    prisma.replay.findMany({
      where,
      select: {
        id: true,
        titre: true,
        description: true,
        vignetteUrl: true,
        dureeSecondes: true,
        nombreVues: true,
        publieAt: true,
        matchId: true,
        creneau: { select: { dateHeureDebut: true } },
      },
      orderBy: { publieAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.replay.count({ where }),
  ]);

  return { replays, total, page, limit };
}

// Détail public : le replay rejoue l'habillage sponsor de son créneau d'origine.
// L'habillage est relu au moment du visionnage (jamais figé à la publication) : un
// contrat sponsor arrêté ou une incrustation désactivée disparaît donc aussi des
// replays, sans retoucher l'historique de diffusion.
export async function getReplayPublic(id: string) {
  const replay = await prisma.replay.findFirst({
    where: { id, ...filtrePublic() },
    include: {
      creneau: {
        select: {
          id: true,
          dateHeureDebut: true,
          dateHeureFin: true,
          typeCreneau: true,
          incrustations: { where: { actif: true }, include: { sponsor: true } },
          bandeaux: { where: { actif: true } },
        },
      },
      match: { select: { id: true, nomEvenement: true, equipes: true } },
    },
  });
  if (!replay) throw new AppError('Replay non trouvé', 404);

  const config = await getConfig();
  const configChaine = config.logoActif && config.logoUrl
    ? {
        nomChaine: config.nomChaine,
        logoUrl: config.logoUrl,
        logoPosition: config.logoPosition,
        logoOpacite: config.logoOpacite,
      }
    : null;

  return {
    replay,
    incrustations: replay.creneau?.incrustations ?? [],
    bandeaux: replay.creneau?.bandeaux ?? [],
    configChaine,
  };
}

// Compteur de vues du catalogue à la demande. Volontairement distinct des
// DiffusionLog de l'antenne : une vue replay n'est pas une diffusion linéaire, les
// deux ne doivent jamais être additionnées dans les rapports sponsors.
export async function incrementerVue(id: string) {
  const visible = await prisma.replay.findFirst({ where: { id, ...filtrePublic() }, select: { id: true } });
  if (!visible) throw new AppError('Replay non trouvé', 404);
  const replay = await prisma.replay.update({
    where: { id },
    data: { nombreVues: { increment: 1 } },
    select: { id: true, nombreVues: true },
  });
  return replay;
}

// ─────────────────────────────────────────
// RÉGIE
// ─────────────────────────────────────────

export async function listReplaysAdmin() {
  return prisma.replay.findMany({ include: INCLUDE_ADMIN, orderBy: { createdAt: 'desc' } });
}

export async function getReplay(id: string) {
  const replay = await prisma.replay.findUnique({ where: { id }, include: INCLUDE_ADMIN });
  if (!replay) throw new AppError('Replay non trouvé', 404);
  return replay;
}

// Créneaux réellement passés à l'antenne et pas encore publiés en replay — alimente
// le sélecteur "Publier depuis la grille" côté régie.
export async function listCreneauxReplayables() {
  return prisma.creneauGrille.findMany({
    where: {
      syncStatus: 'SYNCHRONISE',
      dateHeureFin: { lt: new Date() },
      replay: null,
    },
    include: {
      contenu: { select: { id: true, titre: true, urlFichier: true } },
      match: { select: { id: true, nomEvenement: true, equipes: true } },
    },
    orderBy: { dateHeureDebut: 'desc' },
    take: 100,
  });
}

interface ReplayInput {
  titre: string;
  description?: string | null;
  urlVod: string;
  dureeSecondes: number;
  disponibleDu?: string | null;
  disponibleAu?: string | null;
  matchId?: string | null;
}

function toDate(v?: string | null) {
  return v ? new Date(v) : null;
}

export async function createReplay(data: ReplayInput) {
  return prisma.replay.create({
    data: {
      titre: data.titre,
      description: data.description || null,
      urlVod: data.urlVod,
      dureeSecondes: data.dureeSecondes,
      disponibleDu: toDate(data.disponibleDu),
      disponibleAu: toDate(data.disponibleAu),
      matchId: data.matchId || null,
    },
    include: INCLUDE_ADMIN,
  });
}

// Cœur du module : transformer ce qui est réellement passé à l'antenne en replay.
export async function createReplayDepuisCreneau(creneauId: string, data: Partial<ReplayInput>) {
  const creneau = await prisma.creneauGrille.findUnique({
    where: { id: creneauId },
    include: { contenu: true, match: true, replay: { select: { id: true } } },
  });
  if (!creneau) throw new AppError('Créneau non trouvé', 404);

  // Même règle que l'EPG public : un brouillon n'est jamais passé à l'antenne, il ne
  // peut donc pas donner lieu à un replay.
  if (creneau.syncStatus !== 'SYNCHRONISE') {
    throw new AppError('Ce créneau n\'a jamais été synchronisé à l\'antenne : il ne peut pas être publié en replay', 409);
  }
  if (creneau.dateHeureFin >= new Date()) {
    throw new AppError('Ce créneau n\'est pas encore terminé : seul un programme déjà diffusé peut être publié en replay', 409);
  }
  if (creneau.replay) {
    throw new AppError('Ce créneau a déjà un replay', 409);
  }

  // Un match direct n'a aucun fichier : l'enregistrement vient du serveur RTMP
  // (MediaMTX) ou du CDN et son URL doit être saisie par l'opérateur. On ne la
  // devine jamais, sous peine de publier un replay qui ne lit rien.
  const urlVod = data.urlVod || creneau.contenu?.urlFichier;
  if (!urlVod) {
    throw new AppError(
      'Aucun fichier associé à ce créneau : renseignez l\'URL de l\'enregistrement (VOD) pour publier ce replay',
      400
    );
  }

  const titre =
    data.titre ||
    (creneau.match ? `${creneau.match.nomEvenement} — ${creneau.match.equipes}` : creneau.contenu?.titre) ||
    'Programme';

  const dureeCreneau = Math.max(
    0,
    Math.round((creneau.dateHeureFin.getTime() - creneau.dateHeureDebut.getTime()) / 1000)
  );

  return prisma.replay.create({
    data: {
      titre,
      description: data.description || null,
      urlVod,
      dureeSecondes: data.dureeSecondes ?? dureeCreneau,
      disponibleDu: toDate(data.disponibleDu),
      disponibleAu: toDate(data.disponibleAu),
      creneauId: creneau.id,
      matchId: creneau.matchId,
    },
    include: INCLUDE_ADMIN,
  });
}

export async function updateReplay(id: string, data: Partial<ReplayInput>) {
  const existing = await prisma.replay.findUnique({ where: { id } });
  if (!existing) throw new AppError('Replay non trouvé', 404);

  return prisma.replay.update({
    where: { id },
    data: {
      ...(data.titre !== undefined && { titre: data.titre }),
      ...(data.description !== undefined && { description: data.description || null }),
      ...(data.urlVod !== undefined && { urlVod: data.urlVod }),
      ...(data.dureeSecondes !== undefined && { dureeSecondes: data.dureeSecondes }),
      ...(data.disponibleDu !== undefined && { disponibleDu: toDate(data.disponibleDu) }),
      ...(data.disponibleAu !== undefined && { disponibleAu: toDate(data.disponibleAu) }),
    },
    include: INCLUDE_ADMIN,
  });
}

export async function updateVignette(id: string, vignetteUrl: string) {
  const existing = await prisma.replay.findUnique({ where: { id } });
  if (!existing) throw new AppError('Replay non trouvé', 404);
  return prisma.replay.update({ where: { id }, data: { vignetteUrl }, include: INCLUDE_ADMIN });
}

export async function publierReplay(id: string) {
  const existing = await prisma.replay.findUnique({ where: { id } });
  if (!existing) throw new AppError('Replay non trouvé', 404);
  if (!existing.urlVod) {
    throw new AppError('Impossible de publier un replay sans URL de fichier VOD', 400);
  }
  // Publier un replay dont la fenêtre de droits est déjà close reviendrait à publier
  // dans le vide (il n'apparaîtrait nulle part) : autant le refuser explicitement.
  if (existing.disponibleAu && existing.disponibleAu <= new Date()) {
    throw new AppError('La fenêtre de droits de ce replay est expirée : ajustez la date de fin avant de publier', 409);
  }
  return prisma.replay.update({
    where: { id },
    data: { statut: 'PUBLIE', publieAt: existing.publieAt ?? new Date() },
    include: INCLUDE_ADMIN,
  });
}

export async function retirerReplay(id: string) {
  const existing = await prisma.replay.findUnique({ where: { id } });
  if (!existing) throw new AppError('Replay non trouvé', 404);
  return prisma.replay.update({ where: { id }, data: { statut: 'RETIRE' }, include: INCLUDE_ADMIN });
}

export async function deleteReplay(id: string) {
  const existing = await prisma.replay.findUnique({ where: { id } });
  if (!existing) throw new AppError('Replay non trouvé', 404);
  await prisma.replay.delete({ where: { id } });
}
