import prisma from '../../config/database';

export async function listAuditLogs(take: number, cursor?: string) {
  return prisma.auditLog.findMany({
    take,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { email: true, nom: true, prenom: true } } },
  });
}
