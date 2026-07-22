import { CanalReservation, Devise, TypeSejour } from '@prisma/client';
import prisma from '../../config/database';
import { AppError } from '../../middlewares/errorHandler.middleware';
import { differenceEnNuits, estMemeJourCalendaireUTC, assertModifiable, isExclusionViolation } from './reservations.utils';
import { findOrCreateClient } from '../clients/clients.service';
import { sendMail } from '../../utils/email';
import { genererReference } from '../../utils/reference';
import { qrDataUrl, urlConsultation } from '../../utils/qr';
import logger from '../../utils/logger';

export interface CreerReservationInput {
  etablissementId: string;
  chambreId?: string;
  typeChambreId?: string;
  dateArrivee: Date;
  dateDepart: Date;
  nombrePersonnes: number;
  nombreAdultes?: number;
  nombreEnfants?: number;
  devise: Devise;
  typeSejour?: TypeSejour;
  client: { nom: string; telephone: string; email: string };
  canal?: CanalReservation;
}

async function trouverChambreDisponible(etablissementId: string, typeChambreId: string, dateArrivee: Date, dateDepart: Date) {
  return prisma.chambre.findFirst({
    where: {
      etablissementId,
      typeChambreId,
      // Cf. disponibilite.service.ts : OCCUPEE ne bloque pas le futur, seul le
      // chevauchement de réservation (ci-dessous) compte pour cette date.
      statut: { notIn: ['MAINTENANCE', 'NETTOYAGE_EN_COURS'] },
      reservations: {
        none: {
          statut: { in: ['CONFIRMEE', 'EN_ATTENTE'] },
          dateArrivee: { lt: dateDepart },
          dateDepart: { gt: dateArrivee },
        },
      },
    },
  });
}

async function trouverTarifApplicable(typeChambreId: string, devise: Devise, dateArrivee: Date, typeSejour: TypeSejour) {
  return prisma.tarif.findFirst({
    where: {
      typeChambreId,
      devise,
      typeSejour,
      dateDebutSaison: { lte: dateArrivee },
      dateFinSaison: { gte: dateArrivee },
    },
    orderBy: { dateDebutSaison: 'desc' },
  });
}

async function envoyerConfirmation(reservation: {
  reference: string | null;
  client: { nom: string; email: string };
  etablissement: { nom: string };
  dateArrivee: Date;
  dateDepart: Date;
  devise: Devise;
  montantTotal: unknown;
}) {
  const arr = reservation.dateArrivee.toLocaleDateString('fr-FR');
  const dep = reservation.dateDepart.toLocaleDateString('fr-FR');
  const ref = reservation.reference ?? '';
  // QR + lien de consultation : le client retrouve et présente sa réservation sans
  // compte. Le data URL s'affiche nativement dans l'email HTML.
  const lien = urlConsultation(ref);
  let qrImg = '';
  try {
    qrImg = `<img src="${await qrDataUrl(ref)}" alt="QR de réservation" width="180" height="180" />`;
  } catch (err) {
    logger.error(err, 'Échec génération QR pour email de confirmation');
  }

  await sendMail(
    reservation.client.email,
    `Confirmation de réservation ${ref} — ${reservation.etablissement.nom}`,
    `<p>Bonjour ${reservation.client.nom},</p>
     <p>Votre réservation à <strong>${reservation.etablissement.nom}</strong> est confirmée.</p>
     <p>Votre référence : <strong style="font-size:18px">${ref}</strong></p>
     <p>Arrivée : ${arr}<br/>Départ : ${dep}<br/>Total : ${reservation.montantTotal} ${reservation.devise}</p>
     <p>Présentez ce QR code à votre arrivée, ou consultez votre réservation en ligne :</p>
     ${qrImg}
     <p><a href="${lien}">${lien}</a></p>`
  );
}

// Tire une référence non encore utilisée. La contrainte unique en base reste le
// garde-fou réel sous concurrence ; ce pré-check évite juste l'échec dans le cas
// (extrêmement rare) d'une collision.
async function genererReferenceUnique(): Promise<string> {
  for (let essai = 0; essai < 5; essai++) {
    const ref = genererReference();
    const existe = await prisma.reservation.findUnique({ where: { reference: ref }, select: { id: true } });
    if (!existe) return ref;
  }
  throw new AppError('Impossible de générer une référence de réservation, réessayez', 500);
}

// Service unique utilisé par le site public ET la création manuelle back-office —
// jamais deux chemins de code différents pour créer une réservation. Deux niveaux
// de garde anti-double-booking : le pré-check applicatif ci-dessous (rapide, bonne
// UX) et la contrainte d'exclusion PostgreSQL (migration exclude_overlap_reservation,
// seule garantie réelle sous concurrence — capturée via isExclusionViolation).
export async function creerReservation(input: CreerReservationInput) {
  if (input.dateArrivee >= input.dateDepart) {
    throw new AppError('La date de départ doit être après la date d\'arrivée', 400);
  }
  // Minuit UTC, pas minuit local : les dates "YYYY-MM-DD" reçues du frontend sont
  // parsées par JS en minuit UTC (new Date('2026-07-09') → 00:00Z). Comparer à un
  // minuit calculé en heure locale (America/Port-au-Prince, UTC-4) décale la borne
  // de 4h et rejette à tort une réservation pour aujourd'hui même.
  const maintenant = new Date();
  const debutAujourdhui = new Date(Date.UTC(maintenant.getUTCFullYear(), maintenant.getUTCMonth(), maintenant.getUTCDate()));
  if (input.dateArrivee < debutAujourdhui) {
    throw new AppError('La date d\'arrivée ne peut pas être dans le passé', 400);
  }

  const typeSejour = input.typeSejour ?? 'NUITEE';
  if (typeSejour === 'JOUR' && !estMemeJourCalendaireUTC(input.dateArrivee, input.dateDepart)) {
    throw new AppError('Un séjour day-use doit commencer et se terminer le même jour', 400);
  }

  // Ventilation adultes/enfants. Validée ici, dans le service, et non seulement en
  // Zod : ce service est appelé à l'identique par le site public et le back-office,
  // la règle doit tenir quel que soit le point d'entrée. Défaut « tout en adultes »
  // quand seule la somme est fournie (compatibilité avec l'ancien formulaire).
  const nombreAdultes = input.nombreAdultes ?? input.nombrePersonnes;
  const nombreEnfants = input.nombreEnfants ?? 0;
  if (nombreAdultes < 1) {
    throw new AppError('Au moins un adulte est requis', 400);
  }
  if (nombreAdultes + nombreEnfants !== input.nombrePersonnes) {
    throw new AppError('Le nombre d\'adultes et d\'enfants doit correspondre au nombre de personnes', 400);
  }

  const etablissement = await prisma.etablissement.findUnique({ where: { id: input.etablissementId } });
  if (!etablissement || !etablissement.actif) throw new AppError('Établissement non disponible', 404);
  if (!etablissement.devisesAcceptees.includes(input.devise)) {
    throw new AppError(`Cet établissement n'accepte pas les réservations en ${input.devise}`, 400);
  }

  let chambreId = input.chambreId;
  let typeChambreId = input.typeChambreId;

  if (chambreId) {
    const chambre = await prisma.chambre.findUnique({ where: { id: chambreId } });
    if (!chambre || chambre.etablissementId !== etablissement.id) throw new AppError('Chambre introuvable', 404);
    if (chambre.statut === 'MAINTENANCE' || chambre.statut === 'NETTOYAGE_EN_COURS') {
      throw new AppError('Cette chambre est actuellement indisponible', 409);
    }
    typeChambreId = chambre.typeChambreId;
  } else {
    if (!typeChambreId) throw new AppError('chambreId ou typeChambreId requis', 400);
    const candidate = await trouverChambreDisponible(etablissement.id, typeChambreId, input.dateArrivee, input.dateDepart);
    if (!candidate) throw new AppError('Aucune chambre disponible pour ce type sur ces dates', 409);
    chambreId = candidate.id;
  }

  const tarif = await trouverTarifApplicable(typeChambreId!, input.devise, input.dateArrivee, typeSejour);
  if (!tarif) throw new AppError('Aucun tarif défini pour ce type de chambre à ces dates dans cette devise', 409);

  // JOUR : montant forfaitaire tel quel, jamais multiplié par une durée.
  const nuits = differenceEnNuits(input.dateArrivee, input.dateDepart);
  const montantTotal = typeSejour === 'JOUR' ? Number(tarif.montant) : Number(tarif.montant) * nuits;

  const client = await findOrCreateClient(input.client);

  const reference = await genererReferenceUnique();

  let reservation;
  try {
    reservation = await prisma.$transaction(async (tx) => {
      const resa = await tx.reservation.create({
        data: {
          etablissementId: etablissement.id,
          chambreId,
          clientId: client.id,
          reference,
          dateArrivee: input.dateArrivee,
          dateDepart: input.dateDepart,
          nombrePersonnes: input.nombrePersonnes,
          nombreAdultes,
          nombreEnfants,
          devise: input.devise,
          typeSejour,
          montantTotal,
          canal: input.canal ?? 'SITE_DIRECT',
        },
        include: { chambre: { include: { typeChambre: true } }, etablissement: true, client: true },
      });

      // Facture générée automatiquement à la réservation — jamais un pas séparé.
      // Snapshot du taux de taxe de l'établissement au moment de la facturation.
      const taxes = montantTotal * (Number(etablissement.tauxTaxe) / 100);
      await tx.facture.create({
        data: {
          reservationId: resa.id,
          montantHT: montantTotal,
          taxes,
          montantTotal: montantTotal + taxes,
          devise: input.devise,
        },
      });

      return resa;
    });
  } catch (err) {
    if (isExclusionViolation(err)) {
      throw new AppError('Chambre non disponible sur ces dates', 409);
    }
    throw err;
  }

  envoyerConfirmation(reservation).catch((err) => logger.error(err, 'Échec envoi confirmation réservation'));

  return reservation;
}

export async function listReservations(filters: { etablissementId?: string | null; statut?: string; search?: string; from?: Date; to?: Date }) {
  return prisma.reservation.findMany({
    where: {
      ...(filters.etablissementId ? { etablissementId: filters.etablissementId } : {}),
      ...(filters.statut ? { statut: filters.statut as never } : {}),
      ...(filters.from || filters.to ? { dateArrivee: { ...(filters.from ? { gte: filters.from } : {}), ...(filters.to ? { lte: filters.to } : {}) } } : {}),
      ...(filters.search ? {
        OR: [
          { client: { nom: { contains: filters.search, mode: 'insensitive' } } },
          { client: { email: { contains: filters.search, mode: 'insensitive' } } },
          { chambre: { numero: { contains: filters.search, mode: 'insensitive' } } },
        ],
      } : {}),
    },
    include: { client: true, chambre: { include: { typeChambre: true } }, etablissement: true },
    orderBy: { dateArrivee: 'desc' },
    take: 200,
  });
}

export async function getReservation(id: string, etablissementId?: string | null) {
  const reservation = await prisma.reservation.findUnique({
    where: { id },
    include: { client: true, chambre: { include: { typeChambre: true } }, etablissement: true },
  });
  if (!reservation) throw new AppError('Réservation non trouvée', 404);
  if (etablissementId && reservation.etablissementId !== etablissementId) {
    throw new AppError('Cette réservation n\'appartient pas à votre établissement', 403);
  }
  return reservation;
}

// Consultation publique par référence, sans compte. La référence seule ne suffit
// pas : l'email du client doit correspondre (comparaison insensible à la casse),
// pour qu'une référence devinée ou interceptée ne dévoile pas les données d'un
// client. Renvoie un message identique que la référence n'existe pas ou que l'email
// ne corresponde pas — ne pas révéler l'existence d'une référence.
export async function getReservationPublique(reference: string, email: string) {
  const reservation = await prisma.reservation.findUnique({
    where: { reference },
    include: {
      client: true,
      chambre: { include: { typeChambre: true } },
      etablissement: { select: { nom: true, adresse: true, commune: true, telephone: true, email: true, heureCheckIn: true, heureCheckOut: true, politiqueAnnulation: true } },
      facture: { select: { montantHT: true, taxes: true, montantTotal: true, devise: true, statutPaiement: true } },
    },
  });

  if (!reservation || reservation.client.email.toLowerCase() !== email.trim().toLowerCase()) {
    throw new AppError('Aucune réservation ne correspond à cette référence et cet email', 404);
  }
  return reservation;
}

export async function annulerReservation(id: string, etablissementId?: string | null) {
  const reservation = await getReservation(id, etablissementId);
  assertModifiable(reservation.dateDepart);
  if (reservation.statut === 'ANNULEE') throw new AppError('Réservation déjà annulée', 409);

  const upd = await prisma.reservation.updateMany({
    where: { id, statut: { in: ['CONFIRMEE', 'EN_ATTENTE'] } },
    data: { statut: 'ANNULEE' },
  });
  if (upd.count === 0) throw new AppError('Cette réservation a déjà été traitée entre-temps', 409);

  return getReservation(id);
}
