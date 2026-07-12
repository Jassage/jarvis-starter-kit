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

  if (err instanceof AppError) {
    sendError(res, err.message, err.statusCode, err.errors);
    return;
  }

  if (err instanceof ZodError) {
    sendError(res, 'Données invalides', 422, err.errors.map(e => ({
      field: e.path.join('.'),
      message: e.message,
    })));
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // 23P01 = violation de la contrainte d'exclusion PostgreSQL anti-double-booking
    // (cf. migration exclude_overlap_reservation) — remontée par Prisma en P2010/P2028
    // selon le contexte, mais peut aussi surgir en erreur brute non "Known" ; couvert
    // séparément dans reservations.service.ts autour de la transaction concernée.
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

  // Violation de contrainte d'exclusion PostgreSQL brute (pas toujours mappée en
  // PrismaClientKnownRequestError selon le driver) — code SQLSTATE 23P01.
  if ((err as { code?: string }).code === '23P01') {
    sendError(res, 'Chambre non disponible sur ces dates', 409);
    return;
  }

  if (err.name === 'JsonWebTokenError') {
    sendError(res, 'Token invalide', 401);
    return;
  }
  if (err.name === 'TokenExpiredError') {
    sendError(res, 'Token expiré', 401);
    return;
  }

  sendError(
    res,
    process.env.NODE_ENV === 'production' ? 'Erreur serveur interne' : err.message,
    500
  );
}

export function notFoundHandler(req: Request, res: Response): void {
  sendError(res, `Route non trouvée: ${req.method} ${req.path}`, 404);
}
