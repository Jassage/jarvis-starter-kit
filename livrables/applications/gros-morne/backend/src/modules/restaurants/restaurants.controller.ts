import { Response } from 'express';
import * as service from './restaurants.service';
import { sendSuccess } from '../../utils/response';
import { AuthRequest } from '../../types';

export async function listPublique(_req: AuthRequest, res: Response) {
  const restaurants = await service.listPublique();
  sendSuccess(res, { restaurants });
}

export async function listAdmin(_req: AuthRequest, res: Response) {
  const restaurants = await service.listAdmin();
  sendSuccess(res, { restaurants });
}

export async function create(req: AuthRequest, res: Response) {
  const restaurant = await service.create(req.body);
  sendSuccess(res, { restaurant }, 'Restaurant créé', 201);
}

export async function update(req: AuthRequest, res: Response) {
  const restaurant = await service.update(req.params.id, req.body);
  sendSuccess(res, { restaurant }, 'Restaurant mis à jour');
}

export async function remove(req: AuthRequest, res: Response) {
  await service.remove(req.params.id);
  sendSuccess(res, null, 'Restaurant supprimé');
}
