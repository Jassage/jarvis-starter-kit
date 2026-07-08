import { Request, Response } from 'express';
import * as service from './habillage.service';
import { sendSuccess } from '../../utils/response';

export async function listIncrustations(req: Request, res: Response) {
  const { creneauId, matchId } = req.query as { creneauId?: string; matchId?: string };
  const incrustations = await service.listIncrustations(creneauId, matchId);
  sendSuccess(res, { incrustations });
}

export async function createIncrustation(req: Request, res: Response) {
  const incrustation = await service.createIncrustation(req.body);
  sendSuccess(res, { incrustation }, 'Incrustation créée', 201);
}

export async function removeIncrustation(req: Request, res: Response) {
  await service.deleteIncrustation(req.params.id);
  sendSuccess(res, null, 'Incrustation supprimée');
}

export async function listBandeaux(req: Request, res: Response) {
  const { creneauId, matchId } = req.query as { creneauId?: string; matchId?: string };
  const bandeaux = await service.listBandeaux(creneauId, matchId);
  sendSuccess(res, { bandeaux });
}

export async function createBandeau(req: Request, res: Response) {
  const bandeau = await service.createBandeau(req.body);
  sendSuccess(res, { bandeau }, 'Bandeau créé', 201);
}

export async function removeBandeau(req: Request, res: Response) {
  await service.deleteBandeau(req.params.id);
  sendSuccess(res, null, 'Bandeau supprimé');
}
