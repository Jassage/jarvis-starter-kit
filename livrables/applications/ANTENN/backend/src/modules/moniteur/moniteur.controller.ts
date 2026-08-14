import { Request, Response } from 'express';
import * as service from './moniteur.service';
import { sendSuccess } from '../../utils/response';

export async function get(_req: Request, res: Response) {
  const moniteur = await service.getMoniteur();
  sendSuccess(res, moniteur);
}
