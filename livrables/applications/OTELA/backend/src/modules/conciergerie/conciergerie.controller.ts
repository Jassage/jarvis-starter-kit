import { Request, Response } from 'express';
import * as service from './conciergerie.service';
import { sendSuccess } from '../../utils/response';
import { AppError } from '../../middlewares/errorHandler.middleware';

function requireEtab(req: Request) {
  if (!req.etablissementId) throw new AppError('etablissementId requis', 400);
  return req.etablissementId;
}

export async function listDemandes(req: Request, res: Response) {
  const demandes = await service.listDemandes(requireEtab(req));
  sendSuccess(res, { demandes });
}

export async function creerDemande(req: Request, res: Response) {
  const demande = await service.creerDemande(requireEtab(req), req.body);
  sendSuccess(res, { demande }, 'Demande créée');
}

export async function assigner(req: Request, res: Response) {
  const demande = await service.assigner(req.params.id, requireEtab(req), req.body.employeAssigneId);
  sendSuccess(res, { demande }, 'Demande assignée');
}

export async function terminer(req: Request, res: Response) {
  const demande = await service.terminer(req.params.id, requireEtab(req), req.body.montant, req.employe?.id);
  sendSuccess(res, { demande }, 'Demande terminée');
}
