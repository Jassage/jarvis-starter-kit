import { Request, Response } from 'express';
import * as service from './factures.service';
import { sendSuccess } from '../../utils/response';

export async function getFacture(req: Request, res: Response) {
  const facture = await service.getFactureParReservation(req.params.reservationId, req.etablissementId);
  sendSuccess(res, { facture });
}

export async function enregistrerPaiement(req: Request, res: Response) {
  const facture = await service.enregistrerPaiement(req.params.factureId, req.etablissementId, {
    ...req.body,
    employeId: req.employe?.id,
  });
  sendSuccess(res, { facture }, 'Paiement enregistré');
}
