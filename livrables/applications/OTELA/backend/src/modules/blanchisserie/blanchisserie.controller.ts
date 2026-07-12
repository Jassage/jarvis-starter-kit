import { Request, Response } from 'express';
import * as service from './blanchisserie.service';
import { sendSuccess } from '../../utils/response';
import { AppError } from '../../middlewares/errorHandler.middleware';

function requireEtab(req: Request) {
  if (!req.etablissementId) throw new AppError('etablissementId requis', 400);
  return req.etablissementId;
}

export async function listCommandes(req: Request, res: Response) {
  const commandes = await service.listCommandes(requireEtab(req));
  sendSuccess(res, { commandes });
}

export async function creerCommande(req: Request, res: Response) {
  const commande = await service.creerCommande(requireEtab(req), req.body);
  sendSuccess(res, { commande }, 'Commande créée');
}

export async function updateStatut(req: Request, res: Response) {
  const commande = await service.updateStatut(req.params.id, requireEtab(req), req.body.statut, req.employe?.id);
  sendSuccess(res, { commande }, 'Statut mis à jour');
}
