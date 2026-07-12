import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import prisma from '../config/database';
import { sendError } from '../utils/response';
import { Reunion } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        nom: string;
      };
      // Résolu par resolveReunion — jamais depuis un paramètre client brut, la
      // réunion est toujours rechargée depuis :codeReunion/:reunionId.
      reunion?: Reunion;
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

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, nom: true },
    });

    if (!user) return sendError(res, 'Utilisateur non trouvé', 401);

    req.user = user;
    next();
  } catch {
    return sendError(res, 'Token invalide ou expiré', 401);
  }
}

// Authentification optionnelle : n'échoue jamais, se contente de peupler
// req.user si un Bearer token valide est présent. Utilisé sur /rejoindre, où
// un hôte connecté doit être reconnu (admission immédiate, pas de salle
// d'attente pour lui) sans empêcher un invité sans compte de rejoindre.
export async function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return next();

    const token = authHeader.slice(7);
    const payload = verifyAccessToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, nom: true },
    });
    if (user) req.user = user;
    next();
  } catch {
    next();
  }
}
