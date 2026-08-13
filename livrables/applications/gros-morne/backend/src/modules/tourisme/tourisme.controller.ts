import { Response } from 'express';
import { CategorieTourisme } from '@prisma/client';
import * as service from './tourisme.service';
import { sendSuccess } from '../../utils/response';
import { AuthRequest } from '../../types';

export async function listPublique(req: AuthRequest, res: Response) {
  const categorie = req.query.categorie as CategorieTourisme | undefined;
  const q = req.query.q as string | undefined;
  const lieux = await service.listPublique(categorie, q);
  sendSuccess(res, { lieux });
}

export async function listAdmin(_req: AuthRequest, res: Response) {
  const lieux = await service.listAdmin();
  sendSuccess(res, { lieux });
}

export async function create(req: AuthRequest, res: Response) {
  const lieu = await service.create(req.body);
  sendSuccess(res, { lieu }, 'Lieu touristique créé', 201);
}

export async function update(req: AuthRequest, res: Response) {
  const lieu = await service.update(req.params.id, req.body);
  sendSuccess(res, { lieu }, 'Lieu touristique mis à jour');
}

export async function remove(req: AuthRequest, res: Response) {
  await service.remove(req.params.id);
  sendSuccess(res, null, 'Lieu touristique supprimé');
}
