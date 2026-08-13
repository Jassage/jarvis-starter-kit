import { Response } from 'express';
import { TypeSante } from '@prisma/client';
import * as service from './sante.service';
import { sendSuccess } from '../../utils/response';
import { AuthRequest } from '../../types';

export async function listPublique(req: AuthRequest, res: Response) {
  const type = req.query.type as TypeSante | undefined;
  const structures = await service.listPublique(type);
  sendSuccess(res, { structures });
}

export async function listAdmin(_req: AuthRequest, res: Response) {
  const structures = await service.listAdmin();
  sendSuccess(res, { structures });
}

export async function create(req: AuthRequest, res: Response) {
  const structure = await service.create(req.body);
  sendSuccess(res, { structure }, 'Structure créée', 201);
}

export async function update(req: AuthRequest, res: Response) {
  const structure = await service.update(req.params.id, req.body);
  sendSuccess(res, { structure }, 'Structure mise à jour');
}

export async function remove(req: AuthRequest, res: Response) {
  await service.remove(req.params.id);
  sendSuccess(res, null, 'Structure supprimée');
}
