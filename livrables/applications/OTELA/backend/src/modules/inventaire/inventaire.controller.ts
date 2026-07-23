import { Request, Response } from 'express';
import * as service from './inventaire.service';
import { sendSuccess } from '../../utils/response';
import { AppError } from '../../middlewares/errorHandler.middleware';

export async function listArticles(req: Request, res: Response) {
  if (!req.etablissementId) throw new AppError('etablissementId requis', 400);
  const articles = await service.listArticles(req.etablissementId);
  sendSuccess(res, { articles });
}

export async function creerArticle(req: Request, res: Response) {
  const article = await service.creerArticle(req.etablissementId, req.body);
  sendSuccess(res, { article }, 'Article créé', 201);
}

export async function updateArticle(req: Request, res: Response) {
  const article = await service.updateArticle(req.params.id, req.etablissementId, req.body);
  sendSuccess(res, { article }, 'Article mis à jour');
}

export async function listMouvements(req: Request, res: Response) {
  const mouvements = await service.listMouvements(req.params.articleId, req.etablissementId);
  sendSuccess(res, { mouvements });
}

export async function enregistrerMouvement(req: Request, res: Response) {
  if (!req.employe) throw new AppError('Non authentifié', 401);
  const mouvement = await service.enregistrerMouvement(req.params.articleId, req.etablissementId, req.employe.id, req.body);
  sendSuccess(res, { mouvement }, 'Mouvement enregistré', 201);
}
