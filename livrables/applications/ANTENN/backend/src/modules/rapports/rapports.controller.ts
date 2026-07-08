import { Request, Response } from 'express';
import * as service from './rapports.service';
import { sendSuccess } from '../../utils/response';

export async function sponsors(req: Request, res: Response) {
  const { from, to } = req.query as { from?: string; to?: string };
  const rapport = await service.getRapportSponsors(from, to);
  sendSuccess(res, { rapport });
}
