import { Response, NextFunction } from 'express';
import { AuthRequest, ok } from '../types';
import * as txService from '../services/transaction.service';

export async function depot(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const tx = await txService.effectuerDepot({ ...req.body, userId: req.user!.userId });
    res.status(201).json(ok(tx, 'Dépôt enregistré'));
  } catch (e) { next(e); }
}

export async function retrait(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const tx = await txService.effectuerRetrait({ ...req.body, userId: req.user!.userId });
    res.status(201).json(ok(tx, 'Retrait enregistré'));
  } catch (e) { next(e); }
}

export async function virement(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const tx = await txService.effectuerVirement({ ...req.body, userId: req.user!.userId });
    res.status(201).json(ok(tx, 'Virement enregistré'));
  } catch (e) { next(e); }
}

export async function valider(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const tx = await txService.validerTransaction(req.params.id, req.user!.userId);
    res.json(ok(tx, 'Transaction validée'));
  } catch (e) { next(e); }
}

export async function rejeter(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const tx = await txService.rejeterTransaction(req.params.id, req.user!.userId, req.body.motif);
    res.json(ok(tx, 'Transaction rejetée'));
  } catch (e) { next(e); }
}

export async function list(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { compteId, type, statut, sessionId, from, to, page, limit } = req.query as Record<string, string>;
    const result = await txService.listTransactions({
      compteId, type: type as any, statut, sessionId,
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 30,
    });
    res.json(ok(result));
  } catch (e) { next(e); }
}

export async function getOne(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const tx = await txService.getTransaction(req.params.id);
    res.json(ok(tx));
  } catch (e) { next(e); }
}
