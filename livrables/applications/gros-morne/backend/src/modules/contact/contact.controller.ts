import { Response } from 'express';
import { StatutMessage } from '@prisma/client';
import * as service from './contact.service';
import { sendSuccess } from '../../utils/response';
import { AuthRequest } from '../../types';

export async function create(req: AuthRequest, res: Response) {
  await service.create(req.body);
  sendSuccess(res, null, 'Message envoyé, nous vous répondrons dans les meilleurs délais', 201);
}

export async function list(req: AuthRequest, res: Response) {
  const statut = req.query.statut as StatutMessage | undefined;
  const messages = await service.list(statut);
  sendSuccess(res, { messages });
}

export async function updateStatut(req: AuthRequest, res: Response) {
  const message = await service.updateStatut(req.params.id, req.body.statut);
  sendSuccess(res, { message }, 'Statut mis à jour');
}

export async function remove(req: AuthRequest, res: Response) {
  await service.remove(req.params.id);
  sendSuccess(res, null, 'Message supprimé');
}
