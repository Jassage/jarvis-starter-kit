import { Request, Response } from 'express';
import * as service from './voiturier.service';
import { sendSuccess } from '../../utils/response';
import { AppError } from '../../middlewares/errorHandler.middleware';

function requireEtab(req: Request) {
  if (!req.etablissementId) throw new AppError('etablissementId requis', 400);
  return req.etablissementId;
}

export async function listVehicules(req: Request, res: Response) {
  const vehicules = await service.listVehicules(requireEtab(req));
  sendSuccess(res, { vehicules });
}

export async function enregistrerVehicule(req: Request, res: Response) {
  const vehicule = await service.enregistrerVehicule(requireEtab(req), req.body);
  sendSuccess(res, { vehicule }, 'Véhicule enregistré');
}

export async function marquerDepart(req: Request, res: Response) {
  const vehicule = await service.marquerDepart(req.params.id, requireEtab(req), req.body.montant, req.employe?.id);
  sendSuccess(res, { vehicule }, 'Départ enregistré');
}
