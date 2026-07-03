import { Response, NextFunction } from 'express';
import { AuthRequest, ok } from '../types';
import * as comptaService from '../services/compta.service';

function parseDate(v: unknown): Date | undefined {
  if (typeof v !== 'string' || !v) return undefined;
  const date = new Date(v);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export async function planComptable(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    res.json(ok(await comptaService.getPlanComptable()));
  } catch (e) { next(e); }
}

export async function journal(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await comptaService.getJournal({
      from: parseDate(req.query.from),
      to: parseDate(req.query.to),
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    });
    res.json(ok(result));
  } catch (e) { next(e); }
}

export async function createEcriture(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const ecriture = await comptaService.createEcriture(req.body, req.user!.userId);
    res.status(201).json(ok(ecriture, 'Écriture enregistrée'));
  } catch (e) { next(e); }
}

export async function grandLivre(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await comptaService.getGrandLivre(req.params.compteId, {
      from: parseDate(req.query.from),
      to: parseDate(req.query.to),
    });
    res.json(ok(result));
  } catch (e) { next(e); }
}

export async function bilan(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    res.json(ok(await comptaService.getBilan(parseDate(req.query.date))));
  } catch (e) { next(e); }
}

export async function resultat(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    res.json(ok(await comptaService.getResultat(parseDate(req.query.from), parseDate(req.query.to))));
  } catch (e) { next(e); }
}

export async function dashboard(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    res.json(ok(await comptaService.getDashboardCompta()));
  } catch (e) { next(e); }
}

export async function listEchecs(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await comptaService.listEcrituresEchec({
      resolu: req.query.resolu !== undefined ? req.query.resolu === 'true' : undefined,
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    });
    res.json(ok(result));
  } catch (e) { next(e); }
}

export async function resoudreEchec(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await comptaService.resoudreEcritureEchec(req.params.id, req.user!.userId);
    res.json(ok(null, 'Écriture marquée comme résolue'));
  } catch (e) { next(e); }
}
