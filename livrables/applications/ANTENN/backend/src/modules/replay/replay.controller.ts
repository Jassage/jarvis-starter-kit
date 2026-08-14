import { Request, Response } from 'express';
import path from 'path';
import * as service from './replay.service';
import { sendSuccess } from '../../utils/response';
import { AppError } from '../../middlewares/errorHandler.middleware';
import { logAudit } from '../audit/audit.service';
import { env } from '../../config/env';

// ── Public ──────────────────────────────────────────────

export async function catalogue(req: Request, res: Response) {
  const { q, type, page, limit } = req.query as {
    q?: string;
    type?: 'MATCH' | 'PROGRAMME';
    page?: number;
    limit?: number;
  };
  const resultat = await service.getCatalogue({ q, type, page, limit });
  sendSuccess(res, resultat);
}

export async function detailPublic(req: Request, res: Response) {
  const detail = await service.getReplayPublic(req.params.id);
  sendSuccess(res, detail);
}

// ── Régie ───────────────────────────────────────────────

export async function listAdmin(_req: Request, res: Response) {
  const replays = await service.listReplaysAdmin();
  sendSuccess(res, { replays });
}

export async function creneauxReplayables(_req: Request, res: Response) {
  const creneaux = await service.listCreneauxReplayables();
  sendSuccess(res, { creneaux });
}

export async function getOne(req: Request, res: Response) {
  const replay = await service.getReplay(req.params.id);
  sendSuccess(res, { replay });
}

export async function create(req: Request, res: Response) {
  const replay = await service.createReplay(req.body);
  sendSuccess(res, { replay }, 'Replay créé', 201);
}

export async function createDepuisCreneau(req: Request, res: Response) {
  const replay = await service.createReplayDepuisCreneau(req.params.creneauId, req.body);
  sendSuccess(res, { replay }, 'Replay créé depuis la grille', 201);
}

export async function update(req: Request, res: Response) {
  const replay = await service.updateReplay(req.params.id, req.body);
  sendSuccess(res, { replay }, 'Replay mis à jour');
}

export async function uploadVignette(req: Request, res: Response) {
  if (!req.file) throw new AppError('Fichier vignette requis', 400);
  // URL absolue (même convention que les logos sponsors/chaîne), servie via /uploads.
  const vignetteUrl = `${env.PUBLIC_BACKEND_URL}/uploads/replay/${path.basename(req.file.path)}`;
  const replay = await service.updateVignette(req.params.id, vignetteUrl);
  sendSuccess(res, { replay }, 'Vignette mise à jour');
}

export async function publier(req: Request, res: Response) {
  const replay = await service.publierReplay(req.params.id);
  await logAudit(req, 'REPLAY_PUBLIE', {
    cible: 'Replay',
    cibleId: replay.id,
    details: `« ${replay.titre} » rendu public au catalogue`,
  });
  sendSuccess(res, { replay }, 'Replay publié');
}

export async function retirer(req: Request, res: Response) {
  const replay = await service.retirerReplay(req.params.id);
  await logAudit(req, 'REPLAY_RETIRE', {
    cible: 'Replay',
    cibleId: replay.id,
    details: `« ${replay.titre} » retiré du catalogue`,
  });
  sendSuccess(res, { replay }, 'Replay retiré du catalogue');
}

export async function remove(req: Request, res: Response) {
  const replay = await service.getReplay(req.params.id);
  await service.deleteReplay(req.params.id);
  await logAudit(req, 'REPLAY_SUPPRIME', {
    cible: 'Replay',
    cibleId: req.params.id,
    details: `« ${replay.titre} » supprimé définitivement (${replay.nombreVues} vues perdues)`,
  });
  sendSuccess(res, null, 'Replay supprimé');
}
