import { Request, Response } from 'express';
import * as service from './avis.service';
import { sendSuccess } from '../../utils/response';

export async function soumettreAvis(req: Request, res: Response) {
  const avis = await service.soumettreAvis(req.body);
  sendSuccess(res, { avis }, 'Merci pour votre avis', 201);
}

export async function listAvisGestion(req: Request, res: Response) {
  const avis = await service.listAvisGestion(req.etablissementId);
  sendSuccess(res, { avis });
}

export async function modererAvis(req: Request, res: Response) {
  const avis = await service.modererAvis(req.params.id, req.etablissementId, req.body);
  sendSuccess(res, { avis }, 'Avis mis à jour');
}
