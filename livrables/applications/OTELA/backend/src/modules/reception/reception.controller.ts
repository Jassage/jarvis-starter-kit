import { Request, Response } from 'express';
import * as service from './reception.service';
import { sendSuccess } from '../../utils/response';
import { AppError } from '../../middlewares/errorHandler.middleware';
import { journaliser } from '../audit/audit.service';

export async function vueDuJour(req: Request, res: Response) {
  if (!req.etablissementId) throw new AppError('etablissementId requis', 400);
  const vue = await service.vueDuJour(req.etablissementId);
  sendSuccess(res, vue);
}

export async function checkin(req: Request, res: Response) {
  const reservation = await service.checkin(req.params.reservationId, req.etablissementId);
  if (!reservation) throw new AppError('Réservation introuvable après check-in', 500);

  await journaliser(
    {
      action: 'CHECK_IN',
      entite: 'Reservation',
      entiteId: reservation.id,
      etablissementId: reservation.etablissementId,
      details: { chambreId: reservation.chambreId },
    },
    req
  );

  sendSuccess(res, { reservation }, 'Check-in enregistré');
}

export async function checkout(req: Request, res: Response) {
  const reservation = await service.checkout(req.params.reservationId, req.etablissementId);
  if (!reservation) throw new AppError('Réservation introuvable après check-out', 500);

  await journaliser(
    {
      action: 'CHECK_OUT',
      entite: 'Reservation',
      entiteId: reservation.id,
      etablissementId: reservation.etablissementId,
      details: { chambreId: reservation.chambreId },
    },
    req
  );

  sendSuccess(res, { reservation }, 'Check-out enregistré');
}
