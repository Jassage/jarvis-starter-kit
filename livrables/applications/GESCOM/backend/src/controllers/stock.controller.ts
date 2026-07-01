import { Response, NextFunction } from 'express';
import { AuthRequest, ok } from '../types';
import * as stockService from '../services/stock.service';

export async function list(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const emplacementId = req.query.emplacementId as string | undefined;
    const stock = await stockService.listStock(emplacementId);
    res.json(ok(stock));
  } catch (e) { next(e); }
}

export async function listMouvements(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { produitId, emplacementId, limit } = req.query;
    const mouvements = await stockService.listMouvements({
      produitId: produitId as string | undefined,
      emplacementId: emplacementId as string | undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
    });
    res.json(ok(mouvements));
  } catch (e) { next(e); }
}

export async function listAlertes(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const alertes = await stockService.listAlertes();
    res.json(ok(alertes));
  } catch (e) { next(e); }
}

export async function ajuster(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const stock = await stockService.ajusterStock(req.body, req.user!.userId);
    res.json(ok(stock, 'Stock ajusté'));
  } catch (e) { next(e); }
}
