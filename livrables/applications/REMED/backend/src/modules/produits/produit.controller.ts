import { Response } from 'express';
import * as produitService from './produit.service';
import { sendSuccess } from '../../utils/response';
import { AuthRequest } from '../../types';
import { asyncHandler } from '../../utils/asyncHandler';
import { logAudit } from '../../utils/audit';

export const list = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { recherche, categorieId, alerteStock, tous } = req.query as Record<string, string | undefined>;
  const produits = await produitService.list(req.user!.pharmacieId, {
    recherche,
    categorieId,
    alerteStock: alerteStock === 'true',
    tous: tous === 'true',
  });
  sendSuccess(res, produits);
});

export const getById = asyncHandler(async (req: AuthRequest, res: Response) => {
  sendSuccess(res, await produitService.getById(req.user!.pharmacieId, req.params.id));
});

export const create = asyncHandler(async (req: AuthRequest, res: Response) => {
  const produit = await produitService.create(req.user!.pharmacieId, req.body);
  await logAudit({ req, action: 'CREATION', entite: 'Produit', entiteId: produit.id });
  sendSuccess(res, produit, 'Produit créé', 201);
});

export const update = asyncHandler(async (req: AuthRequest, res: Response) => {
  const produit = await produitService.update(req.user!.pharmacieId, req.params.id, req.body);
  await logAudit({ req, action: 'MODIFICATION', entite: 'Produit', entiteId: produit.id });
  sendSuccess(res, produit, 'Produit mis à jour');
});
