import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { AppError } from '../types';
import { sendError } from '../utils/response';

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction): void {
  if (err instanceof AppError) {
    sendError(res, err.message, err.statusCode, err.errors);
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      sendError(res, "Valeur déjà existante (contrainte d'unicité)", 409);
      return;
    }
    if (err.code === 'P2025') {
      sendError(res, 'Enregistrement introuvable', 404);
      return;
    }
  }

  console.error('[Error]', err);
  sendError(res, 'Erreur serveur interne', 500);
}
