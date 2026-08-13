import { Response } from 'express';
import * as achatService from './achat.service';
import { sendSuccess } from '../../utils/response';
import { AuthRequest } from '../../types';
import { asyncHandler } from '../../utils/asyncHandler';
import { logAudit } from '../../utils/audit';

export const creer = asyncHandler(async (req: AuthRequest, res: Response) => {
  const commande = await achatService.creer({
    pharmacieId: req.user!.pharmacieId,
    creeParId: req.user!.userId,
    ...req.body,
  });
  await logAudit({ req, action: 'CREATION_COMMANDE_ACHAT', entite: 'CommandeAchat', entiteId: commande.id });
  sendSuccess(res, commande, 'Commande créée', 201);
});

export const list = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { limit, statut, fournisseurId } = req.query as { limit: unknown; statut?: string; fournisseurId?: string };
  sendSuccess(res, await achatService.list(req.user!.pharmacieId, { limit: Number(limit), statut, fournisseurId }));
});

export const getById = asyncHandler(async (req: AuthRequest, res: Response) => {
  sendSuccess(res, await achatService.getById(req.user!.pharmacieId, req.params.id));
});

export const envoyer = asyncHandler(async (req: AuthRequest, res: Response) => {
  const commande = await achatService.envoyer(req.user!.pharmacieId, req.params.id);
  await logAudit({ req, action: 'ENVOI_COMMANDE_ACHAT', entite: 'CommandeAchat', entiteId: commande.id });
  sendSuccess(res, commande, 'Commande envoyée au fournisseur');
});

export const annuler = asyncHandler(async (req: AuthRequest, res: Response) => {
  const commande = await achatService.annuler(req.user!.pharmacieId, req.params.id);
  await logAudit({ req, action: 'ANNULATION_COMMANDE_ACHAT', entite: 'CommandeAchat', entiteId: commande.id });
  sendSuccess(res, commande, 'Commande annulée');
});

export const recevoir = asyncHandler(async (req: AuthRequest, res: Response) => {
  const commande = await achatService.recevoir(req.user!.pharmacieId, req.params.id, req.user!.userId, req.body.lignes);
  await logAudit({ req, action: 'RECEPTION_COMMANDE_ACHAT', entite: 'CommandeAchat', entiteId: commande.id, details: { lignes: req.body.lignes.length } });
  sendSuccess(res, commande, 'Réception enregistrée');
});
