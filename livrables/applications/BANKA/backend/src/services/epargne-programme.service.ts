import prisma from '../utils/prisma';
import { AppError } from '../types';
import { createAuditLog } from '../utils/audit';

function nextDate(from: Date, frequence: string): Date {
  const d = new Date(from);
  switch (frequence) {
    case 'HEBDOMADAIRE': d.setDate(d.getDate() + 7); break;
    case 'MENSUEL':      d.setMonth(d.getMonth() + 1); break;
    case 'BIMESTRIEL':  d.setMonth(d.getMonth() + 2); break;
    case 'TRIMESTRIEL': d.setMonth(d.getMonth() + 3); break;
  }
  return d;
}

export async function listEpargnes(opts: { compteId?: string; actif?: boolean; page?: number; limit?: number }) {
  const { compteId, actif, page = 1, limit = 20 } = opts;
  const skip = (page - 1) * limit;
  const where: any = {};
  if (compteId) where.OR = [{ compteSourceId: compteId }, { compteDestId: compteId }];
  if (actif !== undefined) where.actif = actif;

  const [total, items] = await Promise.all([
    (prisma as any).epargneProgrammee.count({ where }),
    (prisma as any).epargneProgrammee.findMany({
      where, skip, take: limit,
      orderBy: { prochainVersement: 'asc' },
      include: {
        compteSource: { include: { client: { select: { nom: true, prenom: true, raisonSociale: true, type: true } } } },
        compteDest:   { include: { client: { select: { nom: true, prenom: true, raisonSociale: true, type: true } } } },
        creePar: { select: { nom: true, prenom: true } },
      },
    }),
  ]);
  return { items, total, page, limit, pages: Math.ceil(total / limit) };
}

export async function createEpargne(data: {
  compteSourceId: string;
  compteDestId: string;
  montant: number;
  frequence: string;
  prochainVersement: Date;
  notes?: string;
}, userId: string) {
  const [src, dst] = await Promise.all([
    prisma.compte.findUnique({ where: { id: data.compteSourceId } }),
    prisma.compte.findUnique({ where: { id: data.compteDestId } }),
  ]);
  if (!src || src.statut !== 'ACTIF') throw new AppError(400, 'Compte source inactif ou introuvable');
  if (!dst || dst.statut !== 'ACTIF') throw new AppError(400, 'Compte destination inactif ou introuvable');
  if (data.compteSourceId === data.compteDestId) throw new AppError(400, 'Source et destination doivent être différents');
  if (data.montant <= 0) throw new AppError(400, 'Montant invalide');
  const prochain = new Date(data.prochainVersement);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  if (prochain < today) throw new AppError(400, 'La date du prochain versement ne peut pas être dans le passé');

  const ep = await (prisma as any).epargneProgrammee.create({
    data: {
      compteSourceId: data.compteSourceId,
      compteDestId: data.compteDestId,
      montant: data.montant,
      frequence: data.frequence,
      prochainVersement: new Date(data.prochainVersement),
      notes: data.notes,
      creeParId: userId,
    },
    include: {
      compteSource: { include: { client: { select: { nom: true, prenom: true, raisonSociale: true, type: true } } } },
      compteDest:   { include: { client: { select: { nom: true, prenom: true, raisonSociale: true, type: true } } } },
    },
  });
  await createAuditLog({ userId, table: 'epargnes_programmees', action: 'CREATE', entiteId: ep.id, nouveau: data });
  return ep;
}

export async function toggleEpargne(id: string, userId: string) {
  const ep = await (prisma as any).epargneProgrammee.findUnique({ where: { id } });
  if (!ep) throw new AppError(404, 'Épargne programmée introuvable');
  const updated = await (prisma as any).epargneProgrammee.update({
    where: { id },
    data: { actif: !ep.actif },
  });
  await createAuditLog({ userId, table: 'epargnes_programmees', action: 'TOGGLE', entiteId: id, nouveau: { actif: updated.actif } });
  return updated;
}

export async function executerEpargnes(userId?: string) {
  const now = new Date();
  const dues = await (prisma as any).epargneProgrammee.findMany({
    where: { actif: true, prochainVersement: { lte: now } },
    include: {
      compteSource: true,
      compteDest: true,
    },
  });

  const results = { executees: 0, erreurs: 0, details: [] as string[] };

  for (const ep of dues) {
    try {
      if (ep.compteSource.statut !== 'ACTIF' || ep.compteDest.statut !== 'ACTIF') {
        results.erreurs++;
        results.details.push(`${ep.id}: compte source ou destination inactif`);
        continue;
      }
      const soldeSource = Number(ep.compteSource.solde);
      const montant = Number(ep.montant);
      if (soldeSource < montant) {
        results.erreurs++;
        results.details.push(`${ep.id}: solde insuffisant (${soldeSource} < ${montant})`);
        continue;
      }

      await prisma.$transaction(async (tx) => {
        await tx.compte.update({ where: { id: ep.compteSourceId }, data: { solde: { decrement: montant } } });
        await tx.compte.update({ where: { id: ep.compteDestId },   data: { solde: { increment: montant } } });
        await (tx as any).epargneProgrammee.update({
          where: { id: ep.id },
          data: {
            nombreExecutions: { increment: 1 },
            derniereExecution: now,
            prochainVersement: nextDate(now, ep.frequence),
          },
        });
      });

      if (userId) {
        await createAuditLog({
          userId,
          table: 'epargnes_programmees',
          action: 'EXECUTION',
          entiteId: ep.id,
          nouveau: { montant, compteSource: ep.compteSourceId, compteDest: ep.compteDestId },
        });
      }

      results.executees++;
    } catch (err: any) {
      results.erreurs++;
      results.details.push(`${ep.id}: ${err.message}`);
    }
  }

  return results;
}
