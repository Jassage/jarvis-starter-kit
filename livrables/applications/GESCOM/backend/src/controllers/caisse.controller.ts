import { Response, NextFunction } from 'express';
import { AuthRequest, ok } from '../types';
import * as caisseService from '../services/caisse.service';

export async function ouvrir(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const session = await caisseService.ouvrirSession(req.body, req.user!.userId);
    res.status(201).json(ok(session, 'Session de caisse ouverte'));
  } catch (e) { next(e); }
}

export async function fermer(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const session = await caisseService.fermerSession(req.params.id, req.user!.userId, req.body.soldeFermeture, req.body.notes, req.user);
    res.json(ok(session, 'Session de caisse fermée'));
  } catch (e) { next(e); }
}

export async function active(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const session = await caisseService.getSessionActive(req.query.emplacementId as string);
    res.json(ok(session));
  } catch (e) { next(e); }
}

export async function getOne(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const session = await caisseService.getSession(req.params.id, req.user);
    res.json(ok(session));
  } catch (e) { next(e); }
}

export async function list(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { emplacementId, page, limit } = req.query;
    const result = await caisseService.listSessions({
      emplacementId: emplacementId as string | undefined,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
    res.json(ok(result));
  } catch (e) { next(e); }
}
