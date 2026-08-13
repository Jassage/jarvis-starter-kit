import { Response } from 'express';
import * as service from './services-municipaux.service';
import { sendSuccess } from '../../utils/response';
import { AuthRequest } from '../../types';

export async function listPublique(_req: AuthRequest, res: Response) {
  const services = await service.listPublique();
  sendSuccess(res, { services });
}

export async function listAdmin(_req: AuthRequest, res: Response) {
  const services = await service.listAdmin();
  sendSuccess(res, { services });
}

export async function create(req: AuthRequest, res: Response) {
  const service_ = await service.create(req.body);
  sendSuccess(res, { service: service_ }, 'Service créé', 201);
}

export async function update(req: AuthRequest, res: Response) {
  const service_ = await service.update(req.params.id, req.body);
  sendSuccess(res, { service: service_ }, 'Service mis à jour');
}

export async function remove(req: AuthRequest, res: Response) {
  await service.remove(req.params.id);
  sendSuccess(res, null, 'Service supprimé');
}
