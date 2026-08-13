import { Response } from 'express';
import * as service from './activity-log.service';
import { sendSuccess } from '../../utils/response';
import { AuthRequest } from '../../types';

export async function list(req: AuthRequest, res: Response) {
  const entite = req.query.entite as string | undefined;
  const page = Number(req.query.page);
  const limit = Number(req.query.limit);
  const resultat = await service.list({ entite, page, limit });
  sendSuccess(res, resultat);
}

export async function listEntites(_req: AuthRequest, res: Response) {
  const entites = await service.listEntites();
  sendSuccess(res, { entites });
}
