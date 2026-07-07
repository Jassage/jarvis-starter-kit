import { Response } from 'express';
import * as storefrontService from './storefront.service';
import { sendSuccess } from '../../utils/response';
import { AuthRequest } from '../../types';

export async function getBoutique(req: AuthRequest, res: Response) {
  const boutique = await storefrontService.getPublicBoutique(req.params.slug);
  sendSuccess(res, { boutique });
}

export async function listProducts(req: AuthRequest, res: Response) {
  const products = await storefrontService.listPublicProducts(req.params.slug, {
    categoryId: req.query.categoryId as string | undefined,
    q: req.query.q as string | undefined,
  });
  sendSuccess(res, { products });
}

export async function getProduct(req: AuthRequest, res: Response) {
  const product = await storefrontService.getPublicProduct(req.params.slug, req.params.productSlug);
  sendSuccess(res, { product });
}

export async function listCategories(req: AuthRequest, res: Response) {
  const categories = await storefrontService.listPublicCategories(req.params.slug);
  sendSuccess(res, { categories });
}
