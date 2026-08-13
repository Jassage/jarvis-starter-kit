import { Response } from 'express';
import * as contenuService from './contenu.service';
import { sendSuccess } from '../../utils/response';
import { AuthRequest } from '../../types';

export async function list(req: AuthRequest, res: Response) {
  const page = req.query.page as string;
  const sections = await contenuService.listByPage(page);
  sendSuccess(res, { sections });
}

export async function create(req: AuthRequest, res: Response) {
  const section = await contenuService.create(req.body);
  sendSuccess(res, { section }, 'Bloc de contenu créé', 201);
}

export async function update(req: AuthRequest, res: Response) {
  const section = await contenuService.update(req.params.id, req.body);
  sendSuccess(res, { section }, 'Bloc de contenu mis à jour');
}

export async function remove(req: AuthRequest, res: Response) {
  await contenuService.remove(req.params.id);
  sendSuccess(res, null, 'Bloc de contenu supprimé');
}
