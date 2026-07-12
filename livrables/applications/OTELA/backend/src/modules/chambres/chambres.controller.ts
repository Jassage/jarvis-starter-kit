import { Request, Response } from 'express';
import * as service from './chambres.service';
import { sendSuccess } from '../../utils/response';
import { AppError } from '../../middlewares/errorHandler.middleware';

export async function listTypes(req: Request, res: Response) {
  const etablissementId = (req.query.etablissementId as string) || req.etablissementId;
  if (!etablissementId) throw new AppError('etablissementId requis', 400);
  const types = await service.listTypesChambres(etablissementId);
  sendSuccess(res, { types });
}

export async function createType(req: Request, res: Response) {
  const type = await service.createTypeChambre(req.etablissementId, req.body);
  sendSuccess(res, { type }, 'Type de chambre créé', 201);
}

export async function updateType(req: Request, res: Response) {
  const type = await service.updateTypeChambre(req.params.id, req.etablissementId, req.body);
  sendSuccess(res, { type }, 'Type de chambre mis à jour');
}

export async function createTarif(req: Request, res: Response) {
  const tarif = await service.createTarif(req.params.typeChambreId, req.etablissementId, req.body);
  sendSuccess(res, { tarif }, 'Tarif créé', 201);
}

export async function updateTarif(req: Request, res: Response) {
  const tarif = await service.updateTarif(req.params.id, req.etablissementId, req.body);
  sendSuccess(res, { tarif }, 'Tarif mis à jour');
}

export async function listChambres(req: Request, res: Response) {
  if (!req.etablissementId) throw new AppError('etablissementId requis', 400);
  const chambres = await service.listChambres(req.etablissementId);
  sendSuccess(res, { chambres });
}

export async function createChambre(req: Request, res: Response) {
  const chambre = await service.createChambre(req.etablissementId, req.body);
  sendSuccess(res, { chambre }, 'Chambre créée', 201);
}

export async function updateChambre(req: Request, res: Response) {
  const chambre = await service.updateChambre(req.params.id, req.etablissementId, req.body);
  sendSuccess(res, { chambre }, 'Chambre mise à jour');
}
