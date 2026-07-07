import { Request } from 'express';
import { Prisma } from '@prisma/client';
import prisma from '../config/database';
import { logger } from './logger';
import { AuthRequest } from '../types';

interface LogAuditParams {
  req: AuthRequest;
  action: string;
  entite: string;
  entiteId?: string | null;
  changes?: Record<string, unknown>;
  // À fournir explicitement quand l'action précède la pose de req.user (ex. login).
  userId?: string | null;
}

// Best-effort : un échec d'écriture de l'audit ne doit jamais faire échouer l'action métier
// qu'il trace (ex. suppression d'un domaine réussie mais log en erreur).
export async function logAudit({ req, action, entite, entiteId, changes, userId }: LogAuditParams) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: userId ?? req.user?.userId ?? null,
        action,
        entite,
        entiteId: entiteId ?? null,
        changes: (changes as Prisma.InputJsonValue) ?? undefined,
        ipAddress: req.ip,
        userAgent: (req as Request).headers['user-agent'],
      },
    });
  } catch (err) {
    logger.error({ err, action, entite, entiteId }, "Échec d'écriture de l'audit log");
  }
}
