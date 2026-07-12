import { Request, Response } from 'express';
import * as service from './rapports.service';
import { sendSuccess } from '../../utils/response';
import { AppError } from '../../middlewares/errorHandler.middleware';

function resoudrePeriode(req: Request) {
  const { from, to } = req.query as Record<string, string | undefined>;
  const dTo = to ? new Date(to) : new Date();
  const dFrom = from ? new Date(from) : new Date(dTo.getTime() - 30 * 86400000);
  return { from: dFrom, to: dTo };
}

export async function getRapportEtablissement(req: Request, res: Response) {
  if (!req.etablissementId) throw new AppError('etablissementId requis', 400);
  const { from, to } = resoudrePeriode(req);
  const rapport = await service.getRapportEtablissement(req.etablissementId, from, to);
  sendSuccess(res, { rapport, periode: { from, to } });
}

export async function getRapportChaine(req: Request, res: Response) {
  const { from, to } = resoudrePeriode(req);
  const rapport = await service.getRapportChaine(from, to);
  sendSuccess(res, { rapport, periode: { from, to } });
}
