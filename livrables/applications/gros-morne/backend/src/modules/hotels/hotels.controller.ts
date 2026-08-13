import { Response } from 'express';
import * as service from './hotels.service';
import { sendSuccess } from '../../utils/response';
import { AuthRequest } from '../../types';

export async function listPublique(_req: AuthRequest, res: Response) {
  const hotels = await service.listPublique();
  sendSuccess(res, { hotels });
}

export async function listAdmin(_req: AuthRequest, res: Response) {
  const hotels = await service.listAdmin();
  sendSuccess(res, { hotels });
}

export async function create(req: AuthRequest, res: Response) {
  const hotel = await service.create(req.body);
  sendSuccess(res, { hotel }, 'Hôtel créé', 201);
}

export async function update(req: AuthRequest, res: Response) {
  const hotel = await service.update(req.params.id, req.body);
  sendSuccess(res, { hotel }, 'Hôtel mis à jour');
}

export async function remove(req: AuthRequest, res: Response) {
  await service.remove(req.params.id);
  sendSuccess(res, null, 'Hôtel supprimé');
}
