import { Response, NextFunction } from 'express';
import { AuthRequest, ok } from '../types';
import * as pretService from '../services/pret.service';

export async function list(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { clientId, agenceId, statut, page, limit } = req.query as Record<string, string>;
    const result = await pretService.listPrets({
      clientId, agenceId, statut,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    });
    res.json(ok(result));
  } catch (e) { next(e); }
}

export async function getOne(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const pret = await pretService.getPret(req.params.id);
    res.json(ok(pret));
  } catch (e) { next(e); }
}

export async function create(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const pret = await pretService.creerPret({ ...req.body, userId: req.user!.userId });
    res.status(201).json(ok(pret, 'Demande de prêt créée'));
  } catch (e) { next(e); }
}

export async function approuver(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const pret = await pretService.approuverPret(req.params.id, req.user!.userId);
    res.json(ok(pret, 'Prêt approuvé'));
  } catch (e) { next(e); }
}

export async function rejeter(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const pret = await pretService.rejeterPret(req.params.id, req.user!.userId, req.body.notes);
    res.json(ok(pret, 'Prêt rejeté'));
  } catch (e) { next(e); }
}

export async function decaisser(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const pret = await pretService.decaisserPret({ ...req.body, pretId: req.params.id, userId: req.user!.userId });
    res.json(ok(pret, 'Prêt décaissé'));
  } catch (e) { next(e); }
}

export async function rembourser(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await pretService.enregistrerRemboursement({ ...req.body, pretId: req.params.id, userId: req.user!.userId });
    res.status(201).json(ok(result, 'Remboursement enregistré'));
  } catch (e) { next(e); }
}

export async function penalite(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = await pretService.calculerPenalite(req.params.id);
    res.json(ok(data));
  } catch (e) { next(e); }
}

export async function refreshRetards(_req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const updated = await pretService.mettreAJourRetards();
    res.json(ok({ updated }, `${updated} prêt(s) mis en retard`));
  } catch (e) { next(e); }
}
