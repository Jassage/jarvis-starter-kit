import prisma from './prisma';

export async function createAuditLog(opts: {
  userId: string;
  table: string;
  action: string;
  entiteId: string;
  ancien?: object;
  nouveau?: object;
  ip?: string;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        table: opts.table,
        action: opts.action,
        entiteId: opts.entiteId,
        ancienneValeur: opts.ancien ?? undefined,
        nouvelleValeur: opts.nouveau ?? undefined,
        utilisateurId: opts.userId,
        ip: opts.ip,
      },
    });
  } catch {
    // Audit log failures must never break the main operation
  }
}
