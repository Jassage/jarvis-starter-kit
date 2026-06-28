import prisma from '../utils/prisma';
import { AppError } from '../types';
import { createAuditLog } from '../utils/audit';

const MANDATAIRE_SELECT = {
  id: true,
  nom: true,
  prenom: true,
  raisonSociale: true,
  type: true,
  telephone: true,
  numeroClient: true,
};

export async function listMandats(compteId: string) {
  return prisma.mandatCompte.findMany({
    where: { compteId },
    include: {
      mandataire: { select: MANDATAIRE_SELECT },
      creePar: { select: { id: true, nom: true, prenom: true, role: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createMandat(
  compteId: string,
  data: { mandataireId: string; droits: string[]; dateFin?: string; notes?: string },
  userId: string
) {
  const existing = await prisma.mandatCompte.findFirst({
    where: { compteId, mandataireId: data.mandataireId, actif: true },
  });
  if (existing) throw new AppError(409, 'Ce client dispose déjà d\'un mandat actif sur ce compte');

  if (data.dateFin) {
    const fin = new Date(data.dateFin);
    if (fin <= new Date()) throw new AppError(400, 'La date de fin du mandat doit être dans le futur');
  }

  const mandat = await prisma.mandatCompte.create({
    data: {
      compteId,
      mandataireId: data.mandataireId,
      droits: data.droits,
      dateFin: data.dateFin ? new Date(data.dateFin) : undefined,
      notes: data.notes,
      creeParId: userId,
    },
    include: { mandataire: { select: MANDATAIRE_SELECT } },
  });

  await createAuditLog({
    userId,
    table: 'mandats_compte',
    action: 'CREATE',
    entiteId: mandat.id,
    nouveau: { compteId, mandataireId: data.mandataireId, droits: data.droits },
  });

  return mandat;
}

export async function updateMandat(
  mandatId: string,
  data: { droits?: string[]; dateFin?: string | null; notes?: string },
  userId: string
) {
  const existing = await prisma.mandatCompte.findUniqueOrThrow({ where: { id: mandatId } });

  const mandat = await prisma.mandatCompte.update({
    where: { id: mandatId },
    data: {
      droits: data.droits,
      dateFin: data.dateFin === null ? null : data.dateFin ? new Date(data.dateFin) : undefined,
      notes: data.notes,
    },
    include: { mandataire: { select: MANDATAIRE_SELECT } },
  });

  await createAuditLog({
    userId,
    table: 'mandats_compte',
    action: 'UPDATE',
    entiteId: mandatId,
    ancien: { droits: existing.droits, dateFin: existing.dateFin },
    nouveau: data,
  });

  return mandat;
}

export async function revoquerMandat(mandatId: string, userId: string) {
  const mandat = await prisma.mandatCompte.update({
    where: { id: mandatId },
    data: { actif: false },
  });

  await createAuditLog({
    userId,
    table: 'mandats_compte',
    action: 'REVOCATION',
    entiteId: mandatId,
  });

  return mandat;
}
