import { Response } from 'express';
import { EmplacementAffichage } from '@prisma/client';
import * as service from './partenaires.service';
import { sendSuccess } from '../../utils/response';
import { AuthRequest } from '../../types';

export async function listPublique(req: AuthRequest, res: Response) {
  const emplacement = req.query.emplacement as EmplacementAffichage | undefined;
  const partenaires = await service.listPublique(emplacement);
  sendSuccess(res, { partenaires });
}

export async function listAdmin(_req: AuthRequest, res: Response) {
  const partenaires = await service.listAdmin();
  sendSuccess(res, { partenaires });
}

export async function create(req: AuthRequest, res: Response) {
  const partenaire = await service.create(req.body);
  sendSuccess(res, { partenaire }, 'Partenaire créé', 201);
}

export async function update(req: AuthRequest, res: Response) {
  const partenaire = await service.update(req.params.id, req.body);
  sendSuccess(res, { partenaire }, 'Partenaire mis à jour');
}

export async function remove(req: AuthRequest, res: Response) {
  await service.remove(req.params.id);
  sendSuccess(res, null, 'Partenaire supprimé');
}
