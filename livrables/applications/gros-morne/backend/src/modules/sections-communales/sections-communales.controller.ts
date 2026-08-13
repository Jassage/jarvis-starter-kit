import { Response } from 'express';
import * as service from './sections-communales.service';
import { sendSuccess } from '../../utils/response';
import { AuthRequest } from '../../types';

export async function list(_req: AuthRequest, res: Response) {
  const sections = await service.list();
  sendSuccess(res, { sections });
}

export async function create(req: AuthRequest, res: Response) {
  const section = await service.create(req.body);
  sendSuccess(res, { section }, 'Section communale créée', 201);
}

export async function update(req: AuthRequest, res: Response) {
  const section = await service.update(req.params.id, req.body);
  sendSuccess(res, { section }, 'Section communale mise à jour');
}

export async function remove(req: AuthRequest, res: Response) {
  await service.remove(req.params.id);
  sendSuccess(res, null, 'Section communale supprimée');
}
