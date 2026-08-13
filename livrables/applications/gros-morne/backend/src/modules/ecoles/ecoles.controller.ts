import { Response } from 'express';
import { TypeEcole } from '@prisma/client';
import * as service from './ecoles.service';
import { sendSuccess } from '../../utils/response';
import { AuthRequest } from '../../types';

export async function listPublique(req: AuthRequest, res: Response) {
  const type = req.query.type as TypeEcole | undefined;
  const ecoles = await service.listPublique(type);
  sendSuccess(res, { ecoles });
}

export async function listAdmin(_req: AuthRequest, res: Response) {
  const ecoles = await service.listAdmin();
  sendSuccess(res, { ecoles });
}

export async function create(req: AuthRequest, res: Response) {
  const ecole = await service.create(req.body);
  sendSuccess(res, { ecole }, 'Établissement créé', 201);
}

export async function update(req: AuthRequest, res: Response) {
  const ecole = await service.update(req.params.id, req.body);
  sendSuccess(res, { ecole }, 'Établissement mis à jour');
}

export async function remove(req: AuthRequest, res: Response) {
  await service.remove(req.params.id);
  sendSuccess(res, null, 'Établissement supprimé');
}
