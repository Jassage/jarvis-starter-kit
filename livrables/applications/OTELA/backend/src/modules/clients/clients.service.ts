import prisma from '../../config/database';
import { AppError } from '../../middlewares/errorHandler.middleware';

// Un seul profil client pour toute la chaîne — réutilisé aux réservations suivantes,
// identifié par email (clé de dédoublonnage naturelle pour un client sans compte).
export async function findOrCreateClient(data: { nom: string; telephone: string; email: string }) {
  const existant = await prisma.client.findUnique({ where: { email: data.email } });
  if (existant) {
    // Les coordonnées peuvent évoluer d'une réservation à l'autre (nouveau numéro...).
    return prisma.client.update({
      where: { id: existant.id },
      data: { nom: data.nom, telephone: data.telephone },
    });
  }
  return prisma.client.create({ data });
}

export async function getClientAvecHistorique(id: string) {
  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      reservations: {
        include: { etablissement: true, chambre: { include: { typeChambre: true } } },
        orderBy: { dateArrivee: 'desc' },
      },
    },
  });
  if (!client) throw new AppError('Client non trouvé', 404);
  return client;
}
