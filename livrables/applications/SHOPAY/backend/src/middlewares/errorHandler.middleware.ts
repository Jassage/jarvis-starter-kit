import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { sendError } from '../utils/response';
import { AppError } from '../types';
import logger from '../utils/logger';

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  logger.error({ err, path: req.path, method: req.method }, 'Erreur non gérée');

  if (err instanceof AppError) {
    sendError(res, err.message, err.statusCode, err.errors);
    return;
  }

  if (err instanceof ZodError) {
    sendError(
      res,
      'Données invalides',
      422,
      err.errors.map((e) => ({ field: e.path.join('.'), message: e.message }))
    );
    return;
  }

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
  }

  if (err.name === 'JsonWebTokenError') {
    sendError(res, 'Token invalide', 401);
    return;
  }
  if (err.name === 'TokenExpiredError') {
    sendError(res, 'Token expiré', 401);
    return;
  }

  sendError(res, process.env.NODE_ENV === 'production' ? 'Erreur serveur interne' : err.message, 500);
}

export function notFoundHandler(req: Request, res: Response): void {
  sendError(res, `Route non trouvée: ${req.method} ${req.path}`, 404);
}
