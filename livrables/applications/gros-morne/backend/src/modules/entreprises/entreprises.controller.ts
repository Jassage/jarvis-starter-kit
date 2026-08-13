import { Response } from 'express';
import { CategorieEconomique } from '@prisma/client';
import * as service from './entreprises.service';
import { sendSuccess } from '../../utils/response';
import { AuthRequest } from '../../types';

export async function listPublique(req: AuthRequest, res: Response) {
  const categorie = req.query.categorie as CategorieEconomique | undefined;
  const entreprises = await service.listPublique(categorie);
  sendSuccess(res, { entreprises });
}

export async function listAdmin(_req: AuthRequest, res: Response) {
  const entreprises = await service.listAdmin();
  sendSuccess(res, { entreprises });
}

export async function create(req: AuthRequest, res: Response) {
  const entreprise = await service.create(req.body);
  sendSuccess(res, { entreprise }, 'Entreprise créée', 201);
}

export async function update(req: AuthRequest, res: Response) {
  const entreprise = await service.update(req.params.id, req.body);
  sendSuccess(res, { entreprise }, 'Entreprise mise à jour');
}

export async function remove(req: AuthRequest, res: Response) {
  await service.remove(req.params.id);
  sendSuccess(res, null, 'Entreprise supprimée');
}
