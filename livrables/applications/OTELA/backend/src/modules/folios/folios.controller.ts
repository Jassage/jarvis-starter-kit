import { Request, Response } from 'express';
import * as service from './folios.service';
import { sendSuccess } from '../../utils/response';
import { AppError } from '../../middlewares/errorHandler.middleware';

export async function getFolio(req: Request, res: Response) {
  const folio = await service.getFolio(req.params.reservationId, req.etablissementId);
  sendSuccess(res, { folio });
}

export async function getFolioParChambre(req: Request, res: Response) {
  if (!req.etablissementId) throw new AppError('etablissementId requis', 400);
  const folio = await service.getFolioOuvertParNumeroChambre(req.params.numero, req.etablissementId);
  sendSuccess(res, { folio });
}
