import prisma from '../../config/database';
import { AppError } from '../../middlewares/errorHandler.middleware';
import { ouvrirFolio, fermerFolio } from '../folios/folios.service';

// Minuit UTC (cf. reservations.service.ts::creerReservation) : Reservation.dateArrivee
// est stockée en minuit UTC pour une date "YYYY-MM-DD" reçue du frontend — comparer à
// un minuit calculé en heure locale (America/Port-au-Prince, UTC-4) décale la fenêtre
// de 4h et fait manquer les arrivées/départs du jour à la réception.
function bornesAujourdhui() {
  const maintenant = new Date();
  const debut = new Date(Date.UTC(maintenant.getUTCFullYear(), maintenant.getUTCMonth(), maintenant.getUTCDate()));
  const fin = new Date(debut.getTime() + 24 * 60 * 60 * 1000);
  return { debut, fin };
}

export async function vueDuJour(etablissementId: string) {
  const { debut, fin } = bornesAujourdhui();

  const [arrivees, departs, chambresParStatutBrut] = await Promise.all([
    prisma.reservation.findMany({
      where: { etablissementId, statut: 'CONFIRMEE', dateArrivee: { gte: debut, lt: fin } },
      include: { client: true, chambre: { include: { typeChambre: true } } },
      orderBy: { dateArrivee: 'asc' },
    }),
    prisma.reservation.findMany({
      where: { etablissementId, statut: 'CONFIRMEE', dateDepart: { gte: debut, lt: fin } },
      include: {
        client: true,
        chambre: { include: { typeChambre: true } },
        // Solde dû affiché à côté du bouton Check-out — lecture seule, ne bloque pas
        // le check-out (pas d'exigence en ce sens dans le document).
        facture: { include: { paiements: { select: { montant: true } } } },
      },
      orderBy: { dateDepart: 'asc' },
    }),
    prisma.chambre.groupBy({ by: ['statut'], where: { etablissementId }, _count: true }),
  ]);

  return {
    arrivees,
    departs,
    chambresParStatut: chambresParStatutBrut.map((c) => ({ statut: c.statut, count: c._count })),
  };
}

// La signature n'est jamais optionnelle : le check-in EST le moment de la signature
// (point #8 du cahier des charges), pas une étape à part qu'on pourrait sauter.
export async function checkin(reservationId: string, etablissementId: string | null | undefined, signatureUrl: string) {
  const reservation = await prisma.reservation.findUnique({ where: { id: reservationId } });
  if (!reservation) throw new AppError('Réservation non trouvée', 404);
  if (etablissementId && reservation.etablissementId !== etablissementId) {
    throw new AppError('Cette réservation n\'appartient pas à votre établissement', 403);
  }
  if (reservation.statut !== 'CONFIRMEE') {
    throw new AppError('Seule une réservation confirmée peut être enregistrée en arrivée', 409);
  }

  return prisma.$transaction(async (tx) => {
    // CAS : n'occupe la chambre que si elle est réellement libre — couvre le cas
    // d'un départ précédent dont le check-out n'a pas encore été enregistré.
    const upd = await tx.chambre.updateMany({
      where: { id: reservation.chambreId, statut: 'DISPONIBLE' },
      data: { statut: 'OCCUPEE' },
    });
    if (upd.count === 0) {
      throw new AppError('La chambre n\'est pas encore disponible (départ précédent pas encore enregistré)', 409);
    }

    await tx.reservation.update({ where: { id: reservationId }, data: { signatureUrl, signatureDate: new Date() } });

    // Ouverture automatique du folio (extension 5 étoiles) — "la facture maîtresse"
    // du séjour, adossée à la Facture existante (cf. folios.service.ts).
    await ouvrirFolio(tx, reservationId, reservation.etablissementId, reservation.devise);

    return tx.reservation.findUnique({
      where: { id: reservationId },
      include: { client: true, chambre: { include: { typeChambre: true } } },
    });
  });
}

export async function checkout(reservationId: string, etablissementId: string | null | undefined) {
  const reservation = await prisma.reservation.findUnique({ where: { id: reservationId } });
  if (!reservation) throw new AppError('Réservation non trouvée', 404);
  if (etablissementId && reservation.etablissementId !== etablissementId) {
    throw new AppError('Cette réservation n\'appartient pas à votre établissement', 403);
  }

  // Le folio (extension 5 étoiles) ne peut être fermé que si son solde est réglé —
  // vérifié AVANT toute écriture, message clair à la réception. La Facture EST la
  // facture maîtresse du folio (cf. folios.service.ts), donc son solde = solde du folio.
  const facture = await prisma.facture.findUnique({ where: { reservationId }, include: { paiements: true } });
  if (facture) {
    const totalPaye = facture.paiements.reduce((s, p) => s + Number(p.montant), 0);
    const solde = Number(facture.montantTotal) - totalPaye;
    if (solde > 0) {
      throw new AppError(`Le folio ne peut pas être clôturé : solde impayé de ${solde.toFixed(2)} ${facture.devise}`, 409);
    }
  }

  return prisma.$transaction(async (tx) => {
    const updResa = await tx.reservation.updateMany({
      where: { id: reservationId, statut: 'CONFIRMEE' },
      data: { statut: 'TERMINEE' },
    });
    if (updResa.count === 0) throw new AppError('Cette réservation a déjà été traitée', 409);

    // La chambre passe systématiquement en nettoyage (jamais directement disponible,
    // exigence explicite du document) — même si le check-in n'avait jamais été
    // enregistré, le séjour est bel et bien terminé physiquement.
    await tx.chambre.update({ where: { id: reservation.chambreId }, data: { statut: 'NETTOYAGE_EN_COURS' } });
    await tx.tacheMenage.create({ data: { chambreId: reservation.chambreId, statut: 'A_FAIRE' } });
    await fermerFolio(tx, reservationId);

    return tx.reservation.findUnique({
      where: { id: reservationId },
      include: { client: true, chambre: { include: { typeChambre: true } } },
    });
  });
}
