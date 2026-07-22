import { Request, Response } from 'express';
import * as service from './employes.service';
import { sendSuccess } from '../../utils/response';
import { AppError } from '../../middlewares/errorHandler.middleware';
import { journaliser } from '../audit/audit.service';

function requireRequester(req: Request) {
  if (!req.employe) throw new AppError('Non authentifié', 401);
  return req.employe;
}

export async function listEmployes(req: Request, res: Response) {
  const employes = await service.listEmployes(requireRequester(req), req.query.etablissementId as string | undefined);
  sendSuccess(res, { employes });
}

export async function creerEmploye(req: Request, res: Response) {
  const employe = await service.creerEmploye(requireRequester(req), req.body);

  await journaliser(
    {
      action: 'EMPLOYE_CREE',
      entite: 'Employe',
      entiteId: employe.id,
      etablissementId: employe.etablissementId,
      details: { nom: employe.nom, email: employe.email, role: employe.role },
    },
    req
  );

  sendSuccess(res, { employe }, 'Employé créé');
}

export async function updateEmploye(req: Request, res: Response) {
  const employe = await service.updateEmploye(requireRequester(req), req.params.id, req.body);

  // Les champs réellement soumis sont tracés (changement de rôle, désactivation) —
  // c'est l'information utile en audit, pas l'état complet de la fiche.
  await journaliser(
    {
      action: 'EMPLOYE_MODIFIE',
      entite: 'Employe',
      entiteId: employe.id,
      etablissementId: employe.etablissementId,
      details: { modifications: req.body },
    },
    req
  );

  sendSuccess(res, { employe }, 'Employé mis à jour');
}

export async function reinitialiserMotDePasse(req: Request, res: Response) {
  await service.reinitialiserMotDePasse(requireRequester(req), req.params.id, req.body.nouveauMotDePasse);

  // Le nouveau mot de passe n'est évidemment jamais journalisé, seulement le fait
  // qu'un administrateur a réinitialisé celui d'un autre compte.
  await journaliser(
    { action: 'MOT_DE_PASSE_REINITIALISE', entite: 'Employe', entiteId: req.params.id },
    req
  );

  sendSuccess(res, {}, 'Mot de passe réinitialisé');
}
