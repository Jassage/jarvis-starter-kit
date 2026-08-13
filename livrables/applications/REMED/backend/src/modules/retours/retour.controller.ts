import { Response } from 'express';
import * as retourService from './retour.service';
import { sendSuccess } from '../../utils/response';
import { AuthRequest } from '../../types';
import { asyncHandler } from '../../utils/asyncHandler';
import { logAudit } from '../../utils/audit';

export const creer = asyncHandler(async (req: AuthRequest, res: Response) => {
  const retour = await retourService.creer({
    pharmacieId: req.user!.pharmacieId,
    utilisateurId: req.user!.userId,
    ...req.body,
  });
  await logAudit({ req, action: 'CREATION_RETOUR', entite: 'Retour', entiteId: retour.id, details: { type: retour.type } });
  sendSuccess(res, retour, 'Retour enregistré', 201);
});

export const list = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { limit, type } = req.query as { limit: unknown; type?: string };
  sendSuccess(res, await retourService.list(req.user!.pharmacieId, { limit: Number(limit), type }));
});
