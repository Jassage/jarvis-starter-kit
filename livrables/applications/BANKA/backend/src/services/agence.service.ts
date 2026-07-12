import prisma from '../utils/prisma';
import { AppError } from '../types';

// La caisse HTG est incluse pour exposer le plafond d'alerte et le solde persistant au frontend —
// USD non couvert dans cette première tranche (limitation assumée, cf. plan multi-agence)
const CAISSE_HTG_INCLUDE = { caisses: { where: { devise: 'HTG' as const }, select: { solde: true, plafondAlerte: true } } };

export async function listAgences() {
  return prisma.agence.findMany({
    orderBy: { nom: 'asc' },
    include: {
      _count: { select: { utilisateurs: true, comptes: true, prets: true, employes: true } },
      ...CAISSE_HTG_INCLUDE,
    },
  });
}

export async function getAgence(id: string) {
  const agence = await prisma.agence.findUnique({
    where: { id },
    include: {
      utilisateurs: { select: { id: true, prenom: true, nom: true, role: true, actif: true } },
      _count: { select: { comptes: true, prets: true, sessions: true, employes: true } },
      ...CAISSE_HTG_INCLUDE,
    },
  });
  if (!agence) throw new AppError(404, 'Agence introuvable');
  return agence;
}

export async function createAgence(data: {
  code: string;
  nom: string;
  adresse?: string;
  telephone?: string;
  plafondCaisseHTG?: number;
}) {
  const { plafondCaisseHTG, ...rest } = data;
  const existe = await prisma.agence.findUnique({ where: { code: data.code } });
  if (existe) throw new AppError(400, `Le code agence "${data.code}" est déjà utilisé`);
  return prisma.$transaction(async (tx) => {
    const agence = await tx.agence.create({ data: rest });
    if (plafondCaisseHTG !== undefined) {
      await tx.caisseAgence.create({ data: { agenceId: agence.id, devise: 'HTG', plafondAlerte: plafondCaisseHTG } });
    }
    return tx.agence.findUniqueOrThrow({ where: { id: agence.id }, include: CAISSE_HTG_INCLUDE });
  });
}

export async function updateAgence(id: string, data: Partial<{ nom: string; adresse: string; telephone: string; actif: boolean; plafondCaisseHTG: number | null }>) {
  const agence = await prisma.agence.findUnique({ where: { id } });
  if (!agence) throw new AppError(404, 'Agence introuvable');
  const { plafondCaisseHTG, ...rest } = data;
  return prisma.$transaction(async (tx) => {
    await tx.agence.update({ where: { id }, data: rest });
    if (plafondCaisseHTG !== undefined) {
      await tx.caisseAgence.upsert({
        where: { agenceId_devise: { agenceId: id, devise: 'HTG' } },
        update: { plafondAlerte: plafondCaisseHTG },
        create: { agenceId: id, devise: 'HTG', plafondAlerte: plafondCaisseHTG },
      });
    }
    return tx.agence.findUniqueOrThrow({ where: { id }, include: CAISSE_HTG_INCLUDE });
  });
}
