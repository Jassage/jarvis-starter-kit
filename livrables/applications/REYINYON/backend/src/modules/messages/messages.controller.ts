import { Request, Response } from 'express';
import * as service from './messages.service';
import { sendSuccess } from '../../utils/response';
import { AppError } from '../../middlewares/errorHandler.middleware';

export async function envoyer(req: Request, res: Response) {
  const message = await service.envoyerMessage(
    req.params.codeReunion,
    req.body.participantId,
    req.body.reconnectToken,
    req.body.contenu
  );
  sendSuccess(res, message, 'Message envoyé', 201);
}

export async function envoyerMedia(req: Request, res: Response) {
  const { participantId, reconnectToken, type } = req.body as { participantId?: string; reconnectToken?: string; type?: string };
  if (!participantId || !reconnectToken) throw new AppError('Authentification participant requise', 401);
  if (type !== 'PHOTO' && type !== 'AUDIO') throw new AppError('Type de message invalide', 422);
  if (!req.file) throw new AppError('Aucun fichier reçu', 422);

  const message = await service.envoyerMessageMedia(req.params.codeReunion, participantId, reconnectToken, type, req.file.filename);
  sendSuccess(res, message, 'Message envoyé', 201);
}

export async function lister(req: Request, res: Response) {
  const { participantId, reconnectToken } = req.query as { participantId: string; reconnectToken: string };
  const messages = await service.historique(req.params.codeReunion, participantId, reconnectToken);
  sendSuccess(res, messages);
}
