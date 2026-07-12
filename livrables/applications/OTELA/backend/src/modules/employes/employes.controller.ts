import { Request, Response } from 'express';
import * as service from './employes.service';
import { sendSuccess } from '../../utils/response';
import { AppError } from '../../middlewares/errorHandler.middleware';

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
  sendSuccess(res, { employe }, 'Employé créé');
}

export async function updateEmploye(req: Request, res: Response) {
  const employe = await service.updateEmploye(requireRequester(req), req.params.id, req.body);
  sendSuccess(res, { employe }, 'Employé mis à jour');
}

export async function reinitialiserMotDePasse(req: Request, res: Response) {
  await service.reinitialiserMotDePasse(requireRequester(req), req.params.id, req.body.nouveauMotDePasse);
  sendSuccess(res, {}, 'Mot de passe réinitialisé');
}
