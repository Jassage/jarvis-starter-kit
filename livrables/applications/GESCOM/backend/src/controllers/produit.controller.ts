import { Response, NextFunction } from 'express';
import { AuthRequest, ok } from '../types';
import * as produitService from '../services/produit.service';

export async function list(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { search, categorie, actif } = req.query;
    const produits = await produitService.listProduits({
      search: search as string | undefined,
      categorie: categorie as string | undefined,
      actif: actif === undefined ? undefined : actif === 'true',
    });
    res.json(ok(produits));
  } catch (e) { next(e); }
}

export async function getOne(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const produit = await produitService.getProduit(req.params.id);
    res.json(ok(produit));
  } catch (e) { next(e); }
}

export async function create(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const produit = await produitService.createProduit(req.body, req.user!.userId);
    res.status(201).json(ok(produit, 'Produit créé'));
  } catch (e) { next(e); }
}

export async function update(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const produit = await produitService.updateProduit(req.params.id, req.body, req.user!.userId);
    res.json(ok(produit, 'Produit mis à jour'));
  } catch (e) { next(e); }
}

export async function archive(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await produitService.archiveProduit(req.params.id, req.user!.userId);
    res.json(ok(null, 'Produit archivé'));
  } catch (e) { next(e); }
}
