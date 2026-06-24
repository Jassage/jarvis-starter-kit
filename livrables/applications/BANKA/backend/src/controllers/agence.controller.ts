import { Response, NextFunction } from 'express';
import { AuthRequest, ok } from '../types';
import * as agenceService from '../services/agence.service';

export async function listAgences(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const agences = await agenceService.listAgences();
    res.json(ok(agences));
  } catch (e) { next(e); }
}

export async function getAgence(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const agence = await agenceService.getAgence(req.params.id);
    res.json(ok(agence));
  } catch (e) { next(e); }
}

export async function createAgence(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const agence = await agenceService.createAgence(req.body);
    res.status(201).json(ok(agence, 'Agence créée'));
  } catch (e) { next(e); }
}

export async function updateAgence(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const agence = await agenceService.updateAgence(req.params.id, req.body);
    res.json(ok(agence, 'Agence mise à jour'));
  } catch (e) { next(e); }
}
