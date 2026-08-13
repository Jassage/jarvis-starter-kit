import { Response } from 'express';
import * as inventaireService from './inventaire.service';
import { sendSuccess } from '../../utils/response';
import { AuthRequest } from '../../types';
import { asyncHandler } from '../../utils/asyncHandler';
import { logAudit } from '../../utils/audit';

export const creer = asyncHandler(async (req: AuthRequest, res: Response) => {
  const inventaire = await inventaireService.creer({
    pharmacieId: req.user!.pharmacieId,
    creeParId: req.user!.userId,
    ...req.body,
  });
  await logAudit({ req, action: 'CREATION_INVENTAIRE', entite: 'Inventaire', entiteId: inventaire.id, details: { type: inventaire.type } });
  sendSuccess(res, inventaire, 'Inventaire créé', 201);
});

export const list = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { limit, statut } = req.query as { limit: unknown; statut?: string };
  sendSuccess(res, await inventaireService.list(req.user!.pharmacieId, { limit: Number(limit), statut }));
});

export const getById = asyncHandler(async (req: AuthRequest, res: Response) => {
  sendSuccess(res, await inventaireService.getById(req.user!.pharmacieId, req.params.id));
});

export const saisirQuantites = asyncHandler(async (req: AuthRequest, res: Response) => {
  const inventaire = await inventaireService.saisirQuantites(req.user!.pharmacieId, req.params.id, req.body.lignes);
  sendSuccess(res, inventaire, 'Quantités enregistrées');
});

export const annuler = asyncHandler(async (req: AuthRequest, res: Response) => {
  const inventaire = await inventaireService.annuler(req.user!.pharmacieId, req.params.id);
  await logAudit({ req, action: 'ANNULATION_INVENTAIRE', entite: 'Inventaire', entiteId: inventaire.id });
  sendSuccess(res, inventaire, 'Inventaire annulé');
});

export const valider = asyncHandler(async (req: AuthRequest, res: Response) => {
  const inventaire = await inventaireService.valider(req.user!.pharmacieId, req.params.id, req.user!.userId);
  await logAudit({ req, action: 'VALIDATION_INVENTAIRE', entite: 'Inventaire', entiteId: inventaire.id });
  sendSuccess(res, inventaire, 'Inventaire validé, ajustements de stock appliqués');
});
