import { Devise, DepartementFolio, Prisma } from '@prisma/client';
import prisma from '../../config/database';
import { AppError } from '../../middlewares/errorHandler.middleware';
import { recalculerStatutPaiement } from '../factures/factures.service';

const INCLUDE_LIGNES = {
  lignes: { orderBy: { dateHeure: 'desc' as const }, include: { employe: { select: { id: true, nom: true } } } },
};

// Appelée depuis reception.service.ts::checkin(), dans la même transaction que le
// CAS chambre — un check-in réussi ouvre toujours un folio.
export async function ouvrirFolio(tx: Prisma.TransactionClient, reservationId: string, etablissementId: string, devise: Devise) {
  return tx.folio.create({ data: { reservationId, etablissementId, devise } });
}

// Appelée depuis reception.service.ts::checkout(), APRÈS vérification du solde —
// simple CAS, ne fait rien si déjà fermé (idempotence défensive).
export async function fermerFolio(tx: Prisma.TransactionClient, reservationId: string) {
  await tx.folio.updateMany({
    where: { reservationId, statut: 'OUVERT' },
    data: { statut: 'FERME', dateFermeture: new Date() },
  });
}

export async function getFolio(reservationId: string, etablissementId: string | null | undefined) {
  const reservation = await prisma.reservation.findUnique({ where: { id: reservationId }, select: { etablissementId: true } });
  if (!reservation) throw new AppError('Réservation non trouvée', 404);
  if (etablissementId && reservation.etablissementId !== etablissementId) {
    throw new AppError('Cette réservation n\'appartient pas à votre établissement', 403);
  }

  const folio = await prisma.folio.findUnique({ where: { reservationId }, include: INCLUDE_LIGNES });
  if (!folio) throw new AppError('Folio non trouvé', 404);
  return folio;
}

// Utilisée par le POS restaurant/bar pour "ajouter au folio de la chambre X" — le
// serveur ne connaît que le numéro de chambre, pas l'id interne du folio.
export async function getFolioOuvertParNumeroChambre(numero: string, etablissementId: string) {
  const chambre = await prisma.chambre.findFirst({ where: { etablissementId, numero } });
  if (!chambre) throw new AppError('Chambre introuvable', 404);

  const folio = await prisma.folio.findFirst({
    where: { statut: 'OUVERT', reservation: { chambreId: chambre.id } },
    include: { reservation: { include: { client: true } } },
  });
  if (!folio) throw new AppError('Aucun séjour en cours pour cette chambre', 404);
  return folio;
}

// Variante directe pour les modules "simples" (minibar, blanchisserie, conciergerie,
// voiturier) qui connaissent déjà la chambre (chambreId) sans passer par un numéro
// saisi par un employé — évite l'aller-retour numéro→chambre de la fonction ci-dessus.
export async function getFolioOuvertParChambreId(chambreId: string, etablissementId: string) {
  const chambre = await prisma.chambre.findUnique({ where: { id: chambreId } });
  if (!chambre || chambre.etablissementId !== etablissementId) throw new AppError('Chambre introuvable', 404);

  const folio = await prisma.folio.findFirst({
    where: { statut: 'OUVERT', reservation: { chambreId } },
  });
  if (!folio) throw new AppError('Aucun séjour en cours pour cette chambre', 404);
  return folio;
}

// Insère la LigneFolio puis répercute sur Facture.montantTotal (le Folio EST la
// facture maîtresse du séjour, cf. décision du plan) — recalcule toujours depuis
// une somme fraîche de toutes les LigneFolio, jamais un cumul incrémental fragile.
// Appelée dans la transaction du service appelant (ex. restaurant.service.ts).
export async function ajouterLigneFolio(
  tx: Prisma.TransactionClient,
  folioId: string,
  data: { departementSource: DepartementFolio; description: string; montant: number; employeId?: string }
) {
  const folio = await tx.folio.findUnique({ where: { id: folioId } });
  if (!folio) throw new AppError('Folio introuvable', 404);
  if (folio.statut !== 'OUVERT') throw new AppError('Ce folio est déjà fermé', 409);

  await tx.ligneFolio.create({ data: { folioId, ...data } });

  const facture = await tx.facture.findUniqueOrThrow({ where: { reservationId: folio.reservationId } });
  const sommeLignes = await tx.ligneFolio.aggregate({ where: { folioId }, _sum: { montant: true } });
  const nouveauTotal = Number(facture.montantHT) + Number(facture.taxes) + Number(sommeLignes._sum.montant ?? 0);

  await tx.facture.update({ where: { id: facture.id }, data: { montantTotal: nouveauTotal } });
  await recalculerStatutPaiement(tx, facture.id);
}
