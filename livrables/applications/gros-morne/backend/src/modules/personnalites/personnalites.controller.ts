import { Response } from 'express';
import { CategorieHonneur } from '@prisma/client';
import * as service from './personnalites.service';
import { sendSuccess } from '../../utils/response';
import { AuthRequest } from '../../types';

export async function list(req: AuthRequest, res: Response) {
  const categorie = req.query.categorie as CategorieHonneur | undefined;
  const personnalites = await service.list(categorie);
  sendSuccess(res, { personnalites });
}

export async function getById(req: AuthRequest, res: Response) {
  const personnalite = await service.getById(req.params.id);
  sendSuccess(res, { personnalite });
}

export async function create(req: AuthRequest, res: Response) {
  const personnalite = await service.create(req.body);
  sendSuccess(res, { personnalite }, 'Personnalité créée', 201);
}

export async function update(req: AuthRequest, res: Response) {
  const personnalite = await service.update(req.params.id, req.body);
  sendSuccess(res, { personnalite }, 'Personnalité mise à jour');
}

export async function remove(req: AuthRequest, res: Response) {
  await service.remove(req.params.id);
  sendSuccess(res, null, 'Personnalité supprimée');
}

export async function ajouterEtape(req: AuthRequest, res: Response) {
  const etape = await service.ajouterEtape(req.params.id, req.body);
  sendSuccess(res, { etape }, 'Étape ajoutée', 201);
}

export async function modifierEtape(req: AuthRequest, res: Response) {
  const etape = await service.modifierEtape(req.params.etapeId, req.body);
  sendSuccess(res, { etape }, 'Étape mise à jour');
}

export async function supprimerEtape(req: AuthRequest, res: Response) {
  await service.supprimerEtape(req.params.etapeId);
  sendSuccess(res, null, 'Étape supprimée');
}

export async function ajouterPhoto(req: AuthRequest, res: Response) {
  const photo = await service.ajouterPhoto(req.params.id, req.body.mediaId, req.body.ordre);
  sendSuccess(res, { photo }, 'Photo ajoutée', 201);
}

export async function supprimerPhoto(req: AuthRequest, res: Response) {
  await service.supprimerPhoto(req.params.photoId);
  sendSuccess(res, null, 'Photo supprimée');
}
