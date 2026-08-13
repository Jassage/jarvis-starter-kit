import { Response } from 'express';
import * as stockService from './stock.service';
import { sendSuccess } from '../../utils/response';
import { AuthRequest } from '../../types';
import { asyncHandler } from '../../utils/asyncHandler';
import { logAudit } from '../../utils/audit';

export const entree = asyncHandler(async (req: AuthRequest, res: Response) => {
  const lot = await stockService.entree({ ...req.body, pharmacieId: req.user!.pharmacieId, utilisateurId: req.user!.userId });
  await logAudit({ req, action: 'ENTREE_STOCK', entite: 'LotProduit', entiteId: lot.id, details: { quantite: req.body.quantite } });
  sendSuccess(res, lot, 'Entrée de stock enregistrée', 201);
});

export const ajuster = asyncHandler(async (req: AuthRequest, res: Response) => {
  const lot = await stockService.ajuster({ ...req.body, pharmacieId: req.user!.pharmacieId, utilisateurId: req.user!.userId });
  await logAudit({ req, action: 'AJUSTEMENT_STOCK', entite: 'LotProduit', entiteId: req.body.lotId, details: { delta: req.body.delta, motif: req.body.motif } });
  sendSuccess(res, lot, 'Stock ajusté');
});

export const listLots = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { produitId } = req.query as { produitId?: string };
  sendSuccess(res, await stockService.listLots(req.user!.pharmacieId, produitId));
});

export const listMouvements = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { produitId, limit } = req.query as { produitId?: string; limit: unknown };
  sendSuccess(res, await stockService.listMouvements(req.user!.pharmacieId, produitId, Number(limit)));
});

export const alertesPeremption = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { joursSeuil } = req.query as { joursSeuil: unknown };
  sendSuccess(res, await stockService.alertesPeremption(req.user!.pharmacieId, Number(joursSeuil)));
});

export const alertesStockBas = asyncHandler(async (req: AuthRequest, res: Response) => {
  sendSuccess(res, await stockService.alertesStockBas(req.user!.pharmacieId));
});
