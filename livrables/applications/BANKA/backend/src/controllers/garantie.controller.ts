import { Response, NextFunction } from 'express';
import { AuthRequest, ok } from '../types';
import * as garantieService from '../services/garantie.service';

export async function list(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await garantieService.listGaranties(req.params.id);
    res.json(ok(result));
  } catch (e) { next(e); }
}

export async function create(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const garantie = await garantieService.createGarantie(req.params.id, req.body, req.user!.userId, req.user!.agenceId);
    res.status(201).json(ok(garantie, 'Garantie ajoutée'));
  } catch (e) { next(e); }
}

export async function update(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const garantie = await garantieService.updateGarantie(req.params.garantieId, req.body, req.user!.userId, req.user!.agenceId);
    res.json(ok(garantie));
  } catch (e) { next(e); }
}
