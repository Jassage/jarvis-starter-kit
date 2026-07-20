import prisma from '../../config/database';
import { AppError } from '../../middlewares/errorHandler.middleware';
import { Prisma, TypeCreneau } from '@prisma/client';

const INCLUDE = {
  contenu: { include: { sponsor: true } },
  match: { include: { sponsorPrincipal: true } },
} as const;

// Une chaîne linéaire ne diffuse qu'un seul programme à un instant t : deux créneaux
// ne peuvent jamais se chevaucher dans la grille (les logos/bandeaux sponsors, eux, se
// superposent — mais ce sont des overlays d'habillage, pas des créneaux de grille).
// Bornes half-open [début, fin) : deux créneaux adjacents (fin de l'un = début de
// l'autre) ne se chevauchent pas. Exécuté dans une transaction pour lire/écrire de
// façon cohérente sous la concurrence normale d'une régie (peu d'opérateurs).
async function assertPasDeChevauchement(
  tx: Prisma.TransactionClient,
  debut: Date,
  fin: Date,
  excludeId?: string
) {
  const conflit = await tx.creneauGrille.findFirst({
    where: {
      ...(excludeId ? { id: { not: excludeId } } : {}),
      dateHeureDebut: { lt: fin },
      dateHeureFin: { gt: debut },
    },
    select: { id: true, dateHeureDebut: true, dateHeureFin: true },
  });
  if (conflit) {
    const d = conflit.dateHeureDebut.toISOString();
    const f = conflit.dateHeureFin.toISOString();
    throw new AppError(`Ce créneau chevauche un créneau déjà programmé (${d} → ${f})`, 409);
  }
}

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
  const debut = new Date(data.dateHeureDebut);
  const fin = new Date(data.dateHeureFin);
  return prisma.$transaction(async (tx) => {
    await assertPasDeChevauchement(tx, debut, fin);
    return tx.creneauGrille.create({
      data: {
        dateHeureDebut: debut,
        dateHeureFin: fin,
        typeCreneau: data.typeCreneau,
        contenuId: data.contenuId || null,
        matchId: data.matchId || null,
        syncStatus: 'BROUILLON',
      },
      include: INCLUDE,
    });
  });
}

export async function updateCreneau(id: string, data: Partial<CreneauInput>) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.creneauGrille.findUnique({ where: { id } });
    if (!existing) throw new AppError('Créneau non trouvé', 404);
    assertModifiable(existing.dateHeureFin);

    const nextDebut = data.dateHeureDebut ? new Date(data.dateHeureDebut) : existing.dateHeureDebut;
    const nextFin = data.dateHeureFin ? new Date(data.dateHeureFin) : existing.dateHeureFin;
    if (nextFin <= nextDebut) {
      throw new AppError('La date de fin doit être postérieure à la date de début', 400);
    }
    await assertPasDeChevauchement(tx, nextDebut, nextFin, id);

    return tx.creneauGrille.update({
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
  });
}

export async function deleteCreneau(id: string) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.creneauGrille.findUnique({ where: { id } });
    if (!existing) throw new AppError('Créneau non trouvé', 404);
    assertModifiable(existing.dateHeureFin);
    await tx.creneauGrille.delete({ where: { id } });
  });
}

export async function dupliquerCreneau(id: string, nouveauDebut: string) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.creneauGrille.findUnique({ where: { id } });
    if (!existing) throw new AppError('Créneau non trouvé', 404);

    const dureeMs = existing.dateHeureFin.getTime() - existing.dateHeureDebut.getTime();
    const debut = new Date(nouveauDebut);
    const fin = new Date(debut.getTime() + dureeMs);
    await assertPasDeChevauchement(tx, debut, fin);

    return tx.creneauGrille.create({
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

// Détection des trous de grille (dead-air potentiel) sur une fenêtre. Seule la grille
// SYNCHRONISE compte : c'est ce qui est réellement à l'antenne. Un brouillon posé dans
// un trou ne le comble pas (il n'est pas encore répercuté vers le playout). Fenêtre par
// défaut : maintenant → +24h.
export async function detecterTrous(from?: string, to?: string) {
  const debutFenetre = from ? new Date(from) : new Date();
  const finFenetre = to ? new Date(to) : new Date(debutFenetre.getTime() + 24 * 60 * 60 * 1000);

  // Tous les créneaux synchronisés qui intersectent la fenêtre [debut, fin).
  const creneaux = await prisma.creneauGrille.findMany({
    where: {
      syncStatus: 'SYNCHRONISE',
      dateHeureDebut: { lt: finFenetre },
      dateHeureFin: { gt: debutFenetre },
    },
    select: { dateHeureDebut: true, dateHeureFin: true },
    orderBy: { dateHeureDebut: 'asc' },
  });

  const trous: { debut: string; fin: string; dureeMinutes: number }[] = [];
  // Curseur = borne haute de couverture continue depuis le début de la fenêtre.
  let curseur = debutFenetre;
  for (const c of creneaux) {
    const debut = c.dateHeureDebut < debutFenetre ? debutFenetre : c.dateHeureDebut;
    if (debut > curseur) {
      trous.push({
        debut: curseur.toISOString(),
        fin: debut.toISOString(),
        dureeMinutes: Math.round((debut.getTime() - curseur.getTime()) / 60000),
      });
    }
    // La couverture avance jusqu'à la fin la plus tardive rencontrée (créneaux
    // adjacents ou imbriqués : on ne recule jamais le curseur).
    if (c.dateHeureFin > curseur) curseur = c.dateHeureFin;
  }
  // Trou final entre la dernière couverture et la fin de la fenêtre.
  if (curseur < finFenetre) {
    trous.push({
      debut: curseur.toISOString(),
      fin: finFenetre.toISOString(),
      dureeMinutes: Math.round((finFenetre.getTime() - curseur.getTime()) / 60000),
    });
  }

  const totalMinutes = trous.reduce((sum, t) => sum + t.dureeMinutes, 0);
  return {
    fenetre: { from: debutFenetre.toISOString(), to: finFenetre.toISOString() },
    trous,
    totalMinutes,
  };
}
