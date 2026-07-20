import prisma from '../../config/database';
import { AppError } from '../../middlewares/errorHandler.middleware';
import { TypeContenu } from '@prisma/client';

export async function listContenus() {
  return prisma.contenu.findMany({ include: { sponsor: true }, orderBy: { createdAt: 'desc' } });
}

export async function getContenu(id: string) {
  const contenu = await prisma.contenu.findUnique({ where: { id }, include: { sponsor: true } });
  if (!contenu) throw new AppError('Contenu non trouvé', 404);
  return contenu;
}

interface ContenuInput {
  titre: string;
  typeContenu: TypeContenu;
  urlFichier: string;
  dureeSecondes: number;
  sponsorId?: string | null;
}

export async function createContenu(data: ContenuInput) {
  return prisma.contenu.create({
    data: { ...data, sponsorId: data.sponsorId || null },
    include: { sponsor: true },
  });
}

export async function updateContenu(id: string, data: Partial<ContenuInput>) {
  const existing = await prisma.contenu.findUnique({ where: { id } });
  if (!existing) throw new AppError('Contenu non trouvé', 404);
  return prisma.contenu.update({
    where: { id },
    data: { ...data, ...(data.sponsorId !== undefined && { sponsorId: data.sponsorId || null }) },
    include: { sponsor: true },
  });
}

export async function deleteContenu(id: string) {
  const existing = await prisma.contenu.findUnique({ where: { id }, include: { creneaux: true } });
  if (!existing) throw new AppError('Contenu non trouvé', 404);
  if (existing.creneaux.length > 0) {
    throw new AppError('Ce contenu est référencé par des créneaux de grille et ne peut pas être supprimé', 409);
  }
  await prisma.contenu.delete({ where: { id } });
}

// Contenu de repli (continuité d'antenne) : au plus un actif à la fois.
export async function getContenuDeRepli() {
  return prisma.contenu.findFirst({ where: { estContenuDeRepli: true }, include: { sponsor: true } });
}

export async function definirContenuDeRepli(id: string) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.contenu.findUnique({ where: { id } });
    if (!existing) throw new AppError('Contenu non trouvé', 404);
    // Un repli doit pouvoir tourner en boucle pour combler un trou de durée
    // arbitraire : un spot pub de 30 s ou un habillage ne conviennent pas.
    if (existing.typeContenu !== 'VIDEO_BOUCLE') {
      throw new AppError('Seul un contenu de type VIDEO_BOUCLE peut servir de repli d\'antenne', 400);
    }
    await tx.contenu.updateMany({ where: { estContenuDeRepli: true }, data: { estContenuDeRepli: false } });
    return tx.contenu.update({ where: { id }, data: { estContenuDeRepli: true }, include: { sponsor: true } });
  });
}

export async function retirerContenuDeRepli(id: string) {
  const existing = await prisma.contenu.findUnique({ where: { id } });
  if (!existing) throw new AppError('Contenu non trouvé', 404);
  return prisma.contenu.update({ where: { id }, data: { estContenuDeRepli: false }, include: { sponsor: true } });
}
