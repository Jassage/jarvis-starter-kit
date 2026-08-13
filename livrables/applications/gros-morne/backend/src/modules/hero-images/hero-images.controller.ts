import { Response } from 'express';
import * as service from './hero-images.service';
import { sendSuccess } from '../../utils/response';
import { AuthRequest } from '../../types';

export async function getOne(req: AuthRequest, res: Response) {
  const image = await service.getOne(req.params.page);
  sendSuccess(res, { image });
}

export async function listAdmin(_req: AuthRequest, res: Response) {
  const images = await service.listAdmin();
  sendSuccess(res, { images });
}

export async function upsert(req: AuthRequest, res: Response) {
  const image = await service.upsert(req.params.page, req.body.mediaId);
  sendSuccess(res, { image }, 'Image de fond mise à jour');
}

export async function remove(req: AuthRequest, res: Response) {
  await service.remove(req.params.page);
  sendSuccess(res, null, 'Image de fond supprimée');
}
