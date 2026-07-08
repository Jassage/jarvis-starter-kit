import prisma from '../../config/database';
import { AppError } from '../../middlewares/errorHandler.middleware';
import { TypeCreneau } from '@prisma/client';

const INCLUDE = {
  contenu: { include: { sponsor: true } },
  match: { include: { sponsorPrincipal: true } },
} as const;

export async function listCreneaux(from?: string, to?: string) {
  return prisma.creneauGrille.findMany({
    where: {
      ...(from || to
        ? {
            dateHeureDebut: {
              ...(from ? { gte: new Date(from) } : {}),
              ...(to ? { lte: new Date(to) } : {}),
            },
          }
        : {}),
    },
    include: INCLUDE,
    orderBy: { dateHeureDebut: 'asc' },
  });
}

export async function getCreneau(id: string) {
  const creneau = await prisma.creneauGrille.findUnique({ where: { id }, include: INCLUDE });
  if (!creneau) throw new AppError('Créneau non trouvé', 404);
  return creneau;
}

interface CreneauInput {
  dateHeureDebut: string;
  dateHeureFin: string;
  typeCreneau: TypeCreneau;
  contenuId?: string | null;
  matchId?: string | null;
}

// Un créneau déjà diffusé (fin < maintenant) est un historique figé — jamais
// modifiable ni supprimable, quel que soit le rôle.
function assertModifiable(dateHeureFin: Date) {
  if (dateHeureFin < new Date()) {
    throw new AppError('Ce créneau est déjà diffusé : l\'historique de la grille ne peut pas être modifié', 409);
  }
}

export async function createCreneau(data: CreneauInput) {
  return prisma.creneauGrille.create({
    data: {
      dateHeureDebut: new Date(data.dateHeureDebut),
      dateHeureFin: new Date(data.dateHeureFin),
      typeCreneau: data.typeCreneau,
      contenuId: data.contenuId || null,
      matchId: data.matchId || null,
      syncStatus: 'BROUILLON',
    },
    include: INCLUDE,
  });
}

export async function updateCreneau(id: string, data: Partial<CreneauInput>) {
  const existing = await prisma.creneauGrille.findUnique({ where: { id } });
  if (!existing) throw new AppError('Créneau non trouvé', 404);
  assertModifiable(existing.dateHeureFin);

  const nextDebut = data.dateHeureDebut ? new Date(data.dateHeureDebut) : existing.dateHeureDebut;
  const nextFin = data.dateHeureFin ? new Date(data.dateHeureFin) : existing.dateHeureFin;
  if (nextFin <= nextDebut) {
    throw new AppError('La date de fin doit être postérieure à la date de début', 400);
  }

  return prisma.creneauGrille.update({
    where: { id },
    data: {
      dateHeureDebut: nextDebut,
      dateHeureFin: nextFin,
      typeCreneau: data.typeCreneau ?? existing.typeCreneau,
      contenuId: data.contenuId !== undefined ? data.contenuId : existing.contenuId,
      matchId: data.matchId !== undefined ? data.matchId : existing.matchId,
      // Toute édition remet le créneau en brouillon : il doit être re-synchronisé
      syncStatus: 'BROUILLON',
      syncedAt: null,
    },
    include: INCLUDE,
  });
}

export async function deleteCreneau(id: string) {
  const existing = await prisma.creneauGrille.findUnique({ where: { id } });
  if (!existing) throw new AppError('Créneau non trouvé', 404);
  assertModifiable(existing.dateHeureFin);
  await prisma.creneauGrille.delete({ where: { id } });
}

export async function dupliquerCreneau(id: string, nouveauDebut: string) {
  const existing = await prisma.creneauGrille.findUnique({ where: { id } });
  if (!existing) throw new AppError('Créneau non trouvé', 404);

  const dureeMs = existing.dateHeureFin.getTime() - existing.dateHeureDebut.getTime();
  const debut = new Date(nouveauDebut);
  const fin = new Date(debut.getTime() + dureeMs);

  return prisma.creneauGrille.create({
    data: {
      dateHeureDebut: debut,
      dateHeureFin: fin,
      typeCreneau: existing.typeCreneau,
      contenuId: existing.contenuId,
      matchId: existing.matchId,
      syncStatus: 'BROUILLON',
    },
    include: INCLUDE,
  });
}

// Action manuelle : pas de push automatique vers ErsatzTV dans cet environnement
// (cf. src/integrations/ersatztv.ts). L'opérateur confirme après avoir répercuté
// la grille dans ErsatzTV via son propre outillage.
export async function marquerSynchronise(id: string) {
  const existing = await prisma.creneauGrille.findUnique({ where: { id } });
  if (!existing) throw new AppError('Créneau non trouvé', 404);

  return prisma.creneauGrille.update({
    where: { id },
    data: { syncStatus: 'SYNCHRONISE', syncedAt: new Date() },
    include: INCLUDE,
  });
}

export async function compterBrouillons() {
  return prisma.creneauGrille.count({ where: { syncStatus: 'BROUILLON' } });
}
