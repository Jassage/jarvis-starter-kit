import { Request, Response } from 'express';
import * as service from './audience.service';
import { sendSuccess } from '../../utils/response';

export async function ping(req: Request, res: Response) {
  const { sessionKey, source, creneauId, replayId } = req.body as {
    sessionKey: string;
    source?: 'WEB' | 'MOBILE';
    creneauId?: string | null;
    replayId?: string | null;
  };
  const resultat = await service.enregistrerPing({ sessionKey, source, creneauId, replayId });
  sendSuccess(res, resultat);
}

// Déclenchement manuel de la génération des preuves de diffusion, en complément de la
// synchronisation paresseuse faite à l'ouverture des rapports et du moniteur.
export async function synchroniser(_req: Request, res: Response) {
  const crees = await service.synchroniserDiffusionLogs();
  const purgees = await service.purgerAnciennesSessions();
  sendSuccess(res, { diffusionLogsCrees: crees, sessionsPurgees: purgees }, 'Preuves de diffusion à jour');
}

export async function direct(_req: Request, res: Response) {
  const audience = await service.getAudienceDirect();
  sendSuccess(res, { audience });
}
