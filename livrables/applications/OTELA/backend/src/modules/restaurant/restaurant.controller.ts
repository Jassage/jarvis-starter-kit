import { Request, Response } from 'express';
import * as service from './restaurant.service';
import { sendSuccess } from '../../utils/response';
import { AppError } from '../../middlewares/errorHandler.middleware';

function requireEtab(req: Request) {
  if (!req.etablissementId) throw new AppError('etablissementId requis', 400);
  return req.etablissementId;
}

export async function listPointsDeVente(req: Request, res: Response) {
  const pointsDeVente = await service.listPointsDeVente(requireEtab(req));
  sendSuccess(res, { pointsDeVente });
}

export async function creerPointDeVente(req: Request, res: Response) {
  const pointDeVente = await service.creerPointDeVente(requireEtab(req), req.body);
  sendSuccess(res, { pointDeVente }, 'Point de vente créé');
}

export async function listTables(req: Request, res: Response) {
  const tables = await service.listTables(requireEtab(req));
  sendSuccess(res, { tables });
}

export async function creerTable(req: Request, res: Response) {
  const table = await service.creerTable(requireEtab(req), req.body);
  sendSuccess(res, { table }, 'Table créée');
}

export async function listMenu(req: Request, res: Response) {
  const menu = await service.listMenu(requireEtab(req));
  sendSuccess(res, { menu });
}

export async function creerMenuItem(req: Request, res: Response) {
  const menuItem = await service.creerMenuItem(requireEtab(req), req.body);
  sendSuccess(res, { menuItem }, 'Item de menu créé');
}

export async function updateMenuItem(req: Request, res: Response) {
  const menuItem = await service.updateMenuItem(req.params.id, requireEtab(req), req.body);
  sendSuccess(res, { menuItem }, 'Item de menu mis à jour');
}

export async function ouvrirCommande(req: Request, res: Response) {
  const commande = await service.ouvrirCommande(requireEtab(req), req.body.tableId, req.employe?.id);
  sendSuccess(res, { commande }, 'Commande ouverte');
}

export async function getCommande(req: Request, res: Response) {
  const commande = await service.getCommande(req.params.id, requireEtab(req));
  sendSuccess(res, { commande });
}

export async function ajouterLigneCommande(req: Request, res: Response) {
  const commande = await service.ajouterLigneCommande(req.params.id, requireEtab(req), req.body);
  sendSuccess(res, { commande }, 'Article ajouté');
}

export async function envoyerEnCuisine(req: Request, res: Response) {
  const commande = await service.envoyerEnCuisine(req.params.id, requireEtab(req));
  sendSuccess(res, { commande }, 'Commande envoyée en cuisine');
}

export async function marquerServie(req: Request, res: Response) {
  const commande = await service.marquerServie(req.params.id, requireEtab(req));
  sendSuccess(res, { commande }, 'Commande marquée servie');
}

export async function listCommandesCuisine(req: Request, res: Response) {
  const commandes = await service.listCommandesCuisine(requireEtab(req));
  sendSuccess(res, { commandes });
}

export async function cloturerCommande(req: Request, res: Response) {
  const commande = await service.cloturerCommande(req.params.id, requireEtab(req), req.body, req.employe?.id);
  sendSuccess(res, { commande }, 'Commande clôturée');
}
