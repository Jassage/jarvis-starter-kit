import { Request, Response } from 'express';
import path from 'path';
import * as service from './sponsors.service';
import { sendSuccess } from '../../utils/response';
import { AppError } from '../../middlewares/errorHandler.middleware';
import { logAudit } from '../audit/audit.service';
import { env } from '../../config/env';

export async function list(_req: Request, res: Response) {
  const sponsors = await service.listSponsors();
  sendSuccess(res, { sponsors });
}

export async function getOne(req: Request, res: Response) {
  const sponsor = await service.getSponsor(req.params.id);
  sendSuccess(res, { sponsor });
}

export async function create(req: Request, res: Response) {
  const sponsor = await service.createSponsor(req.body);
  await logAudit(req, 'SPONSOR_CREE', {
    cible: 'Sponsor',
    cibleId: sponsor.id,
    details: `Contrat ${sponsor.typePackage} pour « ${sponsor.nomSponsor} » (${sponsor.dateDebutContrat.toISOString().slice(0, 10)} → ${sponsor.dateFinContrat.toISOString().slice(0, 10)})`,
  });
  sendSuccess(res, { sponsor }, 'Sponsor créé', 201);
}

export async function update(req: Request, res: Response) {
  const sponsor = await service.updateSponsor(req.params.id, req.body);
  await logAudit(req, 'SPONSOR_MODIFIE', {
    cible: 'Sponsor',
    cibleId: sponsor.id,
    details: `Contrat de « ${sponsor.nomSponsor} » modifié (${Object.keys(req.body).join(', ')})`,
  });
  sendSuccess(res, { sponsor }, 'Sponsor mis à jour');
}

export async function remove(req: Request, res: Response) {
  const sponsor = await service.getSponsor(req.params.id);
  await service.deleteSponsor(req.params.id);
  await logAudit(req, 'SPONSOR_SUPPRIME', {
    cible: 'Sponsor',
    cibleId: req.params.id,
    details: `Contrat de « ${sponsor.nomSponsor} » supprimé`,
  });
  sendSuccess(res, null, 'Sponsor supprimé');
}

export async function uploadLogo(req: Request, res: Response) {
  if (!req.file) throw new AppError('Fichier logo requis', 400);
  const logoUrl = `${env.PUBLIC_BACKEND_URL}/uploads/sponsors/${path.basename(req.file.path)}`;
  const sponsor = await service.updateLogo(req.params.id, logoUrl);
  sendSuccess(res, { sponsor }, 'Logo mis à jour');
}

export async function contratsExpirantBientot(_req: Request, res: Response) {
  const sponsors = await service.listContratsExpirantBientot();
  sendSuccess(res, { sponsors });
}
