import { Request, Response } from 'express';
import * as service from './creneaux.service';
import { sendSuccess } from '../../utils/response';
import { AppError } from '../../middlewares/errorHandler.middleware';

export async function list(req: Request, res: Response) {
  const { from, to } = req.query as { from?: string; to?: string };
  const creneaux = await service.listCreneaux(from, to);
  sendSuccess(res, { creneaux, brouillons: await service.compterBrouillons() });
}

export async function getOne(req: Request, res: Response) {
  const creneau = await service.getCreneau(req.params.id);
  sendSuccess(res, { creneau });
}

export async function create(req: Request, res: Response) {
  const creneau = await service.createCreneau(req.body);
  sendSuccess(res, { creneau }, 'Créneau créé', 201);
}

export async function update(req: Request, res: Response) {
  const creneau = await service.updateCreneau(req.params.id, req.body);
  sendSuccess(res, { creneau }, 'Créneau mis à jour');
}

export async function remove(req: Request, res: Response) {
  await service.deleteCreneau(req.params.id);
  sendSuccess(res, null, 'Créneau supprimé');
}

export async function dupliquer(req: Request, res: Response) {
  const nouveauDebut = req.body?.dateHeureDebut;
  if (!nouveauDebut) throw new AppError('dateHeureDebut requis pour la duplication', 400);
  const creneau = await service.dupliquerCreneau(req.params.id, nouveauDebut);
  sendSuccess(res, { creneau }, 'Créneau dupliqué', 201);
}

export async function synchroniser(req: Request, res: Response) {
  const creneau = await service.marquerSynchronise(req.params.id);
  sendSuccess(res, { creneau }, 'Créneau marqué comme synchronisé');
}
