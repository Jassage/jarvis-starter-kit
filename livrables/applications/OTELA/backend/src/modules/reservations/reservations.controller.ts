import { Request, Response } from 'express';
import * as service from './reservations.service';
import { sendSuccess } from '../../utils/response';
import { journaliser } from '../audit/audit.service';
import { qrDataUrl } from '../../utils/qr';

export async function create(req: Request, res: Response) {
  const reservation = await service.creerReservation({
    ...req.body,
    dateArrivee: new Date(req.body.dateArrivee),
    dateDepart: new Date(req.body.dateDepart),
  });

  // Cette route sert aussi le site public : req.employe est alors absent et la trace
  // reste anonyme, ce qui distingue justement une réservation en ligne d'une saisie
  // au comptoir.
  await journaliser(
    {
      action: 'RESERVATION_CREEE',
      entite: 'Reservation',
      entiteId: reservation.id,
      etablissementId: reservation.etablissementId,
      details: { canal: reservation.canal, montantTotal: String(reservation.montantTotal) },
    },
    req
  );

  sendSuccess(res, { reservation }, 'Réservation confirmée', 201);
}

export async function list(req: Request, res: Response) {
  const { statut, search, from, to } = req.query as Record<string, string | undefined>;
  const reservations = await service.listReservations({
    etablissementId: req.etablissementId,
    statut,
    search,
    from: from ? new Date(from) : undefined,
    to: to ? new Date(to) : undefined,
  });
  sendSuccess(res, { reservations });
}

export async function getOne(req: Request, res: Response) {
  const reservation = await service.getReservation(req.params.id, req.etablissementId);
  sendSuccess(res, { reservation });
}

// Consultation publique par référence + email — aucune authentification. Le QR
// (data URL) est renvoyé avec la réservation pour que la page client l'affiche sans
// dépendance de génération côté navigateur.
export async function consultationPublique(req: Request, res: Response) {
  const reservation = await service.getReservationPublique(req.params.reference, String(req.query.email ?? ''));
  const qr = reservation.reference ? await qrDataUrl(reservation.reference).catch(() => null) : null;
  sendSuccess(res, { reservation, qr });
}

export async function annuler(req: Request, res: Response) {
  const reservation = await service.annulerReservation(req.params.id, req.etablissementId);

  await journaliser(
    {
      action: 'RESERVATION_ANNULEE',
      entite: 'Reservation',
      entiteId: reservation.id,
      etablissementId: reservation.etablissementId,
    },
    req
  );

  sendSuccess(res, { reservation }, 'Réservation annulée');
}
