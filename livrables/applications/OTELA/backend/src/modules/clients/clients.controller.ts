import { Request, Response } from 'express';
import * as service from './clients.service';
import { sendSuccess } from '../../utils/response';

export async function getOne(req: Request, res: Response) {
  const client = await service.getClientAvecHistorique(req.params.id);
  sendSuccess(res, { client });
}
