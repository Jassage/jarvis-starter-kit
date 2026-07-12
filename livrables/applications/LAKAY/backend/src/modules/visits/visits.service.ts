import prisma from '../../config/database';

/**
 * Marque COMPLETED les visites CONFIRMED dont la date proposée est passée.
 * Rien dans l'app ne bascule jamais une visite vers COMPLETED manuellement
 * (ni le demandeur ni le propriétaire) — c'est la seule voie vers ce statut,
 * requis (avec CONFIRMED) pour pouvoir laisser un avis sur l'annonce.
 *
 * @returns le nombre de visites basculées
 */
export async function completeElapsedVisits(): Promise<number> {
  const result = await prisma.visitRequest.updateMany({
    where: { status: 'CONFIRMED', proposedDate: { lt: new Date() } },
    data: { status: 'COMPLETED' },
  });
  return result.count;
}
