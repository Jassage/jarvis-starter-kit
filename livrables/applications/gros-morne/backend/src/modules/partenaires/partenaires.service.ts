import { CategoriePartenaire, EmplacementAffichage, NiveauPartenaire, StatutPublication } from '@prisma/client';
import prisma from '../../config/database';
import { AppError } from '../../types';

interface PartenaireInput {
  nom: string;
  categorie: CategoriePartenaire;
  niveau?: NiveauPartenaire;
  lienSiteWeb?: string;
  logoId?: string;
  emplacements: EmplacementAffichage[];
  statutPublication: StatutPublication;
  ordre: number;
}

export async function listPublique(emplacement?: EmplacementAffichage) {
  return prisma.partenaire.findMany({
    where: {
      statutPublication: 'PUBLIE',
      ...(emplacement && { emplacements: { has: emplacement } }),
    },
    orderBy: { ordre: 'asc' },
    include: { logo: true },
  });
}

export async function listAdmin() {
  return prisma.partenaire.findMany({
    orderBy: { ordre: 'asc' },
    include: { logo: true },
  });
}

export async function create(data: PartenaireInput) {
  return prisma.partenaire.create({
    data: {
      nom: data.nom,
      categorie: data.categorie,
      niveau: data.niveau,
      lienSiteWeb: data.lienSiteWeb,
      logoId: data.logoId,
      emplacements: data.emplacements,
      statutPublication: data.statutPublication,
      ordre: data.ordre,
    },
    include: { logo: true },
  });
}

export async function update(id: string, data: Partial<PartenaireInput>) {
  const existing = await prisma.partenaire.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, 'Partenaire introuvable');

  return prisma.partenaire.update({
    where: { id },
    data: {
      ...(data.nom !== undefined && { nom: data.nom }),
      ...(data.categorie !== undefined && { categorie: data.categorie }),
      ...(data.niveau !== undefined && { niveau: data.niveau }),
      ...(data.lienSiteWeb !== undefined && { lienSiteWeb: data.lienSiteWeb }),
      ...(data.logoId !== undefined && { logoId: data.logoId }),
      ...(data.emplacements !== undefined && { emplacements: data.emplacements }),
      ...(data.statutPublication !== undefined && { statutPublication: data.statutPublication }),
      ...(data.ordre !== undefined && { ordre: data.ordre }),
    },
    include: { logo: true },
  });
}

export async function remove(id: string) {
  const existing = await prisma.partenaire.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, 'Partenaire introuvable');
  await prisma.partenaire.delete({ where: { id } });
}
