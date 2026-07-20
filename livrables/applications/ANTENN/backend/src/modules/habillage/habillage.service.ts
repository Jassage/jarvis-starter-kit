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

// On ne peut pas habiller a posteriori un créneau déjà diffusé ni un match terminé :
// leur exposition est figée dans les rapports sponsors (base de facturation). Rattacher
// un logo à du passé gonflerait rétroactivement une diffusion qui n'a jamais eu lieu.
async function assertCibleModifiable(creneauId?: string | null, matchId?: string | null) {
  if (creneauId) {
    const creneau = await prisma.creneauGrille.findUnique({
      where: { id: creneauId },
      select: { dateHeureFin: true },
    });
    if (!creneau) throw new AppError('Créneau non trouvé', 404);
    if (creneau.dateHeureFin < new Date()) {
      throw new AppError('Ce créneau est déjà diffusé : son habillage ne peut plus être modifié', 409);
    }
  }
  if (matchId) {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      select: { statutDiffusion: true },
    });
    if (!match) throw new AppError('Match non trouvé', 404);
    if (match.statutDiffusion === 'TERMINE') {
      throw new AppError('Ce match est terminé : son habillage ne peut plus être modifié', 409);
    }
  }
}

export async function listIncrustations(creneauId?: string, matchId?: string) {
  return prisma.incrustationLogo.findMany({
    where: { ...(creneauId && { creneauId }), ...(matchId && { matchId }) },
    include: { sponsor: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createIncrustation(data: IncrustationInput) {
  await assertCibleModifiable(data.creneauId, data.matchId);
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
  await assertCibleModifiable(data.creneauId, data.matchId);
  return prisma.bandeauSponsor.create({
    data: { ...data, creneauId: data.creneauId || null, matchId: data.matchId || null },
  });
}

export async function deleteBandeau(id: string) {
  const existing = await prisma.bandeauSponsor.findUnique({ where: { id } });
  if (!existing) throw new AppError('Bandeau non trouvé', 404);
  await prisma.bandeauSponsor.delete({ where: { id } });
}
