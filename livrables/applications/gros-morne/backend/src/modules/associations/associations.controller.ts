import { Response } from 'express';
import * as service from './associations.service';
import { sendSuccess } from '../../utils/response';
import { AuthRequest } from '../../types';

export async function listPublique(_req: AuthRequest, res: Response) {
  const associations = await service.listPublique();
  sendSuccess(res, { associations });
}

export async function listAdmin(_req: AuthRequest, res: Response) {
  const associations = await service.listAdmin();
  sendSuccess(res, { associations });
}

export async function create(req: AuthRequest, res: Response) {
  const association = await service.create(req.body);
  sendSuccess(res, { association }, 'Association créée', 201);
}

export async function update(req: AuthRequest, res: Response) {
  const association = await service.update(req.params.id, req.body);
  sendSuccess(res, { association }, 'Association mise à jour');
}

export async function remove(req: AuthRequest, res: Response) {
  await service.remove(req.params.id);
  sendSuccess(res, null, 'Association supprimée');
}
