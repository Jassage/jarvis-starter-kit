import { Response } from 'express';
import * as venteService from './vente.service';
import { sendSuccess } from '../../utils/response';
import { AuthRequest } from '../../types';
import { asyncHandler } from '../../utils/asyncHandler';
import { logAudit } from '../../utils/audit';
import { genererFacture80mm } from '../../utils/facture.pdf';
import prisma from '../../config/database';

export const creer = asyncHandler(async (req: AuthRequest, res: Response) => {
  const vente = await venteService.creer({
    pharmacieId: req.user!.pharmacieId,
    caissierId: req.user!.userId,
    ...req.body,
  });
  await logAudit({ req, action: 'CREATION_VENTE', entite: 'Vente', entiteId: vente.id, details: { montantTotal: vente.montantTotal } });
  sendSuccess(res, vente, 'Vente enregistrée', 201);
});

export const list = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { limit, clientId, statut } = req.query as { limit: unknown; clientId?: string; statut?: string };
  sendSuccess(res, await venteService.list(req.user!.pharmacieId, { limit: Number(limit), clientId, statut }));
});

export const getById = asyncHandler(async (req: AuthRequest, res: Response) => {
  sendSuccess(res, await venteService.getById(req.user!.pharmacieId, req.params.id));
});

export const annuler = asyncHandler(async (req: AuthRequest, res: Response) => {
  const vente = await venteService.annuler(req.user!.pharmacieId, req.params.id, req.user!.userId, req.body.motif);
  await logAudit({ req, action: 'ANNULATION_VENTE', entite: 'Vente', entiteId: vente.id, details: { motif: req.body.motif } });
  sendSuccess(res, vente, 'Vente annulée');
});

// Facture/reçu imprimable au format thermique 80mm (demande explicite) — servi en inline pour
// s'ouvrir directement dans un nouvel onglet et pouvoir être imprimé depuis le navigateur.
export const facturePdf = asyncHandler(async (req: AuthRequest, res: Response) => {
  const vente = await venteService.getById(req.user!.pharmacieId, req.params.id);
  const pharmacie = await prisma.pharmacie.findUniqueOrThrow({ where: { id: req.user!.pharmacieId } });
  const buffer = await genererFacture80mm(vente, pharmacie);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${vente.numero}.pdf"`);
  res.send(buffer);
});
