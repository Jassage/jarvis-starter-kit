import prisma from '../../config/database';
import { AppError } from '../../types';

export async function getOne(page: string) {
  return prisma.pageHeroImage.findUnique({ where: { page }, include: { media: true } });
}

export async function listAdmin() {
  return prisma.pageHeroImage.findMany({ include: { media: true } });
}

export async function upsert(page: string, mediaId: string) {
  const media = await prisma.media.findUnique({ where: { id: mediaId } });
  if (!media) throw new AppError(404, 'Média introuvable');

  return prisma.pageHeroImage.upsert({
    where: { page },
    create: { page, mediaId },
    update: { mediaId },
    include: { media: true },
  });
}

export async function remove(page: string) {
  const existing = await prisma.pageHeroImage.findUnique({ where: { page } });
  if (!existing) throw new AppError(404, 'Image introuvable pour cette page');
  await prisma.pageHeroImage.delete({ where: { page } });
}
