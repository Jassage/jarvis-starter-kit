import prisma from './prisma'
import { AuthPayload } from '../types'

type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN'

export async function audit(
  user: AuthPayload | undefined,
  action: AuditAction,
  resource: string,
  opts?: { recordId?: string; label?: string; changes?: object }
) {
  try {
    await prisma.auditLog.create({
      data: {
        userId:    user?.userId,
        userEmail: user?.email,
        userRole:  user?.role,
        action,
        resource,
        recordId:  opts?.recordId,
        label:     opts?.label,
        changes:   opts?.changes ?? undefined,
      }
    })
  } catch {
    // audit failure must never break the main operation
  }
}
