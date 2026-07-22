import { MethodePaiement, Prisma, StatutPaiement } from '@prisma/client';
import prisma from '../../config/database';
import { AppError } from '../../middlewares/errorHandler.middleware';

const INCLUDE_PAIEMENTS = {
  paiements: {
    orderBy: { datePaiement: 'desc' as const },
    include: { employe: { select: { id: true, nom: true } } },
  },
};

// Relit toujours la Facture et ses Paiement depuis la base plutôt qu'un cumul
// incrémental fragile — appelée après tout paiement, et depuis folios.service.ts
// après qu'une LigneFolio ait fait grossir Facture.montantTotal (le Folio EST la
// facture maîtresse, cf. plan extension 5 étoiles).
export async function recalculerStatutPaiement(tx: Prisma.TransactionClient, factureId: string) {
  const facture = await tx.facture.findUniqueOrThrow({ where: { id: factureId }, include: { paiements: true } });
  const totalPaye = facture.paiements.reduce((s, p) => s + Number(p.montant), 0);
  const statut: StatutPaiement = totalPaye >= Number(facture.montantTotal) ? 'PAYE' : totalPaye > 0 ? 'PARTIEL' : 'IMPAYE';
  await tx.facture.update({ where: { id: factureId }, data: { statutPaiement: statut } });
}

// Dossier complet pour la génération du PDF (facture + réservation + client +
// établissement + paiements). Applique le cloisonnement d'établissement quand un
// etablissementId est fourni (back-office authentifié).
const INCLUDE_DOSSIER = {
  reservation: { include: { client: true, etablissement: true, chambre: { include: { typeChambre: true } } } },
  paiements: { orderBy: { datePaiement: 'asc' as const }, include: { employe: { select: { nom: true } } } },
};

export async function getDossierFacture(reservationId: string, etablissementId: string | null | undefined) {
  const facture = await prisma.facture.findUnique({ where: { reservationId }, include: INCLUDE_DOSSIER });
  if (!facture) throw new AppError('Facture non trouvée', 404);
  if (etablissementId && facture.reservation.etablissementId !== etablissementId) {
    throw new AppError('Cette facture n\'appartient pas à votre établissement', 403);
  }
  return facture;
}

// Variante publique : retrouve le dossier par référence de réservation, en exigeant
// la correspondance de l'email du client (même règle que la consultation publique).
export async function getDossierPublic(reference: string, email: string) {
  const facture = await prisma.facture.findFirst({
    where: { reservation: { reference } },
    include: INCLUDE_DOSSIER,
  });
  if (!facture || facture.reservation.client.email.toLowerCase() !== email.trim().toLowerCase()) {
    throw new AppError('Aucune facture ne correspond à cette référence et cet email', 404);
  }
  return facture;
}

export async function getFactureParReservation(reservationId: string, etablissementId: string | null | undefined) {
  const reservation = await prisma.reservation.findUnique({ where: { id: reservationId }, select: { etablissementId: true } });
  if (!reservation) throw new AppError('Réservation non trouvée', 404);
  if (etablissementId && reservation.etablissementId !== etablissementId) {
    throw new AppError('Cette réservation n\'appartient pas à votre établissement', 403);
  }

  const facture = await prisma.facture.findUnique({ where: { reservationId }, include: INCLUDE_PAIEMENTS });
  if (!facture) throw new AppError('Facture non trouvée', 404);
  return facture;
}

export async function enregistrerPaiement(
  factureId: string,
  etablissementId: string | null | undefined,
  data: { montant: number; methode: MethodePaiement; employeId?: string }
) {
  const facture = await prisma.facture.findUnique({
    where: { id: factureId },
    include: { reservation: { select: { etablissementId: true } }, paiements: true },
  });
  if (!facture) throw new AppError('Facture non trouvée', 404);
  if (etablissementId && facture.reservation.etablissementId !== etablissementId) {
    throw new AppError('Cette facture n\'appartient pas à votre établissement', 403);
  }

  const totalPayeAvant = facture.paiements.reduce((s, p) => s + Number(p.montant), 0);
  const solde = Math.max(0, Number(facture.montantTotal) - totalPayeAvant);
  if (solde <= 0) throw new AppError('Cette facture est déjà entièrement payée', 409);
  if (data.montant > solde) {
    throw new AppError(`Le montant dépasse le solde restant (${solde.toFixed(2)} ${facture.devise})`, 400);
  }

  return prisma.$transaction(async (tx) => {
    await tx.paiement.create({
      data: { factureId, montant: data.montant, methode: data.methode, employeId: data.employeId },
    });

    await recalculerStatutPaiement(tx, factureId);

    return tx.facture.findUnique({ where: { id: factureId }, include: INCLUDE_PAIEMENTS });
  });
}
