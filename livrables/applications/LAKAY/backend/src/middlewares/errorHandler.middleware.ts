import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { sendError } from '../utils/response';
import logger from '../utils/logger';

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 400,
    public errors?: unknown[]
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  logger.error({ err, path: req.path, method: req.method }, 'Erreur non gérée');

  // Erreur métier explicite
  if (err instanceof AppError) {
    sendError(res, err.message, err.statusCode, err.errors);
    return;
  }

  // Erreur de validation Zod
  if (err instanceof ZodError) {
    sendError(res, 'Données invalides', 422, err.errors.map(e => ({
      field: e.path.join('.'),
      message: e.message,
    })));
    return;
  }

  // Erreur Prisma — contrainte unique
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const field = (err.meta?.target as string[])?.join(', ') || 'champ';
      sendError(res, `Cette valeur existe déjà pour: ${field}`, 409);
      return;
    }
    if (err.code === 'P2025') {
      sendError(res, 'Ressource non trouvée', 404);
      return;
    }
    if (err.code === 'P2003') {
      sendError(res, 'Référence à une ressource inexistante', 400);
      return;
    }
  }

  // Erreur JWT
  if (err.name === 'JsonWebTokenError') {
    sendError(res, 'Token invalide', 401);
    return;
  }
  if (err.name === 'TokenExpiredError') {
    sendError(res, 'Token expiré', 401);
    return;
  }

  // Erreur par défaut
  sendError(
    res,
    process.env.NODE_ENV === 'production' ? 'Erreur serveur interne' : err.message,
    500
  );
}

export function notFoundHandler(req: Request, res: Response): void {
  sendError(res, `Route non trouvée: ${req.method} ${req.path}`, 404);
}
