import { Response, NextFunction } from 'express';
import { AuthRequest, ok } from '../types';
import * as venteService from '../services/vente.service';

export async function list(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { emplacementId, statut, dateFrom, dateTo } = req.query;
    const ventes = await venteService.listVentes({
      emplacementId: emplacementId as string | undefined,
      statut: statut as string | undefined,
      dateFrom: dateFrom as string | undefined,
      dateTo: dateTo as string | undefined,
    });
    res.json(ok(ventes));
  } catch (e) { next(e); }
}

export async function getOne(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const vente = await venteService.getVente(req.params.id);
    res.json(ok(vente));
  } catch (e) { next(e); }
}

export async function create(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const vente = await venteService.createVente(req.body, req.user!.userId);
    res.status(201).json(ok(vente, 'Vente enregistrée'));
  } catch (e) { next(e); }
}

export async function cancel(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await venteService.cancelVente(req.params.id, req.user!.userId);
    res.json(ok(null, 'Vente annulée'));
  } catch (e) { next(e); }
}
