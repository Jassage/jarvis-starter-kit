import { Response } from 'express';
import * as userService from './user.service';
import { sendSuccess } from '../../utils/response';
import { AuthRequest } from '../../types';
import { logAudit } from '../../utils/audit';

export async function createUser(req: AuthRequest, res: Response) {
  const utilisateur = await userService.createUser(req.body.email, req.body.nom, req.body.prenom);
  await logAudit({
    req,
    action: 'UTILISATEUR_CREE',
    entite: 'Utilisateur',
    entiteId: utilisateur.id,
    changes: { email: utilisateur.email },
  });
  sendSuccess(res, { utilisateur }, 'Compte client créé, un email d\'invitation a été envoyé', 201);
}

export async function listUsers(req: AuthRequest, res: Response) {
  const utilisateurs = await userService.listUsers();
  sendSuccess(res, { utilisateurs });
}

export async function updateUserActif(req: AuthRequest, res: Response) {
  const utilisateur = await userService.setUserActif(req.params.id, req.body.actif);
  await logAudit({
    req,
    action: utilisateur.actif ? 'UTILISATEUR_REACTIVE' : 'UTILISATEUR_DESACTIVE',
    entite: 'Utilisateur',
    entiteId: utilisateur.id,
    changes: { email: utilisateur.email },
  });
  sendSuccess(res, { utilisateur }, 'Utilisateur mis à jour');
}
