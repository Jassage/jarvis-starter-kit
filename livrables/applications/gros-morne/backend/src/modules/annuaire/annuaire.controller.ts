import { Response } from 'express';
import { CategorieAnnuaire } from '@prisma/client';
import * as service from './annuaire.service';
import { SecteurAnnuaire } from './annuaire.service';
import { sendSuccess } from '../../utils/response';
import { AuthRequest } from '../../types';

export async function listPublique(req: AuthRequest, res: Response) {
  const categorie = req.query.categorie as CategorieAnnuaire | undefined;
  const entrees = await service.listPublique(categorie);
  sendSuccess(res, { entrees });
}

// Agrégation server-side (Phase 3) : page publique /annuaire — recherche + filtre secteur
// réels, plus de chargement intégral des 7 verticaux pour filtrer côté navigateur.
export async function listToutes(req: AuthRequest, res: Response) {
  const secteur = (req.query.secteur as SecteurAnnuaire | undefined) ?? 'toutes';
  const q = req.query.q as string | undefined;
  const fiches = await service.listToutes(secteur, q);
  sendSuccess(res, { fiches });
}

export async function listAdmin(_req: AuthRequest, res: Response) {
  const entrees = await service.listAdmin();
  sendSuccess(res, { entrees });
}

export async function create(req: AuthRequest, res: Response) {
  const entree = await service.create(req.body);
  sendSuccess(res, { entree }, 'Fiche créée', 201);
}

export async function update(req: AuthRequest, res: Response) {
  const entree = await service.update(req.params.id, req.body);
  sendSuccess(res, { entree }, 'Fiche mise à jour');
}

export async function remove(req: AuthRequest, res: Response) {
  await service.remove(req.params.id);
  sendSuccess(res, null, 'Fiche supprimée');
}
