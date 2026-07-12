import { Request, Response, NextFunction } from 'express';
import { AppError } from '../types';
import { Prisma } from '@prisma/client';
import { MulterError } from 'multer';

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ success: false, error: err.message, code: err.code });
    return;
  }

  if (err instanceof MulterError) {
    const message = err.code === 'LIMIT_FILE_SIZE' ? 'Fichier trop volumineux (10 Mo maximum)' : err.message;
    res.status(400).json({ success: false, error: message });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      res.status(409).json({ success: false, error: 'Valeur déjà existante (contrainte d\'unicité)', code: 'DUPLICATE' });
      return;
    }
    if (err.code === 'P2025') {
      res.status(404).json({ success: false, error: 'Enregistrement introuvable', code: 'NOT_FOUND' });
      return;
    }
  }

  console.error('[Error]', err);
  res.status(500).json({ success: false, error: 'Erreur serveur interne' });
}
