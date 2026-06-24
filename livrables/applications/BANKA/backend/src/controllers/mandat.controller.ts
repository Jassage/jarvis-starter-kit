import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import * as svc from '../services/mandat.service';

export const list = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const mandats = await svc.listMandats(req.params.id);
    res.json({ data: mandats });
  } catch (err) { next(err); }
};

export const create = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const mandat = await svc.createMandat(req.params.id, req.body, req.user!.userId);
    res.status(201).json({ data: mandat });
  } catch (err) { next(err); }
};

export const update = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const mandat = await svc.updateMandat(req.params.mandatId, req.body, req.user!.userId);
    res.json({ data: mandat });
  } catch (err) { next(err); }
};

export const revoquer = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await svc.revoquerMandat(req.params.mandatId, req.user!.userId);
    res.json({ message: 'Mandat révoqué' });
  } catch (err) { next(err); }
};
