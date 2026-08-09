import { Response, NextFunction } from 'express';
import { AuthRequest, ok } from '../types';
import * as retourService from '../services/retour.service';

export async function create(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const retour = await retourService.createRetour(req.params.id, req.body, req.user!.userId, req.user);
    res.status(201).json(ok(retour, 'Retour enregistré'));
  } catch (e) { next(e); }
}

export async function list(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const retours = await retourService.listRetours(req.params.id, req.user);
    res.json(ok(retours));
  } catch (e) { next(e); }
}
