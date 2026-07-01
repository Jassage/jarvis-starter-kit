import { Response, NextFunction } from 'express';
import { AuthRequest, ok } from '../types';
import * as fournisseurService from '../services/fournisseur.service';

export async function list(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const fournisseurs = await fournisseurService.listFournisseurs(req.query.search as string | undefined);
    res.json(ok(fournisseurs));
  } catch (e) { next(e); }
}

export async function create(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const fournisseur = await fournisseurService.createFournisseur(req.body, req.user!.userId);
    res.status(201).json(ok(fournisseur, 'Fournisseur créé'));
  } catch (e) { next(e); }
}

export async function update(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const fournisseur = await fournisseurService.updateFournisseur(req.params.id, req.body, req.user!.userId);
    res.json(ok(fournisseur));
  } catch (e) { next(e); }
}

export async function archive(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await fournisseurService.archiveFournisseur(req.params.id, req.user!.userId);
    res.json(ok(null, 'Fournisseur archivé'));
  } catch (e) { next(e); }
}
