import { StatutTacheMenage } from '@prisma/client';
import prisma from '../../config/database';
import { AppError } from '../../middlewares/errorHandler.middleware';

export async function listTaches(etablissementId: string, statut?: StatutTacheMenage) {
  return prisma.tacheMenage.findMany({
    where: {
      chambre: { etablissementId },
      ...(statut ? { statut } : {}),
    },
    include: { chambre: { include: { typeChambre: true } }, employeAssigne: { select: { id: true, nom: true } } },
    orderBy: { dateAssignation: 'desc' },
  });
}

export async function listEmployesMenage(etablissementId: string) {
  return prisma.employe.findMany({
    where: { etablissementId, role: 'MENAGE', isActive: true },
    select: { id: true, nom: true },
    orderBy: { nom: 'asc' },
  });
}

export async function updateTache(id: string, etablissementId: string | null | undefined, data: { statut?: StatutTacheMenage; employeAssigneId?: string | null }) {
  const tache = await prisma.tacheMenage.findUnique({ where: { id }, include: { chambre: true } });
  if (!tache) throw new AppError('Tâche non trouvée', 404);
  if (etablissementId && tache.chambre.etablissementId !== etablissementId) {
    throw new AppError('Cette tâche n\'appartient pas à votre établissement', 403);
  }

  if (data.statut === 'TERMINE') {
    return prisma.$transaction(async (tx) => {
      const updTache = await tx.tacheMenage.updateMany({
        where: { id, statut: { not: 'TERMINE' } },
        data,
      });
      if (updTache.count === 0) throw new AppError('Cette tâche est déjà terminée', 409);

      // CAS : ne remet la chambre disponible que si elle était bien en nettoyage —
      // évite d'écraser un statut MAINTENANCE posé entre-temps par un administrateur.
      await tx.chambre.updateMany({
        where: { id: tache.chambreId, statut: 'NETTOYAGE_EN_COURS' },
        data: { statut: 'DISPONIBLE' },
      });

      return tx.tacheMenage.findUnique({
        where: { id },
        include: { chambre: { include: { typeChambre: true } }, employeAssigne: { select: { id: true, nom: true } } },
      });
    });
  }

  await prisma.tacheMenage.update({ where: { id }, data });
  return prisma.tacheMenage.findUnique({
    where: { id },
    include: { chambre: { include: { typeChambre: true } }, employeAssigne: { select: { id: true, nom: true } } },
  });
}
