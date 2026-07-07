import { Response } from 'express';
import * as ordersService from './orders.service';
import { sendSuccess } from '../../utils/response';
import { AuthRequest } from '../../types';
import { logAudit } from '../../utils/audit';

export async function list(req: AuthRequest, res: Response) {
  const orders = await ordersService.listOrders(req.boutiqueId!, req.query.status as string | undefined);
  sendSuccess(res, { orders });
}

export async function getOne(req: AuthRequest, res: Response) {
  const order = await ordersService.getOrder(req.boutiqueId!, req.params.id);
  sendSuccess(res, { order });
}

export async function updateStatus(req: AuthRequest, res: Response) {
  const order = await ordersService.updateOrderStatus(req.boutiqueId!, req.params.id, req.body.status);
  await logAudit({ req, action: 'COMMANDE_STATUT_MIS_A_JOUR', entite: 'Order', entiteId: order.id, changes: { status: order.status } });
  sendSuccess(res, { order }, 'Statut de la commande mis à jour');
}
