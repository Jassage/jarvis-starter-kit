import { Response } from 'express';
import * as depenseService from './depense.service';
import { sendSuccess } from '../../utils/response';
import { AuthRequest } from '../../types';
import { asyncHandler } from '../../utils/asyncHandler';
import { logAudit } from '../../utils/audit';

export const creer = asyncHandler(async (req: AuthRequest, res: Response) => {
  const depense = await depenseService.creer({
    pharmacieId: req.user!.pharmacieId,
    utilisateurId: req.user!.userId,
    ...req.body,
  });
  await logAudit({ req, action: 'CREATION_DEPENSE', entite: 'Depense', entiteId: depense.id, details: { montant: depense.montant, categorie: depense.categorie } });
  sendSuccess(res, depense, 'Dépense enregistrée', 201);
});

export const list = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { limit, categorie } = req.query as { limit: unknown; categorie?: string };
  sendSuccess(res, await depenseService.list(req.user!.pharmacieId, { limit: Number(limit), categorie }));
});
