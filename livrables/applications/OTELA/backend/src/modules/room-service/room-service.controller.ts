import { Request, Response } from 'express';
import * as service from './room-service.service';
import { sendSuccess } from '../../utils/response';
import { AppError } from '../../middlewares/errorHandler.middleware';

function requireEtab(req: Request) {
  if (!req.etablissementId) throw new AppError('etablissementId requis', 400);
  return req.etablissementId;
}

export async function ouvrirCommande(req: Request, res: Response) {
  const commande = await service.ouvrirCommande(requireEtab(req), req.body.chambreId, req.employe?.id);
  sendSuccess(res, { commande }, 'Commande ouverte');
}

export async function getCommande(req: Request, res: Response) {
  const commande = await service.getCommande(req.params.id, requireEtab(req));
  sendSuccess(res, { commande });
}

export async function ajouterLigne(req: Request, res: Response) {
  const commande = await service.ajouterLigne(req.params.id, requireEtab(req), req.body);
  sendSuccess(res, { commande }, 'Article ajouté');
}

export async function envoyerEnCuisine(req: Request, res: Response) {
  const commande = await service.envoyerEnCuisine(req.params.id, requireEtab(req));
  sendSuccess(res, { commande }, 'Commande envoyée en cuisine');
}

export async function marquerLivree(req: Request, res: Response) {
  const commande = await service.marquerLivree(req.params.id, requireEtab(req));
  sendSuccess(res, { commande }, 'Commande marquée livrée');
}

export async function listCommandesCuisine(req: Request, res: Response) {
  const commandes = await service.listCommandesCuisine(requireEtab(req));
  sendSuccess(res, { commandes });
}

export async function cloturerCommande(req: Request, res: Response) {
  const commande = await service.cloturerCommande(req.params.id, requireEtab(req), req.employe?.id);
  sendSuccess(res, { commande }, 'Commande facturée au folio');
}
