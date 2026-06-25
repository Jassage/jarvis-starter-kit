import { Response, NextFunction } from 'express';
import { AuthRequest, ok } from '../types';
import * as svc from '../services/epargne-programme.service';

export async function list(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { compteId, actif, page, limit } = req.query as Record<string, string>;
    const result = await svc.listEpargnes({
      compteId,
      actif: actif !== undefined ? actif === 'true' : undefined,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    });
    res.json(ok(result));
  } catch (e) { next(e); }
}

export async function create(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const ep = await svc.createEpargne(req.body, req.user!.userId);
    res.status(201).json(ok(ep, 'Épargne programmée créée'));
  } catch (e) { next(e); }
}

export async function toggle(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const ep = await svc.toggleEpargne(req.params.id, req.user!.userId);
    res.json(ok(ep));
  } catch (e) { next(e); }
}

export async function executer(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const results = await svc.executerEpargnes(req.user!.userId);
    res.json(ok(results, `${results.executees} versement(s) exécuté(s)`));
  } catch (e) { next(e); }
}
