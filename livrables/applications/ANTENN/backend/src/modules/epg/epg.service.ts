import prisma from '../../config/database';

const INCLUDE = {
  contenu: { include: { sponsor: true } },
  match: { include: { sponsorPrincipal: true } },
  incrustations: { where: { actif: true }, include: { sponsor: true } },
  bandeaux: { where: { actif: true } },
} as const;

// EPG public consommé par le player : créneau courant + les suivants de la journée.
// Ne remonte que la grille synchronisée (ce qui est réellement à l'antenne), jamais
// un brouillon en cours d'édition côté admin.
export async function getEpg() {
  const now = new Date();
  const finJournee = new Date(now);
  finJournee.setHours(23, 59, 59, 999);

  const [enCours, aSuivre] = await Promise.all([
    prisma.creneauGrille.findFirst({
      where: { syncStatus: 'SYNCHRONISE', dateHeureDebut: { lte: now }, dateHeureFin: { gt: now } },
      include: INCLUDE,
    }),
    prisma.creneauGrille.findMany({
      where: { syncStatus: 'SYNCHRONISE', dateHeureDebut: { gt: now, lte: finJournee } },
      include: INCLUDE,
      orderBy: { dateHeureDebut: 'asc' },
      take: 10,
    }),
  ]);

  return { enCours, aSuivre };
}
