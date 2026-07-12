import { Request, Response } from 'express';
import * as service from './etablissements.service';
import { sendSuccess } from '../../utils/response';

export async function list(req: Request, res: Response) {
  const actifOnly = req.query.actifOnly !== 'false';
  const etablissements = await service.listEtablissements(actifOnly);
  sendSuccess(res, { etablissements });
}

export async function getOne(req: Request, res: Response) {
  const etablissement = await service.getEtablissement(req.params.id);
  sendSuccess(res, { etablissement });
}

export async function create(req: Request, res: Response) {
  const etablissement = await service.createEtablissement(req.body);
  sendSuccess(res, { etablissement }, 'Établissement créé', 201);
}

export async function update(req: Request, res: Response) {
  const etablissement = await service.updateEtablissement(req.params.id, req.body);
  sendSuccess(res, { etablissement }, 'Établissement mis à jour');
}
