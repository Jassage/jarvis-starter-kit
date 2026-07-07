import { Request, Response } from 'express';
import * as marketplaceService from './marketplace.service';
import { sendSuccess } from '../../utils/response';
import { Department } from '@prisma/client';

export async function listProducts(req: Request, res: Response) {
  const { q, department, page, limit } = req.query as Record<string, string | undefined>;
  const result = await marketplaceService.listMarketplaceProducts({
    q,
    department: department && department in Department ? (department as Department) : undefined,
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
  });
  sendSuccess(res, result);
}

export async function listBoutiques(_req: Request, res: Response) {
  const boutiques = await marketplaceService.listMarketplaceBoutiques();
  sendSuccess(res, { boutiques });
}
