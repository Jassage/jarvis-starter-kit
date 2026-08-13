import { Response } from 'express';
import * as caisseService from './caisse.service';
import { sendSuccess } from '../../utils/response';
import { AuthRequest } from '../../types';
import { asyncHandler } from '../../utils/asyncHandler';
import { logAudit } from '../../utils/audit';

export const getActive = asyncHandler(async (req: AuthRequest, res: Response) => {
  sendSuccess(res, await caisseService.getActive(req.user!.pharmacieId));
});

export const ouvrir = asyncHandler(async (req: AuthRequest, res: Response) => {
  const session = await caisseService.ouvrir(req.user!.pharmacieId, req.body.montantOuverture, req.user!.userId);
  await logAudit({ req, action: 'OUVERTURE_CAISSE', entite: 'CaisseSession', entiteId: session.id });
  sendSuccess(res, session, 'Caisse ouverte', 201);
});

export const fermer = asyncHandler(async (req: AuthRequest, res: Response) => {
  const session = await caisseService.fermer(req.user!.pharmacieId, req.params.id, req.body.montantFermeture, req.user!.userId);
  await logAudit({ req, action: 'FERMETURE_CAISSE', entite: 'CaisseSession', entiteId: session.id, details: { ecart: session.ecart } });
  sendSuccess(res, session, 'Caisse fermée');
});

export const mouvementManuel = asyncHandler(async (req: AuthRequest, res: Response) => {
  const transaction = await caisseService.mouvementManuel(
    req.user!.pharmacieId,
    req.body.type,
    req.body.montant,
    req.body.motif,
    req.user!.userId
  );
  await logAudit({ req, action: 'MOUVEMENT_CAISSE', entite: 'CaisseTransaction', entiteId: transaction.id, details: { type: req.body.type, montant: req.body.montant } });
  sendSuccess(res, transaction, 'Mouvement de caisse enregistré', 201);
});

export const historique = asyncHandler(async (req: AuthRequest, res: Response) => {
  sendSuccess(res, await caisseService.historique(req.user!.pharmacieId, 30));
});
