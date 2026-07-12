import { Request, Response } from 'express';
import * as service from './spa.service';
import { sendSuccess } from '../../utils/response';
import { AppError } from '../../middlewares/errorHandler.middleware';

function requireEtab(req: Request) {
  if (!req.etablissementId) throw new AppError('etablissementId requis', 400);
  return req.etablissementId;
}

export async function listServices(req: Request, res: Response) {
  const services = await service.listServices(requireEtab(req));
  sendSuccess(res, { services });
}

export async function creerService(req: Request, res: Response) {
  const item = await service.creerService(requireEtab(req), req.body);
  sendSuccess(res, { service: item }, 'Service créé');
}

export async function updateService(req: Request, res: Response) {
  const item = await service.updateService(req.params.id, requireEtab(req), req.body);
  sendSuccess(res, { service: item }, 'Service mis à jour');
}

export async function listPraticiens(req: Request, res: Response) {
  const praticiens = await service.listPraticiens(requireEtab(req));
  sendSuccess(res, { praticiens });
}

export async function creerPraticien(req: Request, res: Response) {
  const praticien = await service.creerPraticien(requireEtab(req), req.body);
  sendSuccess(res, { praticien }, 'Praticien créé');
}

export async function updatePraticien(req: Request, res: Response) {
  const praticien = await service.updatePraticien(req.params.id, requireEtab(req), req.body);
  sendSuccess(res, { praticien }, 'Praticien mis à jour');
}

export async function listRendezVous(req: Request, res: Response) {
  const date = req.query.date ? new Date(req.query.date as string) : undefined;
  const rendezVous = await service.listRendezVous(requireEtab(req), date);
  sendSuccess(res, { rendezVous });
}

export async function creerRendezVous(req: Request, res: Response) {
  const rendezVous = await service.creerRendezVous(requireEtab(req), req.body);
  sendSuccess(res, { rendezVous }, 'Rendez-vous créé');
}

export async function annulerRendezVous(req: Request, res: Response) {
  const rendezVous = await service.annulerRendezVous(req.params.id, requireEtab(req));
  sendSuccess(res, { rendezVous }, 'Rendez-vous annulé');
}

export async function terminerRendezVous(req: Request, res: Response) {
  const rendezVous = await service.terminerRendezVous(req.params.id, requireEtab(req), req.body, req.employe?.id);
  sendSuccess(res, { rendezVous }, 'Rendez-vous clôturé');
}
