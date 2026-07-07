import { Response } from 'express';
import crypto from 'crypto';
import * as cartService from './cart.service';
import { sendSuccess } from '../../utils/response';
import { AuthRequest } from '../../types';
import { env } from '../../config/env';

const CART_COOKIE = 'shopay_cart_sid';

function resolveSessionId(req: AuthRequest, res: Response): string {
  let sessionId = req.cookies?.[CART_COOKIE];
  if (!sessionId) {
    sessionId = crypto.randomBytes(16).toString('hex');
    res.cookie(CART_COOKIE, sessionId, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
  }
  return sessionId;
}

export async function getCart(req: AuthRequest, res: Response) {
  const sessionId = resolveSessionId(req, res);
  const cart = await cartService.getCart(req.params.slug, sessionId);
  sendSuccess(res, { cart });
}

export async function addItem(req: AuthRequest, res: Response) {
  const sessionId = resolveSessionId(req, res);
  const { productId, variantId, quantity } = req.body;
  const cart = await cartService.addItem(req.params.slug, sessionId, productId, variantId, quantity ?? 1);
  sendSuccess(res, { cart }, 'Article ajouté au panier', 201);
}

export async function updateItem(req: AuthRequest, res: Response) {
  const sessionId = resolveSessionId(req, res);
  const cart = await cartService.updateItem(req.params.slug, sessionId, req.params.itemId, req.body.quantity);
  sendSuccess(res, { cart }, 'Panier mis à jour');
}

export async function removeItem(req: AuthRequest, res: Response) {
  const sessionId = resolveSessionId(req, res);
  const cart = await cartService.removeItem(req.params.slug, sessionId, req.params.itemId);
  sendSuccess(res, { cart }, 'Article retiré du panier');
}
