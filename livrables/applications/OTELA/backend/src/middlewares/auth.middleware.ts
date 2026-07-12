import { Request, Response, NextFunction } from 'express';
import { RoleEmploye } from '@prisma/client';
import { verifyAccessToken } from '../utils/jwt';
import prisma from '../config/database';
import { sendError } from '../utils/response';

declare global {
  namespace Express {
    interface Request {
      employe?: {
        id: string;
        email: string;
        nom: string;
        role: RoleEmploye;
        etablissementId: string | null;
      };
      // Résolu par resolveEtablissement — jamais depuis un paramètre client.
      etablissementId?: string | null;
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return sendError(res, 'Token d\'authentification requis', 401);
    }

    const token = authHeader.slice(7);
    const payload = verifyAccessToken(token);

    const employe = await prisma.employe.findUnique({
      where: { id: payload.employeId },
      select: { id: true, email: true, nom: true, role: true, etablissementId: true, isActive: true },
    });

    if (!employe) return sendError(res, 'Employé non trouvé', 401);
    if (!employe.isActive) return sendError(res, 'Compte désactivé', 403);

    req.employe = employe;
    next();
  } catch {
    return sendError(res, 'Token invalide ou expiré', 401);
  }
}
