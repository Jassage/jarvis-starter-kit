import { Request, Response } from 'express';
import * as service from './utilisateurs.service';
import { sendSuccess } from '../../utils/response';
import { logAudit } from '../audit/audit.service';
import { env } from '../../config/env';
import { Role } from '@prisma/client';

export async function list(_req: Request, res: Response) {
  const utilisateurs = await service.listUtilisateurs();
  sendSuccess(res, { utilisateurs });
}

export async function getOne(req: Request, res: Response) {
  const utilisateur = await service.getUtilisateur(req.params.id);
  sendSuccess(res, { utilisateur });
}

export async function create(req: Request, res: Response) {
  const utilisateur = await service.createUtilisateur(req.body);
  await logAudit(req, 'UTILISATEUR_CREE', {
    cible: 'User',
    cibleId: utilisateur.id,
    details: `Compte ${utilisateur.role} créé pour ${utilisateur.email}`,
  });
  sendSuccess(res, { utilisateur }, 'Utilisateur créé', 201);
}

export async function update(req: Request, res: Response) {
  const utilisateur = await service.updateUtilisateur(req.params.id, req.body, req.user!.id);
  await logAudit(req, 'UTILISATEUR_MODIFIE', {
    cible: 'User',
    cibleId: utilisateur.id,
    details: `${utilisateur.email} : ${Object.entries(req.body as Record<string, unknown>)
      .map(([cle, valeur]) => `${cle}=${String(valeur)}`)
      .join(', ')}`,
  });
  sendSuccess(res, { utilisateur }, 'Utilisateur mis à jour');
}

// Renvoie le lien complet à transmettre à l'intéressé. Aucun SMTP n'est configuré sur
// ce déploiement : l'administrateur le communique par le canal de son choix, et ne
// connaît à aucun moment le futur mot de passe.
export async function genererLienReset(req: Request, res: Response) {
  const { token, expiresAt, utilisateur } = await service.genererLienReinitialisation(req.params.id);
  await logAudit(req, 'UTILISATEUR_MOT_DE_PASSE_REINITIALISE', {
    cible: 'User',
    cibleId: utilisateur.id,
    // Horodatage lisible : le journal est relu par un humain, pas par une machine.
    details: `Lien de réinitialisation généré pour ${utilisateur.email} (valable jusqu'à ${expiresAt.toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })})`,
  });
  sendSuccess(
    res,
    {
      lien: `${env.FRONTEND_URL}/reinitialiser?token=${token}`,
      expiresAt,
      utilisateur,
    },
    'Lien de réinitialisation généré'
  );
}

// Le seul rôle exposé côté API, pour que le frontend n'ait pas à le coder en dur.
export function roles(_req: Request, res: Response) {
  sendSuccess(res, { roles: Object.values(Role) });
}
