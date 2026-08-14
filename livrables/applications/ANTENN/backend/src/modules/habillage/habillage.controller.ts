import { Request, Response } from 'express';
import * as service from './habillage.service';
import { sendSuccess } from '../../utils/response';
import { logAudit } from '../audit/audit.service';

export async function listIncrustations(req: Request, res: Response) {
  const { creneauId, matchId } = req.query as { creneauId?: string; matchId?: string };
  const incrustations = await service.listIncrustations(creneauId, matchId);
  sendSuccess(res, { incrustations });
}

export async function createIncrustation(req: Request, res: Response) {
  const incrustation = await service.createIncrustation(req.body);
  await logAudit(req, 'HABILLAGE_CREE', {
    cible: 'IncrustationLogo',
    cibleId: incrustation.id,
    details: `Incrustation logo posée sur ${incrustation.creneauId ? `le créneau ${incrustation.creneauId}` : `le match ${incrustation.matchId}`}`,
  });
  sendSuccess(res, { incrustation }, 'Incrustation créée', 201);
}

export async function removeIncrustation(req: Request, res: Response) {
  await service.deleteIncrustation(req.params.id);
  // Tracé après coup mais avant la réponse : une exposition sponsor retirée doit
  // toujours pouvoir être rattachée à quelqu'un.
  await logAudit(req, 'HABILLAGE_SUPPRIME', {
    cible: 'IncrustationLogo',
    cibleId: req.params.id,
    details: 'Incrustation logo retirée',
  });
  sendSuccess(res, null, 'Incrustation supprimée');
}

export async function listBandeaux(req: Request, res: Response) {
  const { creneauId, matchId } = req.query as { creneauId?: string; matchId?: string };
  const bandeaux = await service.listBandeaux(creneauId, matchId);
  sendSuccess(res, { bandeaux });
}

export async function createBandeau(req: Request, res: Response) {
  const bandeau = await service.createBandeau(req.body);
  await logAudit(req, 'HABILLAGE_CREE', {
    cible: 'BandeauSponsor',
    cibleId: bandeau.id,
    details: `Bandeau sponsor posé sur ${bandeau.creneauId ? `le créneau ${bandeau.creneauId}` : `le match ${bandeau.matchId}`}`,
  });
  sendSuccess(res, { bandeau }, 'Bandeau créé', 201);
}

export async function removeBandeau(req: Request, res: Response) {
  await service.deleteBandeau(req.params.id);
  await logAudit(req, 'HABILLAGE_SUPPRIME', {
    cible: 'BandeauSponsor',
    cibleId: req.params.id,
    details: 'Bandeau sponsor retiré',
  });
  sendSuccess(res, null, 'Bandeau supprimé');
}
