import { Response } from 'express';
import { CategorieArticle } from '@prisma/client';
import * as service from './actualites.service';
import { sendSuccess } from '../../utils/response';
import { AuthRequest } from '../../types';

export async function listPublique(req: AuthRequest, res: Response) {
  const categorie = req.query.categorie as CategorieArticle | undefined;
  const q = req.query.q as string | undefined;
  const articles = await service.listPublique(categorie, q);
  sendSuccess(res, { articles });
}

export async function listAdmin(_req: AuthRequest, res: Response) {
  const articles = await service.listAdmin();
  sendSuccess(res, { articles });
}

export async function getByIdPublique(req: AuthRequest, res: Response) {
  const article = await service.getByIdPublique(req.params.id);
  sendSuccess(res, { article });
}

export async function create(req: AuthRequest, res: Response) {
  const article = await service.create(req.body);
  sendSuccess(res, { article }, 'Article créé', 201);
}

export async function update(req: AuthRequest, res: Response) {
  const article = await service.update(req.params.id, req.body);
  sendSuccess(res, { article }, 'Article mis à jour');
}

export async function remove(req: AuthRequest, res: Response) {
  await service.remove(req.params.id);
  sendSuccess(res, null, 'Article supprimé');
}
