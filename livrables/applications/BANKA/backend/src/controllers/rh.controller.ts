import { Response, NextFunction } from 'express';
import { AuthRequest, ok } from '../types';
import * as svc from '../services/rh.service';

export async function listPostes(req: AuthRequest, res: Response, next: NextFunction) {
  try { res.json(ok(await svc.listPostes())); } catch (e) { next(e); }
}
export async function createPoste(req: AuthRequest, res: Response, next: NextFunction) {
  try { res.status(201).json(ok(await svc.createPoste(req.body), 'Poste créé')); } catch (e) { next(e); }
}
export async function updatePoste(req: AuthRequest, res: Response, next: NextFunction) {
  try { res.json(ok(await svc.updatePoste(req.params.id, req.body), 'Poste mis à jour')); } catch (e) { next(e); }
}
export async function deletePoste(req: AuthRequest, res: Response, next: NextFunction) {
  try { res.json(ok(await svc.deletePoste(req.params.id), 'Poste supprimé')); } catch (e) { next(e); }
}

export async function listEmployes(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { search, statut, page, limit } = req.query as Record<string, string>;
    res.json(ok(await svc.listEmployes({ search, statut, page: page ? parseInt(page) : 1, limit: limit ? parseInt(limit) : 50 })));
  } catch (e) { next(e); }
}
export async function createEmploye(req: AuthRequest, res: Response, next: NextFunction) {
  try { res.status(201).json(ok(await svc.createEmploye(req.body, req.user!.userId), 'Employé créé')); } catch (e) { next(e); }
}
export async function updateEmploye(req: AuthRequest, res: Response, next: NextFunction) {
  try { res.json(ok(await svc.updateEmploye(req.params.id, req.body, req.user!.userId), 'Employé mis à jour')); } catch (e) { next(e); }
}

export async function listContrats(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { employeId, statut, page, limit } = req.query as Record<string, string>;
    res.json(ok(await svc.listContrats({ employeId, statut, page: page ? parseInt(page) : 1, limit: limit ? parseInt(limit) : 50 })));
  } catch (e) { next(e); }
}
export async function createContrat(req: AuthRequest, res: Response, next: NextFunction) {
  try { res.status(201).json(ok(await svc.createContrat(req.body, req.user!.userId), 'Contrat créé')); } catch (e) { next(e); }
}
export async function resilierContrat(req: AuthRequest, res: Response, next: NextFunction) {
  try { res.json(ok(await svc.resilierContrat(req.params.id, req.user!.userId), 'Contrat résilié')); } catch (e) { next(e); }
}

export async function listConges(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { employeId, statut, page, limit } = req.query as Record<string, string>;
    res.json(ok(await svc.listConges({ employeId, statut, page: page ? parseInt(page) : 1, limit: limit ? parseInt(limit) : 50 })));
  } catch (e) { next(e); }
}
export async function createConge(req: AuthRequest, res: Response, next: NextFunction) {
  try { res.status(201).json(ok(await svc.createConge(req.body, req.user!.userId), 'Demande soumise')); } catch (e) { next(e); }
}
export async function updateStatutConge(req: AuthRequest, res: Response, next: NextFunction) {
  try { res.json(ok(await svc.updateStatutConge(req.params.id, req.body.statut, req.user!.userId))); } catch (e) { next(e); }
}

export async function listFichesPaie(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { periode, employeId, page, limit } = req.query as Record<string, string>;
    res.json(ok(await svc.listFichesPaie({ periode, employeId, page: page ? parseInt(page) : 1, limit: limit ? parseInt(limit) : 50 })));
  } catch (e) { next(e); }
}
export async function genererFichesPaie(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await svc.genererFichesPaie(req.body.periode, req.user!.userId);
    res.json(ok(result, `${result.crees} fiche(s) générée(s)`));
  } catch (e) { next(e); }
}

export async function payerSalaires(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await svc.payerSalaires(req.body.periode, req.user!.userId);
    res.json(ok(result, `${result.payes} salaire(s) traité(s)`));
  } catch (e) { next(e); }
}

export async function validerFiche(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await svc.validerFiche(req.params.id, req.user!.userId);
    res.json(ok(result, 'Fiche validée'));
  } catch (e) { next(e); }
}

export async function creerAvance(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await svc.creerAvance(req.body, req.user!.userId);
    res.status(201).json(ok(result, 'Avance créée'));
  } catch (e) { next(e); }
}

export async function listAvances(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { employeId, periode, statut } = req.query as any;
    res.json(ok(await svc.listAvances({ employeId, periode, statut })));
  } catch (e) { next(e); }
}

export async function annulerAvance(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await svc.annulerAvance(req.params.id, req.user!.userId);
    res.json(ok(null, 'Avance annulée'));
  } catch (e) { next(e); }
}

export async function listElementsVariables(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = await svc.listElementsVariables({ employeId: req.query.employeId as string, periode: req.query.periode as string });
    res.json(ok(data));
  } catch (e) { next(e); }
}

export async function createElementVariable(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const element = await svc.createElementVariable(req.body, req.user!.userId);
    res.status(201).json(ok(element, 'Élément variable créé'));
  } catch (e) { next(e); }
}

export async function deleteElementVariable(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await svc.deleteElementVariable(req.params.id, req.user!.userId);
    res.json(ok(null, 'Élément supprimé'));
  } catch (e) { next(e); }
}
