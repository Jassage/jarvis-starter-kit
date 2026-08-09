import { Response, NextFunction } from 'express';
import { AuthRequest, ok } from '../types';
import * as venteService from '../services/vente.service';
import * as factureService from '../services/facture.service';

export async function list(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { emplacementId, statut, dateFrom, dateTo } = req.query;
    const ventes = await venteService.listVentes({
      emplacementId: emplacementId as string | undefined,
      statut: statut as string | undefined,
      dateFrom: dateFrom as string | undefined,
      dateTo: dateTo as string | undefined,
    });
    res.json(ok(ventes));
  } catch (e) { next(e); }
}

export async function getOne(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const vente = await venteService.getVente(req.params.id, req.user);
    res.json(ok(vente));
  } catch (e) { next(e); }
}

export async function create(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const vente = await venteService.createVente(req.body, req.user!.userId);
    res.status(201).json(ok(vente, 'Vente enregistrée'));
  } catch (e) { next(e); }
}

export async function cancel(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await venteService.cancelVente(req.params.id, req.user!.userId, req.user);
    res.json(ok(null, 'Vente annulée'));
  } catch (e) { next(e); }
}

export async function facture(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { buffer, numero } = await factureService.genererFacturePDF(req.params.id, req.user);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="facture-${numero}.pdf"`);
    res.send(buffer);
  } catch (e) { next(e); }
}
