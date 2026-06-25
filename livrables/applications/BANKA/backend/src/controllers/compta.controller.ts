import { Response, NextFunction } from 'express';
import { AuthRequest, ok } from '../types';
import * as svc from '../services/compta.service';

export async function dashboard(req: AuthRequest, res: Response, next: NextFunction) {
  try { res.json(ok(await svc.getDashboard())); } catch (e) { next(e); }
}

export async function planComptable(req: AuthRequest, res: Response, next: NextFunction) {
  try { res.json(ok(await svc.getPlanComptable())); } catch (e) { next(e); }
}

export async function createCompte(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const c = await svc.createCompteComptable(req.body, req.user!.userId);
    res.status(201).json(ok(c, 'Compte créé'));
  } catch (e) { next(e); }
}
export async function updateCompte(req: AuthRequest, res: Response, next: NextFunction) {
  try { res.json(ok(await svc.updateCompteComptable(req.params.id, req.body, req.user!.userId), 'Compte mis à jour')); } catch (e) { next(e); }
}
export async function deleteCompte(req: AuthRequest, res: Response, next: NextFunction) {
  try { res.json(ok(await svc.deleteCompteComptable(req.params.id, req.user!.userId), 'Compte supprimé')); } catch (e) { next(e); }
}

export async function journal(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { from, to, page, limit } = req.query as Record<string, string>;
    const result = await svc.getJournal({
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to + 'T23:59:59') : undefined,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 30,
    });
    res.json(ok(result));
  } catch (e) { next(e); }
}

export async function createEcriture(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const e = await svc.createEcriture(req.body, req.user!.userId);
    res.status(201).json(ok(e, 'Écriture enregistrée'));
  } catch (e) { next(e); }
}
export async function deleteEcriture(req: AuthRequest, res: Response, next: NextFunction) {
  try { res.json(ok(await svc.deleteEcriture(req.params.id, req.user!.userId), 'Écriture supprimée')); } catch (e) { next(e); }
}

export async function grandLivre(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { compteId, from, to } = req.query as Record<string, string>;
    if (!compteId) { res.status(400).json({ message: 'compteId requis' }); return; }
    const result = await svc.getGrandLivre(compteId, {
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to + 'T23:59:59') : undefined,
    });
    res.json(ok(result));
  } catch (e) { next(e); }
}

export async function bilan(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { date } = req.query as Record<string, string>;
    const result = await svc.getBilan(date ? new Date(date + 'T23:59:59') : undefined);
    res.json(ok(result));
  } catch (e) { next(e); }
}

export async function resultat(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { from, to } = req.query as Record<string, string>;
    const result = await svc.getResultat(
      from ? new Date(from) : undefined,
      to ? new Date(to + 'T23:59:59') : undefined,
    );
    res.json(ok(result));
  } catch (e) { next(e); }
}
