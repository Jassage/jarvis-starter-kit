import { Response, NextFunction } from 'express';
import { AuthRequest, ok } from '../types';
import * as statsService from '../services/stats.service';

export async function dashboard(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const agenceId = req.query.agenceId as string | undefined;
    const stats = await statsService.getDashboardStats(agenceId);
    res.json(ok(stats));
  } catch (e) { next(e); }
}

export async function rapportJournalier(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { date, agenceId } = req.query as Record<string, string>;
    const d = date ? new Date(date) : new Date();
    const result = await statsService.getRapportJournalier(d, agenceId);
    res.json(ok(result));
  } catch (e) { next(e); }
}

export async function par(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const agenceId = req.query.agenceId as string | undefined;
    const result = await statsService.getPAR(agenceId);
    res.json(ok(result));
  } catch (e) { next(e); }
}
