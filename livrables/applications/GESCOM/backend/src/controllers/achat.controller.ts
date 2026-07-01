import { Response, NextFunction } from 'express';
import { AuthRequest, ok } from '../types';
import * as achatService from '../services/achat.service';

export async function list(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const commandes = await achatService.listCommandes({
      emplacementId: req.query.emplacementId as string | undefined,
      statut: req.query.statut as string | undefined,
    });
    res.json(ok(commandes));
  } catch (e) { next(e); }
}

export async function create(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const commande = await achatService.createCommande(req.body, req.user!.userId);
    res.status(201).json(ok(commande, 'Commande créée'));
  } catch (e) { next(e); }
}

export async function envoyer(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await achatService.envoyerCommande(req.params.id, req.user!.userId);
    res.json(ok(null, 'Commande envoyée au fournisseur'));
  } catch (e) { next(e); }
}

export async function recevoir(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await achatService.recevoirCommande(req.params.id, req.body.lignes, req.user!.userId);
    res.json(ok(null, 'Réception enregistrée'));
  } catch (e) { next(e); }
}

export async function annuler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await achatService.annulerCommande(req.params.id, req.user!.userId);
    res.json(ok(null, 'Commande annulée'));
  } catch (e) { next(e); }
}
