import { Response, NextFunction } from 'express';
import { AuthRequest, ok } from '../types';
import * as compteService from '../services/compte.service';

export async function list(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { clientId, agenceId, type, statut, devise, search, page, limit } = req.query as Record<string, string>;
    const result = await compteService.listComptes({
      clientId, agenceId, type: type as any, statut: statut as any, devise: devise as any,
      search,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    });
    res.json(ok(result));
  } catch (e) { next(e); }
}

export async function getOne(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const compte = await compteService.getCompte(req.params.id);
    res.json(ok(compte));
  } catch (e) { next(e); }
}

export async function create(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const compte = await compteService.createCompte(req.body, req.user!.userId);
    res.status(201).json(ok(compte, 'Compte créé avec succès'));
  } catch (e) { next(e); }
}

export async function update(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const compte = await compteService.updateCompte(req.params.id, req.body, req.user!.userId);
    res.json(ok(compte));
  } catch (e) { next(e); }
}

export async function changeStatut(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const compte = await compteService.changeStatutCompte(req.params.id, req.body.statut, req.user!.userId);
    res.json(ok(compte));
  } catch (e) { next(e); }
}

export async function cloturer(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const compte = await compteService.cloturerCompte(req.params.id, req.user!.userId);
    res.json(ok(compte, 'Compte clôturé avec succès'));
  } catch (e) { next(e); }
}

export async function getReleve(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { from, to, page, limit } = req.query as Record<string, string>;
    const result = await compteService.getReleveCompte(req.params.id, {
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 50,
    });
    res.json(ok(result));
  } catch (e) { next(e); }
}
