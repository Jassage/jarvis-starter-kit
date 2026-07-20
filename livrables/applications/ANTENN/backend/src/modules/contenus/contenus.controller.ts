import { Request, Response } from 'express';
import * as service from './contenus.service';
import { sendSuccess } from '../../utils/response';

export async function list(_req: Request, res: Response) {
  const contenus = await service.listContenus();
  sendSuccess(res, { contenus });
}

export async function getOne(req: Request, res: Response) {
  const contenu = await service.getContenu(req.params.id);
  sendSuccess(res, { contenu });
}

export async function create(req: Request, res: Response) {
  const contenu = await service.createContenu(req.body);
  sendSuccess(res, { contenu }, 'Contenu créé', 201);
}

export async function update(req: Request, res: Response) {
  const contenu = await service.updateContenu(req.params.id, req.body);
  sendSuccess(res, { contenu }, 'Contenu mis à jour');
}

export async function remove(req: Request, res: Response) {
  await service.deleteContenu(req.params.id);
  sendSuccess(res, null, 'Contenu supprimé');
}

export async function definirRepli(req: Request, res: Response) {
  const contenu = await service.definirContenuDeRepli(req.params.id);
  sendSuccess(res, { contenu }, 'Contenu défini comme repli d\'antenne');
}

export async function retirerRepli(req: Request, res: Response) {
  const contenu = await service.retirerContenuDeRepli(req.params.id);
  sendSuccess(res, { contenu }, 'Contenu retiré du repli d\'antenne');
}
