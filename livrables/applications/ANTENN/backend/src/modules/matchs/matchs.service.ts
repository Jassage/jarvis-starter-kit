import prisma from '../../config/database';
import { AppError } from '../../middlewares/errorHandler.middleware';

const INCLUDE = { sponsorPrincipal: true } as const;

export async function listMatchs() {
  return prisma.match.findMany({ include: INCLUDE, orderBy: { dateHeurePrevue: 'desc' } });
}

export async function getMatch(id: string) {
  const match = await prisma.match.findUnique({ where: { id }, include: INCLUDE });
  if (!match) throw new AppError('Match non trouvé', 404);
  return match;
}

interface MatchInput {
  nomEvenement: string;
  equipes: string;
  dateHeurePrevue: string;
  ingestUrlRtmp?: string | null;
  sponsorPrincipalId?: string | null;
}

export async function createMatch(data: MatchInput) {
  return prisma.match.create({
    data: {
      nomEvenement: data.nomEvenement,
      equipes: data.equipes,
      dateHeurePrevue: new Date(data.dateHeurePrevue),
      ingestUrlRtmp: data.ingestUrlRtmp || null,
      sponsorPrincipalId: data.sponsorPrincipalId || null,
    },
    include: INCLUDE,
  });
}

export async function updateMatch(id: string, data: Partial<MatchInput>) {
  const existing = await prisma.match.findUnique({ where: { id } });
  if (!existing) throw new AppError('Match non trouvé', 404);
  if (existing.statutDiffusion === 'TERMINE') {
    throw new AppError('Un match terminé ne peut plus être modifié', 409);
  }

  return prisma.match.update({
    where: { id },
    data: {
      ...(data.nomEvenement !== undefined && { nomEvenement: data.nomEvenement }),
      ...(data.equipes !== undefined && { equipes: data.equipes }),
      ...(data.dateHeurePrevue !== undefined && { dateHeurePrevue: new Date(data.dateHeurePrevue) }),
      ...(data.ingestUrlRtmp !== undefined && { ingestUrlRtmp: data.ingestUrlRtmp }),
      ...(data.sponsorPrincipalId !== undefined && { sponsorPrincipalId: data.sponsorPrincipalId }),
    },
    include: INCLUDE,
  });
}

// Transition manuelle uniquement — pas de détection automatique de l'ingest RTMP
// tant qu'ErsatzTV n'est pas branché (cf. src/integrations/ersatztv.ts).
export async function demarrerDirect(id: string) {
  const match = await prisma.match.findUnique({ where: { id } });
  if (!match) throw new AppError('Match non trouvé', 404);
  if (match.statutDiffusion !== 'PLANIFIE') {
    throw new AppError('Seul un match planifié peut être démarré', 409);
  }
  return prisma.match.update({ where: { id }, data: { statutDiffusion: 'EN_COURS' }, include: INCLUDE });
}

export async function terminerDirect(id: string) {
  const match = await prisma.match.findUnique({ where: { id } });
  if (!match) throw new AppError('Match non trouvé', 404);
  if (match.statutDiffusion !== 'EN_COURS') {
    throw new AppError('Seul un match en cours peut être terminé', 409);
  }
  return prisma.match.update({ where: { id }, data: { statutDiffusion: 'TERMINE' }, include: INCLUDE });
}
