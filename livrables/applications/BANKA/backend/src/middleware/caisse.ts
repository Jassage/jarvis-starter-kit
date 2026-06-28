import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import prisma from '../utils/prisma';
import { AppError } from '../types';

export async function requireCaisseOuverte(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const agenceId = req.user?.agenceId;

    // Les utilisateurs du siège (sans agence) ne sont pas bloqués
    if (!agenceId) return next();

    const session = await prisma.sessionCaisse.findFirst({
      where: { agenceId, statut: 'OUVERTE' },
    });

    if (!session) {
      return next(new AppError(
        403,
        "La caisse de votre agence n'est pas ouverte. Ouvrez une session de caisse avant d'effectuer des transactions."
      ));
    }

    next();
  } catch (e) {
    next(e);
  }
}
