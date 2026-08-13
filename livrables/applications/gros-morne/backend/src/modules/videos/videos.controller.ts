import { Response } from 'express';
import { CategorieGalerie } from '@prisma/client';
import * as service from './videos.service';
import { sendSuccess } from '../../utils/response';
import { AuthRequest } from '../../types';

export async function listPublique(req: AuthRequest, res: Response) {
  const categorie = req.query.categorie as CategorieGalerie | undefined;
  const videos = await service.listPublique(categorie);
  sendSuccess(res, { videos });
}

export async function listAdmin(_req: AuthRequest, res: Response) {
  const videos = await service.listAdmin();
  sendSuccess(res, { videos });
}

export async function create(req: AuthRequest, res: Response) {
  const video = await service.create(req.body);
  sendSuccess(res, { video }, 'Vidéo créée', 201);
}

export async function update(req: AuthRequest, res: Response) {
  const video = await service.update(req.params.id, req.body);
  sendSuccess(res, { video }, 'Vidéo mise à jour');
}

export async function remove(req: AuthRequest, res: Response) {
  await service.remove(req.params.id);
  sendSuccess(res, null, 'Vidéo supprimée');
}
