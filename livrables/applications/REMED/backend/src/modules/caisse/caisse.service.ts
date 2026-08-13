import prisma from '../../config/database';
import { AppError } from '../../types';

export async function getActive(pharmacieId: string) {
  return prisma.caisseSession.findFirst({
    where: { pharmacieId, statut: 'OUVERTE' },
    include: {
      ouvertePar: { select: { nom: true, prenom: true } },
      transactions: { orderBy: { createdAt: 'desc' }, take: 20 },
    },
  });
}

export async function ouvrir(pharmacieId: string, montantOuverture: number, utilisateurId: string) {
  const dejaOuverte = await prisma.caisseSession.findFirst({ where: { pharmacieId, statut: 'OUVERTE' } });
  if (dejaOuverte) throw new AppError(409, 'Une session de caisse est déjà ouverte');

  return prisma.caisseSession.create({
    data: { pharmacieId, montantOuverture, ouvertParId: utilisateurId },
  });
}

// Solde théorique = ouverture + espèces des ventes de la session + entrées manuelles - sorties manuelles.
// Seules les transactions ESPECES affectent le tiroir-caisse physique (carte/mobile money non).
export async function fermer(pharmacieId: string, id: string, montantFermeture: number, utilisateurId: string) {
  const session = await prisma.caisseSession.findFirst({
    where: { id, pharmacieId },
    include: { transactions: true },
  });
  if (!session) throw new AppError(404, 'Session de caisse introuvable');
  if (session.statut !== 'OUVERTE') throw new AppError(400, 'Cette session est déjà fermée');

  let soldeTheorique = Number(session.montantOuverture);
  for (const t of session.transactions) {
    if (t.type === 'VENTE' || t.type === 'ENTREE_MANUELLE') soldeTheorique += Number(t.montant);
    else if (t.type === 'SORTIE_MANUELLE') soldeTheorique -= Number(t.montant);
  }
  const ecart = montantFermeture - soldeTheorique;

  return prisma.caisseSession.update({
    where: { id },
    data: {
      statut: 'FERMEE',
      montantFermeture,
      soldeTheorique,
      ecart,
      fermeeParId: utilisateurId,
      fermeeLe: new Date(),
    },
  });
}

export async function mouvementManuel(
  pharmacieId: string,
  type: 'ENTREE_MANUELLE' | 'SORTIE_MANUELLE',
  montant: number,
  motif: string,
  utilisateurId: string
) {
  const session = await prisma.caisseSession.findFirst({ where: { pharmacieId, statut: 'OUVERTE' } });
  if (!session) throw new AppError(400, 'Aucune session de caisse ouverte');

  return prisma.caisseTransaction.create({
    data: { caisseSessionId: session.id, type, montant, motif, utilisateurId },
  });
}

export async function historique(pharmacieId: string, limit: number) {
  return prisma.caisseSession.findMany({
    where: { pharmacieId },
    include: { ouvertePar: { select: { nom: true, prenom: true } }, fermeePar: { select: { nom: true, prenom: true } } },
    orderBy: { ouverteLe: 'desc' },
    take: limit,
  });
}
