import { Response } from 'express';
import { CategorieEvenement } from '@prisma/client';
import * as service from './agenda.service';
import { sendSuccess } from '../../utils/response';
import { AuthRequest } from '../../types';

export async function listPublique(req: AuthRequest, res: Response) {
  const categorie = req.query.categorie as CategorieEvenement | undefined;
  const q = req.query.q as string | undefined;
  const evenements = await service.listPublique(categorie, q);
  sendSuccess(res, { evenements });
}

export async function listAdmin(_req: AuthRequest, res: Response) {
  const evenements = await service.listAdmin();
  sendSuccess(res, { evenements });
}

export async function create(req: AuthRequest, res: Response) {
  const evenement = await service.create(req.body);
  sendSuccess(res, { evenement }, 'Événement créé', 201);
}

export async function update(req: AuthRequest, res: Response) {
  const evenement = await service.update(req.params.id, req.body);
  sendSuccess(res, { evenement }, 'Événement mis à jour');
}

export async function remove(req: AuthRequest, res: Response) {
  await service.remove(req.params.id);
  sendSuccess(res, null, 'Événement supprimé');
}
