import { Response } from 'express';
import * as service from './site-settings.service';
import { sendSuccess } from '../../utils/response';
import { AuthRequest } from '../../types';

export async function get(_req: AuthRequest, res: Response) {
  const parametres = await service.get();
  sendSuccess(res, { parametres });
}

export async function update(req: AuthRequest, res: Response) {
  const parametres = await service.update(req.body);
  sendSuccess(res, { parametres }, 'Paramètres mis à jour');
}
