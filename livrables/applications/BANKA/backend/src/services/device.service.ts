import prisma from '../utils/prisma';
import { AppError } from '../types';
import { createAuditLog } from '../utils/audit';

// ─── CRUD Appareils ──────────────────────────────────────────────────────────

export async function listDevices() {
  return prisma.pointageDevice.findMany({
    orderBy: { createdAt: 'asc' },
    include: { _count: { select: { pointages: true } } },
  });
}

export async function createDevice(data: { nom: string; serialNumber: string; commKey: string }, userId: string) {
  const existing = await prisma.pointageDevice.findUnique({ where: { serialNumber: data.serialNumber } });
  if (existing) throw new AppError(409, 'Numéro de série déjà enregistré');
  const device = await prisma.pointageDevice.create({ data });
  await createAuditLog({ userId, table: 'pointage_devices', action: 'CREATE', entiteId: device.id, nouveau: data });
  return device;
}

export async function updateDevice(id: string, data: { nom?: string; commKey?: string; actif?: boolean }, userId: string) {
  const device = await prisma.pointageDevice.findUnique({ where: { id } });
  if (!device) throw new AppError(404, 'Appareil introuvable');
  const updated = await prisma.pointageDevice.update({ where: { id }, data });
  await createAuditLog({ userId, table: 'pointage_devices', action: 'UPDATE', entiteId: id, nouveau: data });
  return updated;
}

export async function deleteDevice(id: string, userId: string) {
  const device = await prisma.pointageDevice.findUnique({ where: { id }, include: { _count: { select: { pointages: true } } } });
  if (!device) throw new AppError(404, 'Appareil introuvable');
  if (device._count.pointages > 0) throw new AppError(400, 'Impossible de supprimer un appareil ayant des pointages associés');
  await prisma.pointageDevice.delete({ where: { id } });
  await createAuditLog({ userId, table: 'pointage_devices', action: 'DELETE', entiteId: id });
}

// ─── ZKTeco ADMS ─────────────────────────────────────────────────────────────

export async function findDeviceBySN(serialNumber: string, commKey?: string) {
  const device = await prisma.pointageDevice.findUnique({ where: { serialNumber } });
  if (!device || !device.actif) return null;
  // Si l'appareil a une CommKey configurée, la requête doit la fournir correctement
  if (device.commKey && device.commKey !== commKey) return null;
  return device;
}

export async function touchDevice(serialNumber: string) {
  await prisma.pointageDevice.update({
    where: { serialNumber },
    data: { derniereSync: new Date() },
  });
}

function dateOnly(d: Date): Date {
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
}

export async function processAttLogLine(line: string, deviceId: string, deviceSN: string): Promise<boolean> {
  // Format ZKTeco ATTLOG : PIN\tDatetime\tStatus\tVerify\tWorkCode\tReserved
  const parts = line.trim().split('\t');
  if (parts.length < 2) return false;

  const pin      = parseInt(parts[0], 10);
  const datetime = parts[1];
  const status   = parts[2] ? parseInt(parts[2], 10) : 0;

  if (isNaN(pin) || !datetime) return false;

  const employe = await prisma.employe.findFirst({ where: { biometricId: pin } });
  if (!employe) return false;

  const ts   = new Date(datetime);
  const date = dateOnly(ts);

  const existing = await prisma.pointageEmploye.findUnique({
    where: { employeId_date: { employeId: employe.id, date } },
  });

  if (!existing) {
    // Première pointée du jour → arrivée
    await prisma.pointageEmploye.create({
      data: {
        employeId:    employe.id,
        date,
        heureArrivee: ts,
        statut:       'PRESENT',
        source:       'APPAREIL',
        deviceId,
        creeParId:    null,
      },
    });
    return true;
  }

  // Statut ZKTeco : 0 = check-in, 1 = check-out (et autres variantes)
  const isCheckout = status === 1 || status === 5;

  if (isCheckout || (!isCheckout && !existing.heureDepart && existing.heureArrivee)) {
    // Deuxième pointée → départ
    if (!existing.heureDepart || ts > new Date(existing.heureDepart)) {
      await prisma.pointageEmploye.update({
        where: { id: existing.id },
        data: { heureDepart: ts, deviceId },
      });
    }
  }

  return true;
}

export async function processAttLog(body: string, deviceId: string, deviceSN: string): Promise<number> {
  const lines = body.split(/\r?\n/).filter((l) => l.trim().length > 0);
  let count = 0;
  for (const line of lines) {
    try {
      const ok = await processAttLogLine(line, deviceId, deviceSN);
      if (ok) count++;
    } catch { /* ligne invalide, on continue */ }
  }
  return count;
}
