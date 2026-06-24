import { Response, NextFunction } from 'express';
import { AuthRequest, ok } from '../types';
import * as caisseService from '../services/caisse.service';

export async function ouvrir(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const session = await caisseService.ouvrirSession({ ...req.body, userId: req.user!.userId });
    res.status(201).json(ok(session, 'Session de caisse ouverte'));
  } catch (e) { next(e); }
}

export async function fermer(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const session = await caisseService.fermerSession(req.params.id, req.user!.userId, req.body.soldeFermeture, req.body.notes);
    res.json(ok(session, 'Session de caisse fermée'));
  } catch (e) { next(e); }
}

export async function sessionActive(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { agenceId, devise } = req.query as Record<string, string>;
    const id = agenceId || req.user!.agenceId;
    if (!id) { res.status(400).json({ success: false, error: 'agenceId requis' }); return; }
    const session = await caisseService.getSessionActive(id, (devise as any) || 'HTG');
    res.json(ok(session));
  } catch (e) { next(e); }
}

export async function getOne(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const session = await caisseService.getSession(req.params.id);
    res.json(ok(session));
  } catch (e) { next(e); }
}

export async function list(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { agenceId, from, to, page, limit } = req.query as Record<string, string>;
    const result = await caisseService.listSessions({
      agenceId,
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 30,
    });
    res.json(ok(result));
  } catch (e) { next(e); }
}

export async function arrete(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await caisseService.getArreteCaisse(req.params.id);
    res.json(ok(result));
  } catch (e) { next(e); }
}
