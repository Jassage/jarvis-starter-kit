import { Response } from 'express';
import * as service from './temoignages.service';
import { sendSuccess } from '../../utils/response';
import { AuthRequest } from '../../types';

export async function listPublique(_req: AuthRequest, res: Response) {
  const temoignages = await service.listPublique();
  sendSuccess(res, { temoignages });
}

export async function listAdmin(_req: AuthRequest, res: Response) {
  const temoignages = await service.listAdmin();
  sendSuccess(res, { temoignages });
}

export async function create(req: AuthRequest, res: Response) {
  const temoignage = await service.create(req.body);
  sendSuccess(res, { temoignage }, 'Témoignage créé', 201);
}

export async function update(req: AuthRequest, res: Response) {
  const temoignage = await service.update(req.params.id, req.body);
  sendSuccess(res, { temoignage }, 'Témoignage mis à jour');
}

export async function remove(req: AuthRequest, res: Response) {
  await service.remove(req.params.id);
  sendSuccess(res, null, 'Témoignage supprimé');
}
