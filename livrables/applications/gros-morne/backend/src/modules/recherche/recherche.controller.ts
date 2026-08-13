import { Response } from 'express';
import * as service from './recherche.service';
import { sendSuccess } from '../../utils/response';
import { AuthRequest } from '../../types';

export async function rechercher(req: AuthRequest, res: Response) {
  const q = req.query.q as string;
  const resultats = await service.rechercher(q);
  sendSuccess(res, resultats);
}
