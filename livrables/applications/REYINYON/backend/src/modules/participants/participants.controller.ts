import { Request, Response } from 'express';
import * as service from './participants.service';
import { sendSuccess } from '../../utils/response';

export async function rejoindre(req: Request, res: Response) {
  const resultat = await service.rejoindre(req.params.codeReunion, req.body, req.user);
  sendSuccess(res, resultat, resultat.enAttente ? "En attente d'admission par l'hôte" : 'Bienvenue dans la réunion');
}

export async function quitter(req: Request, res: Response) {
  const participant = await service.quitterVolontairement(req.params.participantId, req.body.reconnectToken);
  sendSuccess(res, participant, 'Départ enregistré');
}

export async function attente(req: Request, res: Response) {
  const liste = await service.listerEnAttente(req.reunion!.id);
  sendSuccess(res, liste);
}

export async function statutAttente(req: Request, res: Response) {
  const statut = await service.obtenirStatutAttente(req.params.participantId);
  sendSuccess(res, statut);
}

export async function admettre(req: Request, res: Response) {
  const resultat = await service.admettre(req.params.participantId);
  sendSuccess(res, resultat, 'Participant admis');
}

export async function rejeter(req: Request, res: Response) {
  const participant = await service.rejeter(req.params.participantId);
  sendSuccess(res, participant, 'Participant rejeté');
}

export async function couperMicro(req: Request, res: Response) {
  await service.couperMicro(req.params.participantId);
  sendSuccess(res, null, 'Micro coupé');
}

export async function couperCamera(req: Request, res: Response) {
  await service.couperCamera(req.params.participantId);
  sendSuccess(res, null, 'Caméra coupée');
}

export async function retirer(req: Request, res: Response) {
  const participant = await service.retirer(req.params.participantId);
  sendSuccess(res, participant, 'Participant retiré');
}
