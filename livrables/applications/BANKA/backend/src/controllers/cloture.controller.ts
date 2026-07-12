import { Response, NextFunction } from 'express';
import { AuthRequest, ok, AppError } from '../types';
import * as svc from '../services/cloture.service';

export async function listPeriodes(req: AuthRequest, res: Response, next: NextFunction) {
  try { res.json(ok(await svc.listPeriodesComptables())); } catch (e) { next(e); }
}

export async function cloturer(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { periode, forcerMalgreDesequilibre } = req.body;
    if (forcerMalgreDesequilibre && req.user!.role !== 'SUPER_ADMIN') {
      throw new AppError(403, 'Seul un SUPER_ADMIN peut forcer une clôture malgré un déséquilibre');
    }
    const result = await svc.cloturerPeriode(periode, req.user!.userId, { forcerMalgreDesequilibre });
    res.status(201).json(ok(result, `Période ${periode} clôturée`));
  } catch (e) { next(e); }
}

export async function rouvrir(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { periode } = req.body;
    const result = await svc.rouvrirPeriode(periode, req.user!.userId);
    res.json(ok(result, `Période ${periode} rouverte`));
  } catch (e) { next(e); }
}
