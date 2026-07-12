import { Request, Response } from 'express';
import * as service from './reservations.service';
import { sendSuccess } from '../../utils/response';

export async function create(req: Request, res: Response) {
  const reservation = await service.creerReservation({
    ...req.body,
    dateArrivee: new Date(req.body.dateArrivee),
    dateDepart: new Date(req.body.dateDepart),
  });
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

export async function annuler(req: Request, res: Response) {
  const reservation = await service.annulerReservation(req.params.id, req.etablissementId);
  sendSuccess(res, { reservation }, 'Réservation annulée');
}
