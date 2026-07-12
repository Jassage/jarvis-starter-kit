import { Request, Response, NextFunction } from 'express';
import prisma from '../../config/database';
import { AppError } from '../../middlewares/errorHandler.middleware';

// Contrôles hôte ciblant un participant (:participantId) — la réunion n'est
// pas dans l'URL ici, donc on la retrouve via le participant plutôt que via
// resolveReunion classique, puis on applique la même règle que requireHote :
// hoteId de LA réunion de ce participant, jamais un rôle global.
export async function requireHoteDuParticipant(req: Request, _res: Response, next: NextFunction) {
  if (!req.user) return next(new AppError('Non authentifié', 401));

  const participant = await prisma.participant.findUnique({
    where: { id: req.params.participantId },
    include: { reunion: true },
  });
  if (!participant) return next(new AppError('Participant introuvable', 404));
  if (participant.reunion.hoteId !== req.user.id) {
    return next(new AppError("Seul l'hôte peut effectuer cette action", 403));
  }

  req.reunion = participant.reunion;
  next();
}
