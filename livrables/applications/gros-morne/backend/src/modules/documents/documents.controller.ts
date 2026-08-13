import { Response } from 'express';
import * as service from './documents.service';
import { sendSuccess } from '../../utils/response';
import { AuthRequest } from '../../types';

export async function listPublique(_req: AuthRequest, res: Response) {
  const documents = await service.listPublique();
  sendSuccess(res, { documents });
}

export async function listAdmin(_req: AuthRequest, res: Response) {
  const documents = await service.listAdmin();
  sendSuccess(res, { documents });
}

export async function create(req: AuthRequest, res: Response) {
  const document = await service.create(req.body);
  sendSuccess(res, { document }, 'Document ajouté', 201);
}

export async function update(req: AuthRequest, res: Response) {
  const document = await service.update(req.params.id, req.body);
  sendSuccess(res, { document }, 'Document mis à jour');
}

export async function remove(req: AuthRequest, res: Response) {
  await service.remove(req.params.id);
  sendSuccess(res, null, 'Document supprimé');
}
