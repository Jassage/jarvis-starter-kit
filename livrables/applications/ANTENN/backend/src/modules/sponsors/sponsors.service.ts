import prisma from '../../config/database';
import { AppError } from '../../middlewares/errorHandler.middleware';
import { TypePackageSponsor } from '@prisma/client';

const ALERTE_JOURS = 30;

function withAlerte<T extends { dateFinContrat: Date }>(sponsor: T) {
  const joursRestants = Math.ceil((sponsor.dateFinContrat.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
  return {
    ...sponsor,
    joursRestantsContrat: joursRestants,
    contratExpireBientot: joursRestants <= ALERTE_JOURS,
    contratExpire: joursRestants < 0,
  };
}

export async function listSponsors() {
  const sponsors = await prisma.sponsor.findMany({ orderBy: { dateFinContrat: 'asc' } });
  return sponsors.map(withAlerte);
}

export async function getSponsor(id: string) {
  const sponsor = await prisma.sponsor.findUnique({ where: { id } });
  if (!sponsor) throw new AppError('Sponsor non trouvé', 404);
  return withAlerte(sponsor);
}

interface SponsorInput {
  nomSponsor: string;
  typePackage: TypePackageSponsor;
  contactNom?: string | null;
  contactTelephone?: string | null;
  dateDebutContrat: string;
  dateFinContrat: string;
}

export async function createSponsor(data: SponsorInput) {
  const sponsor = await prisma.sponsor.create({
    data: {
      ...data,
      dateDebutContrat: new Date(data.dateDebutContrat),
      dateFinContrat: new Date(data.dateFinContrat),
    },
  });
  return withAlerte(sponsor);
}

export async function updateSponsor(id: string, data: Partial<SponsorInput>) {
  const existing = await prisma.sponsor.findUnique({ where: { id } });
  if (!existing) throw new AppError('Sponsor non trouvé', 404);

  const sponsor = await prisma.sponsor.update({
    where: { id },
    data: {
      ...data,
      ...(data.dateDebutContrat && { dateDebutContrat: new Date(data.dateDebutContrat) }),
      ...(data.dateFinContrat && { dateFinContrat: new Date(data.dateFinContrat) }),
    },
  });
  return withAlerte(sponsor);
}

export async function updateLogo(id: string, logoUrl: string) {
  const existing = await prisma.sponsor.findUnique({ where: { id } });
  if (!existing) throw new AppError('Sponsor non trouvé', 404);
  const sponsor = await prisma.sponsor.update({ where: { id }, data: { logoUrl } });
  return withAlerte(sponsor);
}

export async function deleteSponsor(id: string) {
  const existing = await prisma.sponsor.findUnique({
    where: { id },
    include: { contenus: true, matchsTitre: true },
  });
  if (!existing) throw new AppError('Sponsor non trouvé', 404);
  if (existing.contenus.length > 0 || existing.matchsTitre.length > 0) {
    throw new AppError('Ce sponsor est référencé par des contenus ou des matchs et ne peut pas être supprimé', 409);
  }
  await prisma.sponsor.delete({ where: { id } });
}

export async function listContratsExpirantBientot() {
  const sponsors = await listSponsors();
  return sponsors.filter((s) => s.contratExpireBientot);
}
