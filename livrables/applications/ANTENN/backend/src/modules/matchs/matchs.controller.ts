import { Request, Response } from 'express';
import * as service from './matchs.service';
import { sendSuccess } from '../../utils/response';
import { logAudit } from '../audit/audit.service';

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
  await logAudit(req, 'MATCH_DEMARRE', {
    cible: 'Match',
    cibleId: match.id,
    details: `${match.nomEvenement} (${match.equipes}) passé en direct`,
  });
  sendSuccess(res, { match }, 'Direct démarré');
}

export async function terminer(req: Request, res: Response) {
  const match = await service.terminerDirect(req.params.id);
  await logAudit(req, 'MATCH_TERMINE', {
    cible: 'Match',
    cibleId: match.id,
    details: `${match.nomEvenement} (${match.equipes}) sorti d'antenne`,
  });
  sendSuccess(res, { match }, 'Direct terminé');
}
