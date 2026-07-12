import { Request, Response } from 'express';
import * as service from './reception.service';
import { sendSuccess } from '../../utils/response';
import { AppError } from '../../middlewares/errorHandler.middleware';

export async function vueDuJour(req: Request, res: Response) {
  if (!req.etablissementId) throw new AppError('etablissementId requis', 400);
  const vue = await service.vueDuJour(req.etablissementId);
  sendSuccess(res, vue);
}

export async function checkin(req: Request, res: Response) {
  const reservation = await service.checkin(req.params.reservationId, req.etablissementId);
  sendSuccess(res, { reservation }, 'Check-in enregistré');
}

export async function checkout(req: Request, res: Response) {
  const reservation = await service.checkout(req.params.reservationId, req.etablissementId);
  sendSuccess(res, { reservation }, 'Check-out enregistré');
}
