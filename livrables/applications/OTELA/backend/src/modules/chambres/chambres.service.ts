import { Devise, StatutChambre, TypeSejour } from '@prisma/client';
import prisma from '../../config/database';
import { AppError } from '../../middlewares/errorHandler.middleware';

function requireEtablissementId(etablissementId: string | null | undefined): string {
  if (!etablissementId) throw new AppError('etablissementId requis', 400);
  return etablissementId;
}

// ─── Types de chambres ───

export async function listTypesChambres(etablissementId: string) {
  return prisma.typeChambre.findMany({
    where: { etablissementId },
    include: { tarifs: { orderBy: { dateDebutSaison: 'desc' } } },
    orderBy: { nom: 'asc' },
  });
}

export async function getTypeChambre(id: string) {
  const type = await prisma.typeChambre.findUnique({ where: { id }, include: { tarifs: true } });
  if (!type) throw new AppError('Type de chambre non trouvé', 404);
  return type;
}

export async function createTypeChambre(etablissementId: string | null | undefined, data: { nom: string; capaciteMax: number; description?: string }) {
  return prisma.typeChambre.create({
    data: { ...data, etablissementId: requireEtablissementId(etablissementId) },
  });
}

async function assertTypeBelongsTo(typeChambreId: string, etablissementId: string | null | undefined) {
  const type = await getTypeChambre(typeChambreId);
  if (etablissementId && type.etablissementId !== etablissementId) {
    throw new AppError('Ce type de chambre n\'appartient pas à votre établissement', 403);
  }
  return type;
}

export async function updateTypeChambre(id: string, etablissementId: string | null | undefined, data: Partial<{ nom: string; capaciteMax: number; description: string }>) {
  await assertTypeBelongsTo(id, etablissementId);
  return prisma.typeChambre.update({ where: { id }, data });
}

// ─── Tarifs ───

export async function createTarif(typeChambreId: string, etablissementId: string | null | undefined, data: { devise: Devise; typeSejour: TypeSejour; montant: number; dateDebutSaison: Date; dateFinSaison: Date }) {
  await assertTypeBelongsTo(typeChambreId, etablissementId);
  return prisma.tarif.create({ data: { ...data, typeChambreId } });
}

export async function updateTarif(id: string, etablissementId: string | null | undefined, data: Partial<{ devise: Devise; typeSejour: TypeSejour; montant: number; dateDebutSaison: Date; dateFinSaison: Date }>) {
  const tarif = await prisma.tarif.findUnique({ where: { id }, include: { typeChambre: true } });
  if (!tarif) throw new AppError('Tarif non trouvé', 404);
  if (etablissementId && tarif.typeChambre.etablissementId !== etablissementId) {
    throw new AppError('Ce tarif n\'appartient pas à votre établissement', 403);
  }
  return prisma.tarif.update({ where: { id }, data });
}

// ─── Chambres ───

export async function listChambres(etablissementId: string) {
  return prisma.chambre.findMany({
    where: { etablissementId },
    include: { typeChambre: true },
    orderBy: { numero: 'asc' },
  });
}

export async function createChambre(etablissementId: string | null | undefined, data: { typeChambreId: string; numero: string }) {
  const etabId = requireEtablissementId(etablissementId);
  await assertTypeBelongsTo(data.typeChambreId, etabId);
  return prisma.chambre.create({ data: { ...data, etablissementId: etabId } });
}

export async function updateChambre(id: string, etablissementId: string | null | undefined, data: Partial<{ numero: string; statut: StatutChambre }>) {
  const chambre = await prisma.chambre.findUnique({ where: { id } });
  if (!chambre) throw new AppError('Chambre non trouvée', 404);
  if (etablissementId && chambre.etablissementId !== etablissementId) {
    throw new AppError('Cette chambre n\'appartient pas à votre établissement', 403);
  }
  return prisma.chambre.update({ where: { id }, data });
}
