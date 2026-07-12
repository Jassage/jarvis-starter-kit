import { Request, Response } from 'express';
import * as service from './minibar.service';
import { sendSuccess } from '../../utils/response';
import { AppError } from '../../middlewares/errorHandler.middleware';

function requireEtab(req: Request) {
  if (!req.etablissementId) throw new AppError('etablissementId requis', 400);
  return req.etablissementId;
}

export async function listArticles(req: Request, res: Response) {
  const articles = await service.listArticles(requireEtab(req));
  sendSuccess(res, { articles });
}

export async function creerArticle(req: Request, res: Response) {
  const article = await service.creerArticle(requireEtab(req), req.body);
  sendSuccess(res, { article }, 'Article créé');
}

export async function listConsommations(req: Request, res: Response) {
  const consommations = await service.listConsommations(requireEtab(req), req.query.chambreId as string | undefined);
  sendSuccess(res, { consommations });
}

export async function constaterConsommation(req: Request, res: Response) {
  const consommations = await service.constaterConsommation(requireEtab(req), req.body.chambreId, req.body.articles, req.employe?.id);
  sendSuccess(res, { consommations }, 'Consommation ajoutée au folio');
}
