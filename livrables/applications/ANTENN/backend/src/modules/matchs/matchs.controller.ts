import { Request, Response } from 'express';
import * as service from './matchs.service';
import { sendSuccess } from '../../utils/response';

export async function list(_req: Request, res: Response) {
  const matchs = await service.listMatchs();
  sendSuccess(res, { matchs });
}

export async function getOne(req: Request, res: Response) {
  const match = await service.getMatch(req.params.id);
  sendSuccess(res, { match });
}

export async function create(req: Request, res: Response) {
  const match = await service.createMatch(req.body);
  sendSuccess(res, { match }, 'Match créé', 201);
}

export async function update(req: Request, res: Response) {
  const match = await service.updateMatch(req.params.id, req.body);
  sendSuccess(res, { match }, 'Match mis à jour');
}

export async function demarrer(req: Request, res: Response) {
  const match = await service.demarrerDirect(req.params.id);
  sendSuccess(res, { match }, 'Direct démarré');
}

export async function terminer(req: Request, res: Response) {
  const match = await service.terminerDirect(req.params.id);
  sendSuccess(res, { match }, 'Direct terminé');
}
