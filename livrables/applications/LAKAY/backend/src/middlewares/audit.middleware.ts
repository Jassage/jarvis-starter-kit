import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';

export function auditLog(action: string, entity: string) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (req.user) {
        await prisma.auditLog.create({
          data: {
            userId: req.user.id,
            action,
            entity,
            entityId: req.params.id,
            ipAddress: req.ip || req.socket.remoteAddress,
            userAgent: req.headers['user-agent'],
          },
        });
      }
    } catch {
      // Audit non bloquant
    }
    next();
  };
}
