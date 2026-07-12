import prisma from '../utils/prisma';
import { AppError } from '../types';
import { createAuditLog } from '../utils/audit';

export async function listGaranties(pretId: string) {
  const pret = await prisma.pret.findUnique({ where: { id: pretId } });
  if (!pret) throw new AppError(404, 'Prêt introuvable');

  return prisma.garantie.findMany({
    where: { pretId },
    orderBy: { createdAt: 'desc' },
    include: { creePar: { select: { nom: true, prenom: true } } },
  });
}

export async function createGarantie(
  pretId: string,
  data: {
    type: string;
    description: string;
    valeurEstimee?: number;
    dateConstit?: Date;
    notes?: string;
  },
  userId: string,
  agentAgenceId?: string | null
) {
  const pret = await prisma.pret.findUnique({ where: { id: pretId } });
  if (!pret) throw new AppError(404, 'Prêt introuvable');
  if (agentAgenceId && pret.agenceId !== agentAgenceId) throw new AppError(403, 'Ce prêt n\'appartient pas à votre agence');

  const garantie = await prisma.garantie.create({
    data: {
      pretId,
      type: data.type as any,
      description: data.description,
      valeurEstimee: data.valeurEstimee,
      dateConstit: data.dateConstit || new Date(),
      notes: data.notes,
      creeParId: userId,
    },
    include: { creePar: { select: { nom: true, prenom: true } } },
  });

  await createAuditLog({
    userId,
    table: 'garanties',
    action: 'CREATE',
    entiteId: garantie.id,
    nouveau: { pretId, type: data.type, description: data.description },
  });

  return garantie;
}

export async function updateGarantie(
  id: string,
  data: { statut?: string; description?: string; valeurEstimee?: number; dateLevee?: Date; notes?: string },
  userId: string,
  agentAgenceId?: string | null
) {
  const existing = await prisma.garantie.findUnique({ where: { id }, include: { pret: { select: { agenceId: true } } } });
  if (!existing) throw new AppError(404, 'Garantie introuvable');
  if (agentAgenceId && existing.pret.agenceId !== agentAgenceId) throw new AppError(403, 'Cette garantie n\'appartient pas à votre agence');

  const updated = await prisma.garantie.update({
    where: { id },
    data: {
      ...data,
      dateLevee: data.statut === 'LEVEE' && !existing.dateLevee ? new Date() : data.dateLevee,
    } as any,
    include: { creePar: { select: { nom: true, prenom: true } } },
  });

  await createAuditLog({ userId, table: 'garanties', action: 'UPDATE', entiteId: id, nouveau: data });

  return updated;
}
