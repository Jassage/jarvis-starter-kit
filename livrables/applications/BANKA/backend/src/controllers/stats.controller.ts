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

export async function tendance(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const jours = req.query.jours ? parseInt(req.query.jours as string) : 7;
    const result = await statsService.getTendance(Math.min(Math.max(jours, 7), 30));
    res.json(ok(result));
  } catch (e) { next(e); }
}

export async function alertes(_req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await statsService.getAlertes();
    res.json(ok(result));
  } catch (e) { next(e); }
}

export async function rapportBRH(_req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await statsService.getRapportBRH();
    res.json(ok(result));
  } catch (e) { next(e); }
}
