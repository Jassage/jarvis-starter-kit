import prisma from '../../config/database';
import { AppError } from '../../middlewares/errorHandler.middleware';
import { PositionOverlay } from '@prisma/client';

interface IncrustationInput {
  creneauId?: string | null;
  matchId?: string | null;
  sponsorId: string;
  logoUrl: string;
  position: PositionOverlay;
  opacite: number;
  actif: boolean;
}

export async function listIncrustations(creneauId?: string, matchId?: string) {
  return prisma.incrustationLogo.findMany({
    where: { ...(creneauId && { creneauId }), ...(matchId && { matchId }) },
    include: { sponsor: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createIncrustation(data: IncrustationInput) {
  return prisma.incrustationLogo.create({
    data: { ...data, creneauId: data.creneauId || null, matchId: data.matchId || null },
    include: { sponsor: true },
  });
}

export async function deleteIncrustation(id: string) {
  const existing = await prisma.incrustationLogo.findUnique({ where: { id } });
  if (!existing) throw new AppError('Incrustation non trouvée', 404);
  await prisma.incrustationLogo.delete({ where: { id } });
}

interface BandeauInput {
  creneauId?: string | null;
  matchId?: string | null;
  items: Array<{ texte: string; logoUrl?: string; sponsorId?: string }>;
  vitesseDefilement: number;
  actif: boolean;
}

export async function listBandeaux(creneauId?: string, matchId?: string) {
  return prisma.bandeauSponsor.findMany({
    where: { ...(creneauId && { creneauId }), ...(matchId && { matchId }) },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createBandeau(data: BandeauInput) {
  return prisma.bandeauSponsor.create({
    data: { ...data, creneauId: data.creneauId || null, matchId: data.matchId || null },
  });
}

export async function deleteBandeau(id: string) {
  const existing = await prisma.bandeauSponsor.findUnique({ where: { id } });
  if (!existing) throw new AppError('Bandeau non trouvé', 404);
  await prisma.bandeauSponsor.delete({ where: { id } });
}
