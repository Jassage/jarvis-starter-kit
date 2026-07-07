import { Response } from 'express';
import * as auditService from './audit.service';
import { sendSuccess } from '../../utils/response';
import { AuthRequest } from '../../types';

export async function listAuditLogs(req: AuthRequest, res: Response) {
  const take = Math.min(Number(req.query.take) || 50, 200);
  const cursor = typeof req.query.cursor === 'string' ? req.query.cursor : undefined;
  const logs = await auditService.listAuditLogs(take, cursor);
  sendSuccess(res, { logs });
}
