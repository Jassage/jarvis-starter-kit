import { Response } from 'express';
import * as clientService from './client.service';
import { sendSuccess } from '../../utils/response';
import { AuthRequest } from '../../types';
import { asyncHandler } from '../../utils/asyncHandler';
import { logAudit } from '../../utils/audit';

export const list = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { recherche } = req.query as { recherche?: string };
  sendSuccess(res, await clientService.list(req.user!.pharmacieId, recherche));
});

export const getById = asyncHandler(async (req: AuthRequest, res: Response) => {
  sendSuccess(res, await clientService.getById(req.user!.pharmacieId, req.params.id));
});

export const create = asyncHandler(async (req: AuthRequest, res: Response) => {
  const client = await clientService.create(req.user!.pharmacieId, req.body);
  await logAudit({ req, action: 'CREATION', entite: 'Client', entiteId: client.id });
  sendSuccess(res, client, 'Client créé', 201);
});

export const update = asyncHandler(async (req: AuthRequest, res: Response) => {
  const client = await clientService.update(req.user!.pharmacieId, req.params.id, req.body);
  await logAudit({ req, action: 'MODIFICATION', entite: 'Client', entiteId: client.id });
  sendSuccess(res, client, 'Client mis à jour');
});
