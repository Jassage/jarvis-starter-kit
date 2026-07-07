import { Response } from 'express';
import * as adminService from './admin.service';
import * as paymentsService from '../payments/payments.service';
import { sendSuccess } from '../../utils/response';
import { AuthRequest } from '../../types';
import { logAudit } from '../../utils/audit';

export async function listBoutiques(_req: AuthRequest, res: Response) {
  const boutiques = await adminService.listBoutiques();
  sendSuccess(res, { boutiques });
}

export async function updateBoutiqueStatus(req: AuthRequest, res: Response) {
  const boutique = await adminService.updateBoutiqueStatus(req.params.id, req.body.status);
  await logAudit({
    req,
    action: 'BOUTIQUE_STATUT_MIS_A_JOUR',
    entite: 'Boutique',
    entiteId: boutique.id,
    boutiqueId: boutique.id,
    changes: { status: boutique.status },
  });
  sendSuccess(res, { boutique }, 'Statut de la boutique mis à jour');
}

export async function getStats(_req: AuthRequest, res: Response) {
  const stats = await adminService.getPlatformStats();
  sendSuccess(res, stats);
}

export async function listPendingPayments(_req: AuthRequest, res: Response) {
  const payments = await paymentsService.listPendingProofs();
  sendSuccess(res, { payments });
}

export async function approvePayment(req: AuthRequest, res: Response) {
  const activated = await paymentsService.activatePayment(req.params.id, `MANUAL-${req.user!.userId}`);
  await logAudit({ req, action: 'PAIEMENT_VALIDE', entite: 'Payment', entiteId: req.params.id });
  sendSuccess(res, { activated }, activated ? 'Paiement validé' : 'Paiement déjà traité');
}

export async function rejectPayment(req: AuthRequest, res: Response) {
  const payment = await paymentsService.rejectPayment(req.params.id, req.body.reason);
  await logAudit({ req, action: 'PAIEMENT_REJETE', entite: 'Payment', entiteId: payment.id });
  sendSuccess(res, { payment }, 'Paiement rejeté');
}
