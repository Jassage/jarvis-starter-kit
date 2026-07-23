import prisma from '../../config/database';
import { AppError } from '../../middlewares/errorHandler.middleware';
import { getReservationPublique } from '../reservations/reservations.service';

interface SoumettreAvisInput {
  reference: string;
  email: string;
  note: number;
  commentaire?: string;
}

// Réutilise la même vérification référence+email que la consultation publique
// (reservations.service.ts::getReservationPublique) — même garde anti-énumération,
// message identique si la référence ou l'email ne correspond pas. Un avis ne peut
// être soumis que pour un séjour réellement terminé, jamais avant ; l'unicité par
// séjour est garantie par la contrainte @unique sur Avis.reservationId, vérifiée ici
// en amont pour renvoyer un message clair plutôt que l'erreur Prisma brute.
export async function soumettreAvis(data: SoumettreAvisInput) {
  const reservation = await getReservationPublique(data.reference, data.email);

  if (reservation.statut !== 'TERMINEE') {
    throw new AppError('Le séjour doit être terminé pour laisser un avis', 400);
  }

  const existant = await prisma.avis.findUnique({ where: { reservationId: reservation.id } });
  if (existant) throw new AppError('Un avis a déjà été soumis pour ce séjour', 409);

  return prisma.avis.create({
    data: {
      reservationId: reservation.id,
      etablissementId: reservation.etablissementId,
      note: data.note,
      commentaire: data.commentaire,
    },
  });
}

export async function listAvisGestion(etablissementId: string | null | undefined) {
  return prisma.avis.findMany({
    where: etablissementId ? { etablissementId } : undefined,
    include: {
      reservation: { select: { reference: true, client: { select: { nom: true } } } },
      etablissement: { select: { nom: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

interface ModererAvisInput {
  visible?: boolean;
  reponseDirection?: string;
}

export async function modererAvis(id: string, etablissementId: string | null | undefined, data: ModererAvisInput) {
  const avis = await prisma.avis.findUnique({ where: { id } });
  if (!avis) throw new AppError('Avis non trouvé', 404);
  if (etablissementId && avis.etablissementId !== etablissementId) {
    throw new AppError('Cet avis n\'appartient pas à votre établissement', 403);
  }

  return prisma.avis.update({
    where: { id },
    data: {
      ...(data.visible !== undefined && { visible: data.visible }),
      ...(data.reponseDirection !== undefined && { reponseDirection: data.reponseDirection, reponseDate: new Date() }),
    },
  });
}
