import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import * as svc from '../services/configuration.service';
import { createAuditLog } from '../utils/audit';

export const list = async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const configs = await svc.getAllConfigs();
    res.json({ data: configs });
  } catch (err) { next(err); }
};

export const update = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { cle } = req.params;
    const { valeur } = req.body;
    const config = await svc.upsertConfig(cle, valeur);
    await createAuditLog({ userId: req.user!.userId, table: 'configurations', action: 'UPDATE', entiteId: cle, nouveau: { valeur } });
    res.json({ data: config });
  } catch (err) { next(err); }
};

export const bulkUpdate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { entries } = req.body as { entries: { cle: string; valeur: string }[] };
    const configs = await svc.bulkUpsert(entries);
    await createAuditLog({ userId: req.user!.userId, table: 'configurations', action: 'BULK_UPDATE', entiteId: 'bulk', nouveau: { count: entries.length } });
    res.json({ data: configs });
  } catch (err) { next(err); }
};
