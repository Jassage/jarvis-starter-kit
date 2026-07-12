import { Response, NextFunction } from 'express';
import { AuthRequest, ok } from '../types';
import * as svc from '../services/tresorerie.service';

export async function list(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { agenceId, statut, page, limit } = req.query as Record<string, string>;
    const result = await svc.listTransferts({
      agenceId,
      statut,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 30,
    });
    res.json(ok(result));
  } catch (e) { next(e); }
}

export async function getOne(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const transfert = await svc.getTransfert(req.params.id);
    res.json(ok(transfert));
  } catch (e) { next(e); }
}

export async function envoyer(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const transfert = await svc.envoyerTransfert({ ...req.body, userId: req.user!.userId, agentAgenceId: req.user!.agenceId });
    res.status(201).json(ok(transfert, 'Transfert de trésorerie envoyé'));
  } catch (e) { next(e); }
}

export async function confirmer(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const transfert = await svc.confirmerReception(req.params.id, req.user!.userId, req.user!.agenceId);
    res.json(ok(transfert, 'Réception confirmée'));
  } catch (e) { next(e); }
}

export async function annuler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const transfert = await svc.annulerTransfert(req.params.id, req.user!.userId);
    res.json(ok(transfert, 'Transfert annulé'));
  } catch (e) { next(e); }
}

export async function caisseAgence(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await svc.getCaisseAgence(req.params.agenceId);
    res.json(ok(result));
  } catch (e) { next(e); }
}
