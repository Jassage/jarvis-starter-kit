import { CategorieHonneur, Locale } from '@prisma/client';
import prisma from '../../config/database';
import { AppError } from '../../types';

interface TraductionInput {
  locale: Locale;
  domaine: string;
  biographie: string;
  realisations: string[];
  citation?: string;
}

interface PersonnaliteInput {
  nom: string;
  periode?: string;
  photoUrl?: string;
  categorie: CategorieHonneur;
  dateNaissance?: Date;
  lieuNaissance?: string;
  nationalite?: string;
  profession?: string;
  periodeActivite?: string;
  ordre: number;
  traductions: TraductionInput[];
}

const includeDetail = {
  traductions: true,
  etapes: { include: { traductions: true }, orderBy: { ordre: 'asc' as const } },
  photos: { include: { media: true }, orderBy: { ordre: 'asc' as const } },
};

export async function list(categorie?: CategorieHonneur) {
  return prisma.personnalite.findMany({
    where: { ...(categorie && { categorie }) },
    orderBy: { ordre: 'asc' },
    include: { traductions: true },
  });
}

export async function getById(id: string) {
  const personnalite = await prisma.personnalite.findUnique({
    where: { id },
    include: includeDetail,
  });
  if (!personnalite) throw new AppError(404, 'Personnalité introuvable');
  return personnalite;
}

interface EtapeInput {
  annee: string;
  ordre?: number;
  traductions: { locale: Locale; titre: string; description: string }[];
}

export async function ajouterEtape(personnaliteId: string, data: EtapeInput) {
  const existing = await prisma.personnalite.findUnique({ where: { id: personnaliteId } });
  if (!existing) throw new AppError(404, 'Personnalité introuvable');
  return prisma.personnaliteEtape.create({
    data: {
      personnaliteId,
      annee: data.annee,
      ordre: data.ordre ?? 0,
      traductions: { create: data.traductions },
    },
    include: { traductions: true },
  });
}

export async function modifierEtape(etapeId: string, data: Partial<EtapeInput>) {
  const existing = await prisma.personnaliteEtape.findUnique({ where: { id: etapeId } });
  if (!existing) throw new AppError(404, 'Étape introuvable');
  return prisma.personnaliteEtape.update({
    where: { id: etapeId },
    data: {
      ...(data.annee !== undefined && { annee: data.annee }),
      ...(data.ordre !== undefined && { ordre: data.ordre }),
      ...(data.traductions && {
        traductions: {
          upsert: data.traductions.map((t) => ({
            where: { etapeId_locale: { etapeId, locale: t.locale } },
            create: t,
            update: { titre: t.titre, description: t.description },
          })),
        },
      }),
    },
    include: { traductions: true },
  });
}

export async function supprimerEtape(etapeId: string) {
  const existing = await prisma.personnaliteEtape.findUnique({ where: { id: etapeId } });
  if (!existing) throw new AppError(404, 'Étape introuvable');
  await prisma.personnaliteEtape.delete({ where: { id: etapeId } });
}

export async function ajouterPhoto(personnaliteId: string, mediaId: string, ordre = 0) {
  const existing = await prisma.personnalite.findUnique({ where: { id: personnaliteId } });
  if (!existing) throw new AppError(404, 'Personnalité introuvable');
  return prisma.personnalitePhoto.create({
    data: { personnaliteId, mediaId, ordre },
    include: { media: true },
  });
}

export async function supprimerPhoto(photoId: string) {
  const existing = await prisma.personnalitePhoto.findUnique({ where: { id: photoId } });
  if (!existing) throw new AppError(404, 'Photo introuvable');
  await prisma.personnalitePhoto.delete({ where: { id: photoId } });
}

export async function create(data: PersonnaliteInput) {
  return prisma.personnalite.create({
    data: {
      nom: data.nom,
      periode: data.periode,
      photoUrl: data.photoUrl,
      categorie: data.categorie,
      dateNaissance: data.dateNaissance,
      lieuNaissance: data.lieuNaissance,
      nationalite: data.nationalite,
      profession: data.profession,
      periodeActivite: data.periodeActivite,
      ordre: data.ordre,
      traductions: {
        create: data.traductions.map((t) => ({
          locale: t.locale,
          domaine: t.domaine,
          biographie: t.biographie,
          realisations: t.realisations,
          citation: t.citation || null,
        })),
      },
    },
    include: { traductions: true },
  });
}

export async function update(
  id: string,
  data: Partial<Omit<PersonnaliteInput, 'traductions'>> & { traductions?: TraductionInput[] }
) {
  const existing = await prisma.personnalite.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, 'Personnalité introuvable');

  return prisma.personnalite.update({
    where: { id },
    data: {
      ...(data.nom !== undefined && { nom: data.nom }),
      ...(data.periode !== undefined && { periode: data.periode }),
      ...(data.photoUrl !== undefined && { photoUrl: data.photoUrl }),
      ...(data.categorie !== undefined && { categorie: data.categorie }),
      ...(data.dateNaissance !== undefined && { dateNaissance: data.dateNaissance }),
      ...(data.lieuNaissance !== undefined && { lieuNaissance: data.lieuNaissance }),
      ...(data.nationalite !== undefined && { nationalite: data.nationalite }),
      ...(data.profession !== undefined && { profession: data.profession }),
      ...(data.periodeActivite !== undefined && { periodeActivite: data.periodeActivite }),
      ...(data.ordre !== undefined && { ordre: data.ordre }),
      ...(data.traductions && {
        traductions: {
          upsert: data.traductions.map((t) => ({
            where: { personnaliteId_locale: { personnaliteId: id, locale: t.locale } },
            create: { locale: t.locale, domaine: t.domaine, biographie: t.biographie, realisations: t.realisations, citation: t.citation || null },
            update: { domaine: t.domaine, biographie: t.biographie, realisations: t.realisations, citation: t.citation || null },
          })),
        },
      }),
    },
    include: { traductions: true },
  });
}

export async function remove(id: string) {
  const existing = await prisma.personnalite.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, 'Personnalité introuvable');
  await prisma.personnalite.delete({ where: { id } });
}
