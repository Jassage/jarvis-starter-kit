import { Response, NextFunction } from 'express';
import { AuthRequest, ok } from '../types';
import * as rapportService from '../services/rapport.service';

function parseDate(v: unknown): Date | undefined {
  return typeof v === 'string' && v ? new Date(v) : undefined;
}

export async function ventes(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await rapportService.getRapportVentes({
      from: parseDate(req.query.from),
      to: parseDate(req.query.to),
      emplacementId: typeof req.query.emplacementId === 'string' ? req.query.emplacementId : undefined,
    });
    res.json(ok(result));
  } catch (e) { next(e); }
}

export async function stock(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    res.json(ok(await rapportService.getRapportStock()));
  } catch (e) { next(e); }
}

export async function achats(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await rapportService.getRapportAchats({
      from: parseDate(req.query.from),
      to: parseDate(req.query.to),
    });
    res.json(ok(result));
  } catch (e) { next(e); }
}

export async function clients(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    res.json(ok(await rapportService.getRapportClients()));
  } catch (e) { next(e); }
}
