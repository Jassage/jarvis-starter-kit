import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';
import { sendError } from '../utils/response';

// Hiérarchie des rôles
const ROLE_HIERARCHY: Record<UserRole, number> = {
  SUPER_ADMIN: 100,
  ADMIN: 80,
  AGENCY: 60,
  AGENT: 50,
  OWNER: 40,
  INDIVIDUAL: 20,
};

export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return sendError(res, 'Non authentifié', 401);
    if (!roles.includes(req.user.role as UserRole)) {
      return sendError(res, 'Permission insuffisante', 403);
    }
    next();
  };
}

export function requireMinRole(minRole: UserRole) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return sendError(res, 'Non authentifié', 401);
    const userLevel = ROLE_HIERARCHY[req.user.role as UserRole] || 0;
    const minLevel = ROLE_HIERARCHY[minRole];
    if (userLevel < minLevel) {
      return sendError(res, 'Permission insuffisante', 403);
    }
    next();
  };
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) return sendError(res, 'Non authentifié', 401);
  const role = req.user.role as UserRole;
  if (role !== UserRole.ADMIN && role !== UserRole.SUPER_ADMIN) {
    return sendError(res, 'Accès réservé aux administrateurs', 403);
  }
  next();
}

export function requireSuperAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) return sendError(res, 'Non authentifié', 401);
  if (req.user.role !== UserRole.SUPER_ADMIN) {
    return sendError(res, 'Accès réservé au super administrateur', 403);
  }
  next();
}

export function requireAgencyOrAbove(req: Request, res: Response, next: NextFunction) {
  return requireMinRole(UserRole.AGENCY)(req, res, next);
}

export function isAdmin(role: string): boolean {
  return role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN;
}
