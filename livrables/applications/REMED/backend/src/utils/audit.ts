import { Request } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../types';

interface LogAuditParams {
  req: Request;
  userId?: string | null;
  action: string;
  entite: string;
  entiteId?: string | null;
  details?: Record<string, unknown>;
}

export async function logAudit({ req, userId, action, entite, entiteId, details }: LogAuditParams): Promise<void> {
  const resolvedUserId = userId ?? (req as AuthRequest).user?.userId ?? null;
  await prisma.auditLog.create({
    data: {
      utilisateurId: resolvedUserId,
      action,
      entite,
      entiteId: entiteId ?? null,
      details: details ? JSON.parse(JSON.stringify(details)) : undefined,
      ipAddress: req.ip,
    },
  });
}
