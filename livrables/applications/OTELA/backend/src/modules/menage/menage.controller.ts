import { Request, Response } from 'express';
import * as service from './menage.service';
import { sendSuccess } from '../../utils/response';
import { AppError } from '../../middlewares/errorHandler.middleware';

export async function listTaches(req: Request, res: Response) {
  if (!req.etablissementId) throw new AppError('etablissementId requis', 400);
  const statut = req.query.statut as never;
  const taches = await service.listTaches(req.etablissementId, statut);
  sendSuccess(res, { taches });
}

export async function listEmployesMenage(req: Request, res: Response) {
  if (!req.etablissementId) throw new AppError('etablissementId requis', 400);
  const employes = await service.listEmployesMenage(req.etablissementId);
  sendSuccess(res, { employes });
}

export async function updateTache(req: Request, res: Response) {
  const tache = await service.updateTache(req.params.id, req.etablissementId, req.body);
  sendSuccess(res, { tache }, 'Tâche mise à jour');
}
