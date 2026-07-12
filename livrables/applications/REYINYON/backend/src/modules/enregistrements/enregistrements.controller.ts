import { Request, Response } from 'express';
import * as service from './enregistrements.service';
import { sendSuccess } from '../../utils/response';

export async function demarrer(req: Request, res: Response) {
  const enregistrement = await service.demarrer(req.reunion!.id, req.reunion!.livekitRoomName);
  sendSuccess(res, enregistrement, 'Enregistrement démarré', 201);
}

export async function arreter(req: Request, res: Response) {
  const enregistrement = await service.arreter(req.reunion!.id);
  sendSuccess(res, enregistrement, 'Enregistrement arrêté');
}

export async function lister(req: Request, res: Response) {
  const liste = await service.lister(req.reunion!.id);
  sendSuccess(res, liste);
}

export async function enCours(req: Request, res: Response) {
  const enregistrement = await service.obtenirEnCours(req.reunion!.id);
  sendSuccess(res, enregistrement);
}
