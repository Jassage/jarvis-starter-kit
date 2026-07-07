import { Response } from 'express';
import * as ordersService from './orders.service';
import { sendSuccess } from '../../utils/response';
import { AuthRequest, AppError } from '../../types';

const CART_COOKIE = 'shopay_cart_sid';

export async function checkout(req: AuthRequest, res: Response) {
  const sessionId = req.cookies?.[CART_COOKIE];
  if (!sessionId) throw new AppError('Le panier est vide', 400);
  const order = await ordersService.checkout(req.params.slug, sessionId, req.body);
  sendSuccess(res, { order }, 'Commande créée, procédez au paiement', 201);
}

export async function lookup(req: AuthRequest, res: Response) {
  const { orderNumber, email } = req.query as { orderNumber?: string; email?: string };
  if (!orderNumber || !email) throw new AppError('orderNumber et email requis', 400);
  const order = await ordersService.lookupOrder(req.params.slug, orderNumber, email);
  sendSuccess(res, { order });
}
