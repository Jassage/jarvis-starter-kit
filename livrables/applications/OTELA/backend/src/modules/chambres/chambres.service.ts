import { Devise, StatutChambre, TypeSejour } from '@prisma/client';
import prisma from '../../config/database';
import { AppError } from '../../middlewares/errorHandler.middleware';
import { supprimerFichierDepuisUrl } from '../../middlewares/upload.middleware';

function requireEtablissementId(etablissementId: string | null | undefined): string {
  if (!etablissementId) throw new AppError('etablissementId requis', 400);
  return etablissementId;
}

interface ChampsType {
  nombreLits?: number;
  equipements?: string[];
  superficie?: number | null;
}

// Photos incluses et ordonnées : le site public affiche d'abord la principale, puis
// la galerie dans l'ordre choisi.
const INCLUDE_TYPE = {
  tarifs: { orderBy: { dateDebutSaison: 'desc' } },
  photos: { orderBy: [{ estPrincipale: 'desc' }, { ordre: 'asc' }] },
} satisfies import('@prisma/client').Prisma.TypeChambreInclude;

// ─── Types de chambres ───

export async function listTypesChambres(etablissementId: string) {
  return prisma.typeChambre.findMany({
    where: { etablissementId },
    include: INCLUDE_TYPE,
    orderBy: { nom: 'asc' },
  });
}

export async function getTypeChambre(id: string) {
  const type = await prisma.typeChambre.findUnique({ where: { id }, include: INCLUDE_TYPE });
  if (!type) throw new AppError('Type de chambre non trouvé', 404);
  return type;
}

export async function createTypeChambre(
  etablissementId: string | null | undefined,
  data: { nom: string; capaciteMax: number; description?: string } & ChampsType
) {
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

export async function updateTypeChambre(
  id: string,
  etablissementId: string | null | undefined,
  data: Partial<{ nom: string; capaciteMax: number; description: string } & ChampsType>
) {
  await assertTypeBelongsTo(id, etablissementId);
  return prisma.typeChambre.update({ where: { id }, data });
}

// ─── Photos de type de chambre ───

// Ajout de plusieurs photos en une fois. La première photo devient principale s'il
// n'en existe encore aucune, pour que le site public ait toujours une image à
// afficher sans intervention manuelle.
export async function ajouterPhotos(
  typeChambreId: string,
  etablissementId: string | null | undefined,
  photos: { url: string; legende?: string | null }[]
) {
  await assertTypeBelongsTo(typeChambreId, etablissementId);
  const dejaUnePrincipale = (await prisma.photoChambre.count({ where: { typeChambreId, estPrincipale: true } })) > 0;
  const dernierOrdre = await prisma.photoChambre.aggregate({ where: { typeChambreId }, _max: { ordre: true } });
  let ordre = (dernierOrdre._max.ordre ?? -1) + 1;

  await prisma.$transaction(
    photos.map((p, index) =>
      prisma.photoChambre.create({
        data: {
          typeChambreId,
          url: p.url,
          legende: p.legende ?? null,
          ordre: ordre++,
          estPrincipale: !dejaUnePrincipale && index === 0,
        },
      })
    )
  );

  return getTypeChambre(typeChambreId);
}

async function trouverPhotoGeree(photoId: string, etablissementId: string | null | undefined) {
  const photo = await prisma.photoChambre.findUnique({ where: { id: photoId }, include: { typeChambre: true } });
  if (!photo) throw new AppError('Photo non trouvée', 404);
  if (etablissementId && photo.typeChambre.etablissementId !== etablissementId) {
    throw new AppError('Cette photo n\'appartient pas à votre établissement', 403);
  }
  return photo;
}

// Invariant « au plus une photo principale par type » garanti en transaction : on
// retire d'abord le drapeau des autres photos du même type, on le pose ensuite sur
// la cible — même pattern que definirContenuDeRepli sur ANTENN.
export async function modifierPhoto(
  photoId: string,
  etablissementId: string | null | undefined,
  data: { legende?: string | null; ordre?: number; estPrincipale?: boolean }
) {
  const photo = await trouverPhotoGeree(photoId, etablissementId);

  await prisma.$transaction(async (tx) => {
    if (data.estPrincipale === true) {
      await tx.photoChambre.updateMany({
        where: { typeChambreId: photo.typeChambreId, id: { not: photoId } },
        data: { estPrincipale: false },
      });
    }
    await tx.photoChambre.update({
      where: { id: photoId },
      data: {
        ...(data.legende !== undefined && { legende: data.legende }),
        ...(data.ordre !== undefined && { ordre: data.ordre }),
        ...(data.estPrincipale !== undefined && { estPrincipale: data.estPrincipale }),
      },
    });
  });

  return getTypeChambre(photo.typeChambreId);
}

export async function supprimerPhoto(photoId: string, etablissementId: string | null | undefined) {
  const photo = await trouverPhotoGeree(photoId, etablissementId);
  const etaitPrincipale = photo.estPrincipale;

  await prisma.photoChambre.delete({ where: { id: photoId } });
  // Le fichier disque suit la ligne supprimée, sinon les orphelins s'accumulent.
  supprimerFichierDepuisUrl(photo.url);

  // Si on vient de retirer la photo principale, promouvoir la suivante pour que le
  // site public garde une image de couverture.
  if (etaitPrincipale) {
    const suivante = await prisma.photoChambre.findFirst({
      where: { typeChambreId: photo.typeChambreId },
      orderBy: { ordre: 'asc' },
    });
    if (suivante) {
      await prisma.photoChambre.update({ where: { id: suivante.id }, data: { estPrincipale: true } });
    }
  }

  return getTypeChambre(photo.typeChambreId);
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

// Bascule maintenance, réservée au rôle MAINTENANCE (et à la direction). Volontairement
// étroite : entrer en maintenance exige une chambre DISPONIBLE (ne jamais écraser une
// chambre OCCUPEE/RESERVEE/NETTOYAGE, ce qui masquerait un séjour en cours) ; en sortir
// la ramène à DISPONIBLE. Les statuts opérationnels (occupée, nettoyage) restent gérés
// par la réception et le ménage, jamais par ici.
export async function basculerMaintenance(id: string, etablissementId: string | null | undefined, enMaintenance: boolean) {
  const chambre = await prisma.chambre.findUnique({ where: { id } });
  if (!chambre) throw new AppError('Chambre non trouvée', 404);
  if (etablissementId && chambre.etablissementId !== etablissementId) {
    throw new AppError('Cette chambre n\'appartient pas à votre établissement', 403);
  }

  if (enMaintenance) {
    if (chambre.statut !== StatutChambre.DISPONIBLE) {
      throw new AppError('Seule une chambre disponible peut être mise en maintenance', 409);
    }
    return prisma.chambre.update({ where: { id }, data: { statut: StatutChambre.MAINTENANCE } });
  }

  if (chambre.statut !== StatutChambre.MAINTENANCE) {
    throw new AppError('Cette chambre n\'est pas en maintenance', 409);
  }
  return prisma.chambre.update({ where: { id }, data: { statut: StatutChambre.DISPONIBLE } });
}
