import { Response } from 'express';
import * as utilisateurService from './utilisateur.service';
import { sendSuccess } from '../../utils/response';
import { AuthRequest } from '../../types';
import { asyncHandler } from '../../utils/asyncHandler';
import { logAudit } from '../../utils/audit';

export const list = asyncHandler(async (req: AuthRequest, res: Response) => {
  sendSuccess(res, await utilisateurService.list(req.user!.pharmacieId));
});

export const creer = asyncHandler(async (req: AuthRequest, res: Response) => {
  const utilisateur = await utilisateurService.creer({
    pharmacieId: req.user!.pharmacieId,
    createParRole: req.user!.role,
    ...req.body,
  });
  await logAudit({ req, action: 'CREATION_UTILISATEUR', entite: 'Utilisateur', entiteId: utilisateur.id, details: { role: utilisateur.role } });
  sendSuccess(res, utilisateur, 'Compte créé', 201);
});

export const update = asyncHandler(async (req: AuthRequest, res: Response) => {
  const utilisateur = await utilisateurService.update(req.user!.pharmacieId, req.params.id, req.body, req.user!.userId, req.user!.role);
  await logAudit({ req, action: 'MODIFICATION_UTILISATEUR', entite: 'Utilisateur', entiteId: utilisateur.id, details: req.body });
  sendSuccess(res, utilisateur, 'Compte mis à jour');
});

export const resetPassword = asyncHandler(async (req: AuthRequest, res: Response) => {
  await utilisateurService.resetPassword(req.user!.pharmacieId, req.params.id, req.body.nouveauMotDePasse);
  await logAudit({ req, action: 'RESET_MOT_DE_PASSE_UTILISATEUR', entite: 'Utilisateur', entiteId: req.params.id });
  sendSuccess(res, null, 'Mot de passe réinitialisé, les sessions actives ont été révoquées');
});
