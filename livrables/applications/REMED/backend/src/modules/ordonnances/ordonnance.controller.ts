import { Response } from 'express';
import * as ordonnanceService from './ordonnance.service';
import { sendSuccess } from '../../utils/response';
import { AppError, AuthRequest } from '../../types';
import { asyncHandler } from '../../utils/asyncHandler';
import { logAudit } from '../../utils/audit';

export const creer = asyncHandler(async (req: AuthRequest, res: Response) => {
  const ordonnance = await ordonnanceService.creer({ pharmacieId: req.user!.pharmacieId, ...req.body });
  await logAudit({ req, action: 'CREATION_ORDONNANCE', entite: 'Ordonnance', entiteId: ordonnance.id });
  sendSuccess(res, ordonnance, 'Ordonnance enregistrée', 201);
});

export const list = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { limit, statut } = req.query as { limit: unknown; statut?: string };
  sendSuccess(res, await ordonnanceService.list(req.user!.pharmacieId, { limit: Number(limit), statut }));
});

export const listDisponibles = asyncHandler(async (req: AuthRequest, res: Response) => {
  sendSuccess(res, await ordonnanceService.listDisponibles(req.user!.pharmacieId));
});

export const getById = asyncHandler(async (req: AuthRequest, res: Response) => {
  sendSuccess(res, await ordonnanceService.getById(req.user!.pharmacieId, req.params.id));
});

export const annuler = asyncHandler(async (req: AuthRequest, res: Response) => {
  const ordonnance = await ordonnanceService.annuler(req.user!.pharmacieId, req.params.id);
  await logAudit({ req, action: 'ANNULATION_ORDONNANCE', entite: 'Ordonnance', entiteId: ordonnance.id });
  sendSuccess(res, ordonnance, 'Ordonnance annulée');
});

export const uploaderPieceJointe = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.file) throw new AppError(400, 'Aucun fichier reçu');
  const url = `/uploads/ordonnances/${req.file.filename}`;
  const ordonnance = await ordonnanceService.attacherPieceJointe(req.user!.pharmacieId, req.params.id, url);
  await logAudit({ req, action: 'AJOUT_PIECE_JOINTE_ORDONNANCE', entite: 'Ordonnance', entiteId: ordonnance.id });
  sendSuccess(res, ordonnance, 'Pièce jointe ajoutée');
});
