import { Response } from 'express';
import * as fournisseurService from './fournisseur.service';
import { sendSuccess } from '../../utils/response';
import { AuthRequest } from '../../types';
import { asyncHandler } from '../../utils/asyncHandler';
import { logAudit } from '../../utils/audit';

export const list = asyncHandler(async (req: AuthRequest, res: Response) => {
  const includeInactifs = req.query.tous === 'true';
  const fournisseurs = await fournisseurService.list(req.user!.pharmacieId, includeInactifs);
  sendSuccess(res, fournisseurs);
});

export const getById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const fournisseur = await fournisseurService.getById(req.user!.pharmacieId, req.params.id);
  sendSuccess(res, fournisseur);
});

export const create = asyncHandler(async (req: AuthRequest, res: Response) => {
  const fournisseur = await fournisseurService.create(req.user!.pharmacieId, req.body);
  await logAudit({ req, action: 'CREATION', entite: 'Fournisseur', entiteId: fournisseur.id });
  sendSuccess(res, fournisseur, 'Fournisseur créé', 201);
});

export const update = asyncHandler(async (req: AuthRequest, res: Response) => {
  const fournisseur = await fournisseurService.update(req.user!.pharmacieId, req.params.id, req.body);
  await logAudit({ req, action: 'MODIFICATION', entite: 'Fournisseur', entiteId: fournisseur.id });
  sendSuccess(res, fournisseur, 'Fournisseur mis à jour');
});
