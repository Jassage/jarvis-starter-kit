import prisma from '../utils/prisma';
import { AppError } from '../types';
import { createAuditLog } from '../utils/audit';

function dateOnly(d: Date): Date {
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
}

export async function listPointages(opts: {
  date?: string;
  periode?: string;
  employeId?: string;
  statut?: string;
  page?: number;
  limit?: number;
}) {
  const { date, periode, employeId, statut, page = 1, limit = 50 } = opts;
  const skip = (page - 1) * limit;
  const where: any = {};

  if (employeId) where.employeId = employeId;
  if (statut) where.statut = statut;
  if (date) {
    const d = new Date(date);
    const next = new Date(d); next.setDate(next.getDate() + 1);
    where.date = { gte: d, lt: next };
  } else if (periode) {
    const [y, m] = periode.split('-').map(Number);
    where.date = {
      gte: new Date(Date.UTC(y, m - 1, 1)),
      lt:  new Date(Date.UTC(y, m, 1)),
    };
  }

  const [total, items] = await Promise.all([
    (prisma as any).pointageEmploye.count({ where }),
    (prisma as any).pointageEmploye.findMany({
      where, skip, take: limit,
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
      include: {
        employe: { select: { id: true, nom: true, prenom: true, matricule: true, departement: true, poste: { select: { intitule: true } } } },
      },
    }),
  ]);
  return { items, total, page, limit, pages: Math.ceil(total / limit) };
}

export async function getJournalier(date: string) {
  const d = new Date(date);
  const next = new Date(d); next.setDate(next.getDate() + 1);

  const [employes, pointages] = await Promise.all([
    (prisma as any).employe.findMany({
      where: { statut: 'ACTIF' },
      orderBy: [{ departement: 'asc' }, { nom: 'asc' }],
      select: { id: true, nom: true, prenom: true, matricule: true, departement: true, poste: { select: { intitule: true } } },
    }),
    (prisma as any).pointageEmploye.findMany({
      where: { date: { gte: d, lt: next } },
      select: { id: true, employeId: true, statut: true, heureArrivee: true, heureDepart: true, retardMinutes: true, notes: true },
    }),
  ]);

  const map: Record<string, any> = {};
  for (const p of pointages) map[p.employeId] = p;

  return employes.map((e: any) => ({
    ...e,
    pointage: map[e.id] || null,
  }));
}

export async function upsertPointage(data: {
  employeId: string;
  date: string;
  statut: string;
  heureArrivee?: string;
  heureDepart?: string;
  retardMinutes?: number;
  notes?: string;
}, userId: string) {
  const employe = await (prisma as any).employe.findUnique({ where: { id: data.employeId } });
  if (!employe) throw new AppError(404, 'Employé introuvable');

  const d = dateOnly(new Date(data.date));

  const heureArrivee = data.heureArrivee ? new Date(`${data.date}T${data.heureArrivee}:00`) : null;
  const heureDepart  = data.heureDepart  ? new Date(`${data.date}T${data.heureDepart}:00`)  : null;

  const result = await (prisma as any).pointageEmploye.upsert({
    where: { employeId_date: { employeId: data.employeId, date: d } },
    create: {
      employeId:     data.employeId,
      date:          d,
      statut:        data.statut,
      heureArrivee,
      heureDepart,
      retardMinutes: data.retardMinutes ?? null,
      notes:         data.notes ?? null,
      creeParId:     userId,
    },
    update: {
      statut:        data.statut,
      heureArrivee,
      heureDepart,
      retardMinutes: data.retardMinutes ?? null,
      notes:         data.notes ?? null,
    },
    include: {
      employe: { select: { nom: true, prenom: true, matricule: true } },
    },
  });

  await createAuditLog({ userId, table: 'pointages', action: 'UPSERT', entiteId: result.id, nouveau: { employeId: data.employeId, date: data.date, statut: data.statut } });
  return result;
}

export async function bulkUpsertPointage(entries: Array<{
  employeId: string;
  statut: string;
  heureArrivee?: string;
  heureDepart?: string;
  retardMinutes?: number;
  notes?: string;
}>, date: string, userId: string) {
  const d = dateOnly(new Date(date));
  let created = 0, updated = 0, errors = 0;

  for (const entry of entries) {
    try {
      const heureArrivee = entry.heureArrivee ? new Date(`${date}T${entry.heureArrivee}:00`) : null;
      const heureDepart  = entry.heureDepart  ? new Date(`${date}T${entry.heureDepart}:00`)  : null;

      const existing = await (prisma as any).pointageEmploye.findUnique({
        where: { employeId_date: { employeId: entry.employeId, date: d } },
      });

      if (existing) {
        await (prisma as any).pointageEmploye.update({
          where: { id: existing.id },
          data: { statut: entry.statut, heureArrivee, heureDepart, retardMinutes: entry.retardMinutes ?? null, notes: entry.notes ?? null },
        });
        updated++;
      } else {
        await (prisma as any).pointageEmploye.create({
          data: { employeId: entry.employeId, date: d, statut: entry.statut, heureArrivee, heureDepart, retardMinutes: entry.retardMinutes ?? null, notes: entry.notes ?? null, creeParId: userId },
        });
        created++;
      }
    } catch {
      errors++;
    }
  }

  await createAuditLog({ userId, table: 'pointages', action: 'BULK_UPSERT', entiteId: date, nouveau: { date, created, updated, errors } });
  return { created, updated, errors };
}

export async function deletePointage(id: string, userId: string) {
  const p = await (prisma as any).pointageEmploye.findUnique({ where: { id } });
  if (!p) throw new AppError(404, 'Pointage introuvable');
  await (prisma as any).pointageEmploye.delete({ where: { id } });
  await createAuditLog({ userId, table: 'pointages', action: 'DELETE', entiteId: id });
}

export async function getStats(periode: string, employeId?: string) {
  const [y, m] = periode.split('-').map(Number);
  const dateDebut = new Date(Date.UTC(y, m - 1, 1));
  const dateFin   = new Date(Date.UTC(y, m, 1));
  const where: any = { date: { gte: dateDebut, lt: dateFin } };
  if (employeId) where.employeId = employeId;

  const pointages = await (prisma as any).pointageEmploye.findMany({
    where,
    include: { employe: { select: { id: true, nom: true, prenom: true, matricule: true, departement: true } } },
  });

  const totalActifs = await (prisma as any).employe.count({ where: { statut: 'ACTIF' } });

  const parEmploye: Record<string, { employe: any; present: number; absent: number; retard: number; demiJournee: number; total: number }> = {};
  for (const p of pointages) {
    const eid = p.employe.id;
    if (!parEmploye[eid]) parEmploye[eid] = { employe: p.employe, present: 0, absent: 0, retard: 0, demiJournee: 0, total: 0 };
    parEmploye[eid].total++;
    if (p.statut === 'PRESENT')      parEmploye[eid].present++;
    if (p.statut === 'ABSENT')       parEmploye[eid].absent++;
    if (p.statut === 'RETARD')       parEmploye[eid].retard++;
    if (p.statut === 'DEMI_JOURNEE') parEmploye[eid].demiJournee++;
  }

  const totalPresent    = pointages.filter((p: any) => p.statut === 'PRESENT').length;
  const totalAbsent     = pointages.filter((p: any) => p.statut === 'ABSENT').length;
  const totalRetard     = pointages.filter((p: any) => p.statut === 'RETARD').length;
  const totalDemiJournee = pointages.filter((p: any) => p.statut === 'DEMI_JOURNEE').length;

  return {
    periode,
    totalActifs,
    totalPointages: pointages.length,
    totalPresent,
    totalAbsent,
    totalRetard,
    totalDemiJournee,
    parEmploye: Object.values(parEmploye),
  };
}
