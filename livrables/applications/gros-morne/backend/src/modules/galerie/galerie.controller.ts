import { Response } from 'express';
import { CategorieGalerie } from '@prisma/client';
import * as service from './galerie.service';
import { sendSuccess } from '../../utils/response';
import { AuthRequest } from '../../types';

export async function listPublique(req: AuthRequest, res: Response) {
  const categorie = req.query.categorie as CategorieGalerie | undefined;
  const albums = await service.listPublique(categorie);
  sendSuccess(res, { albums });
}

export async function listAdmin(_req: AuthRequest, res: Response) {
  const albums = await service.listAdmin();
  sendSuccess(res, { albums });
}

export async function create(req: AuthRequest, res: Response) {
  const album = await service.create(req.body);
  sendSuccess(res, { album }, 'Album créé', 201);
}

export async function update(req: AuthRequest, res: Response) {
  const album = await service.update(req.params.id, req.body);
  sendSuccess(res, { album }, 'Album mis à jour');
}

export async function remove(req: AuthRequest, res: Response) {
  await service.remove(req.params.id);
  sendSuccess(res, null, 'Album supprimé');
}
