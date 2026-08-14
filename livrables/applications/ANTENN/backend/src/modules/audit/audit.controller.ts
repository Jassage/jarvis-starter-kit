import { Request, Response } from 'express';
import * as service from './audit.service';
import { sendSuccess } from '../../utils/response';
import { ActionAudit } from '@prisma/client';

export async function list(req: Request, res: Response) {
  const { action, from, to, page, limit } = req.query as {
    action?: ActionAudit;
    from?: string;
    to?: string;
    page?: number;
    limit?: number;
  };
  const resultat = await service.listAudit({ action, from, to, page, limit });
  sendSuccess(res, resultat);
}
