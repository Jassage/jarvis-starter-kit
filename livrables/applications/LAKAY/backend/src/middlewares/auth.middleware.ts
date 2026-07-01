import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, JwtPayload } from '../utils/jwt';
import prisma from '../config/database';
import { sendError } from '../utils/response';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        firstName: string;
        lastName: string;
      };
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
      select: { id: true, email: true, role: true, firstName: true, lastName: true, isActive: true },
    });

    if (!user) return sendError(res, 'Utilisateur non trouvé', 401);
    if (!user.isActive) return sendError(res, 'Compte désactivé', 403);

    req.user = user;
    next();
  } catch {
    return sendError(res, 'Token invalide ou expiré', 401);
  }
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      const payload = verifyAccessToken(token) as JwtPayload;
      req.user = { id: payload.userId, email: payload.email, role: payload.role, firstName: '', lastName: '' };
    }
  } catch {
    // Silencieux — auth optionnelle
  }
  next();
}
