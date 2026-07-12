import { Request, Response } from 'express';
import * as service from './reunions.service';
import { sendSuccess } from '../../utils/response';
import { telephonyProvider } from '../../integrations/telephony';

export async function creer(req: Request, res: Response) {
  const reunion = await service.creerReunion(req.user!.id, req.body);
  sendSuccess(res, reunion, 'Réunion créée', 201);
}

export async function mesReunions(req: Request, res: Response) {
  const reunions = await service.listerMesReunions(req.user!.id);
  sendSuccess(res, reunions);
}

export async function vuePublique(req: Request, res: Response) {
  const vue = await service.obtenirVuePublique(req.params.codeReunion);
  sendSuccess(res, vue);
}

export async function detailHote(req: Request, res: Response) {
  const detail = await service.obtenirDetailHote(req.reunion!.id);
  sendSuccess(res, { ...detail, numeroDialIn: telephonyProvider.obtenirNumeroDialIn() });
}

export async function verrouiller(req: Request, res: Response) {
  const reunion = await service.basculerVerrouillage(req.reunion!.id, req.body.verrouillee);
  sendSuccess(res, reunion, req.body.verrouillee ? 'Réunion verrouillée' : 'Réunion déverrouillée');
}

export async function demarrer(req: Request, res: Response) {
  const reunion = await service.demarrerReunion(req.reunion!.id);
  sendSuccess(res, reunion, 'Réunion démarrée');
}

export async function terminer(req: Request, res: Response) {
  await service.terminerReunion(req.reunion!.id, req.reunion!.livekitRoomName);
  sendSuccess(res, null, 'Réunion terminée');
}
