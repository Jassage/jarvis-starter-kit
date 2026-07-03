import { Response, NextFunction } from 'express';
import { AuthRequest, ok } from '../types';
import * as transfertService from '../services/transfert.service';

export async function list(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const transferts = await transfertService.listTransferts({
      emplacementId: req.query.emplacementId as string | undefined,
      statut: req.query.statut as string | undefined,
    });
    res.json(ok(transferts));
  } catch (e) { next(e); }
}

export async function create(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const transfert = await transfertService.createTransfert(req.body, req.user!.userId);
    res.status(201).json(ok(transfert, 'Transfert créé'));
  } catch (e) { next(e); }
}

export async function recevoir(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await transfertService.recevoirTransfert(req.params.id, req.user!.userId);
    res.json(ok(null, 'Transfert réceptionné'));
  } catch (e) { next(e); }
}

export async function annuler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await transfertService.annulerTransfert(req.params.id, req.user!.userId);
    res.json(ok(null, 'Transfert annulé'));
  } catch (e) { next(e); }
}
