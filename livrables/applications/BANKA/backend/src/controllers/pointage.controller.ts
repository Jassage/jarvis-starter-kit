import { Response, NextFunction } from 'express';
import { AuthRequest, ok } from '../types';
import * as svc from '../services/pointage.service';

export async function listPointages(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { date, periode, employeId, statut, page, limit } = req.query as Record<string, string>;
    res.json(ok(await svc.listPointages({ date, periode, employeId, statut, page: page ? parseInt(page) : 1, limit: limit ? parseInt(limit) : 50 })));
  } catch (e) { next(e); }
}

export async function getJournalier(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { date } = req.query as Record<string, string>;
    if (!date) { res.status(400).json({ error: 'date requis (YYYY-MM-DD)' }); return; }
    res.json(ok(await svc.getJournalier(date)));
  } catch (e) { next(e); }
}

export async function upsertPointage(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await svc.upsertPointage(req.body, req.user!.userId);
    res.json(ok(result, 'Pointage enregistré'));
  } catch (e) { next(e); }
}

export async function bulkUpsert(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { date, entries } = req.body;
    if (!date || !Array.isArray(entries)) { res.status(400).json({ error: 'date et entries requis' }); return; }
    const result = await svc.bulkUpsertPointage(entries, date, req.user!.userId);
    res.json(ok(result, `${result.created + result.updated} pointage(s) enregistré(s)`));
  } catch (e) { next(e); }
}

export async function deletePointage(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await svc.deletePointage(req.params.id, req.user!.userId);
    res.json(ok(null, 'Pointage supprimé'));
  } catch (e) { next(e); }
}

export async function getStats(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { periode, employeId } = req.query as Record<string, string>;
    if (!periode) { res.status(400).json({ error: 'periode requis (YYYY-MM)' }); return; }
    res.json(ok(await svc.getStats(periode, employeId)));
  } catch (e) { next(e); }
}
