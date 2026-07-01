import { Response, NextFunction } from 'express';
import { AuthRequest, ok } from '../types';
import * as emplacementService from '../services/emplacement.service';

export async function list(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const emplacements = await emplacementService.listEmplacements();
    res.json(ok(emplacements));
  } catch (e) { next(e); }
}
