import prisma from '../utils/prisma';
import { AppError } from '../types';
import { createAuditLog } from '../utils/audit';
import { getBilan } from './compta.service';

function toPeriode(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function finDeMois(periode: string): Date {
  const [annee, mois] = periode.split('-').map(Number);
  return new Date(annee, mois, 0, 23, 59, 59);
}

// Point d'appel unique utilisé par createEcriture et deleteEcriture (compta.service.ts).
// Ne bloque jamais les écritures automatiques (creerEcritureAuto) : ce comportement reste intact.
export async function verifierPeriodeOuverte(client: any, date: Date): Promise<void> {
  const periode = toPeriode(date);
  const p = await client.periodeComptable.findUnique({ where: { periode } });
  if (p?.statut === 'CLOTUREE') {
    throw new AppError(409, `La période comptable ${periode} est clôturée — opération impossible`);
  }
}

export async function listPeriodesComptables() {
  return prisma.periodeComptable.findMany({ orderBy: { periode: 'desc' } });
}

export async function cloturerPeriode(
  periode: string,
  userId: string,
  opts?: { forcerMalgreDesequilibre?: boolean }
) {
  const periodeCourante = toPeriode(new Date());
  if (periode >= periodeCourante) {
    throw new AppError(400, 'Impossible de clôturer le mois en cours ou un mois futur');
  }

  const bilan = await getBilan(finDeMois(periode));
  if (!bilan.equilibre && !opts?.forcerMalgreDesequilibre) {
    throw new AppError(400, `Le bilan n'est pas équilibré au ${periode} — clôture refusée (voir option de forçage)`);
  }

  const resultat = await prisma.$transaction(async (tx) => {
    const existing = await tx.periodeComptable.findUnique({ where: { periode } });
    if (existing) {
      if (existing.statut === 'CLOTUREE') throw new AppError(409, 'Cette période est déjà clôturée');
      const cas = await tx.periodeComptable.updateMany({
        where: { id: existing.id, statut: 'OUVERTE' },
        data: { statut: 'CLOTUREE', clotureeParId: userId, clotureeAt: new Date() },
      });
      if (cas.count === 0) throw new AppError(409, 'Cette période est déjà clôturée');
      return tx.periodeComptable.findUniqueOrThrow({ where: { id: existing.id } });
    }
    try {
      return await tx.periodeComptable.create({
        data: { periode, statut: 'CLOTUREE', clotureeParId: userId, clotureeAt: new Date() },
      });
    } catch (e: any) {
      if (e.code === 'P2002') throw new AppError(409, 'Cette période est déjà clôturée');
      throw e;
    }
  });

  await createAuditLog({
    userId,
    table: 'periodes_comptables',
    action: 'CLOTURE_PERIODE',
    entiteId: resultat.id,
    nouveau: { periode, force: !!opts?.forcerMalgreDesequilibre },
  });

  return resultat;
}

export async function rouvrirPeriode(periode: string, userId: string) {
  const resultat = await prisma.$transaction(async (tx) => {
    const existing = await tx.periodeComptable.findUnique({ where: { periode } });
    if (!existing || existing.statut !== 'CLOTUREE') throw new AppError(409, "Cette période n'est pas clôturée");
    const cas = await tx.periodeComptable.updateMany({
      where: { id: existing.id, statut: 'CLOTUREE' },
      data: { statut: 'OUVERTE', reouverteParId: userId, reouverteAt: new Date() },
    });
    if (cas.count === 0) throw new AppError(409, "Cette période n'est pas clôturée");
    return tx.periodeComptable.findUniqueOrThrow({ where: { id: existing.id } });
  });

  await createAuditLog({
    userId,
    table: 'periodes_comptables',
    action: 'REOUVERTURE_PERIODE',
    entiteId: resultat.id,
    nouveau: { periode },
  });

  return resultat;
}
