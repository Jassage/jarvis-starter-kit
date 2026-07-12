import prisma from '../../config/database';
import { AppError } from '../../middlewares/errorHandler.middleware';
import { Devise } from '@prisma/client';

// Un seul déploiement OTELA sert une seule chaîne cliente — le modèle Chaine reste
// distinct de Etablissement (comme prescrit) pour ne pas fermer la porte à plusieurs
// chaînes plus tard, mais rien dans cette Phase 1 n'a besoin d'en gérer plusieurs.
export async function getDefaultChaine() {
  const chaine = await prisma.chaine.findFirst();
  if (!chaine) throw new AppError('Aucune chaîne configurée — lancez le seed', 500);
  return chaine;
}

export async function listEtablissements(actifOnly: boolean) {
  return prisma.etablissement.findMany({
    where: actifOnly ? { actif: true } : undefined,
    orderBy: { nom: 'asc' },
  });
}

export async function getEtablissement(id: string) {
  const etab = await prisma.etablissement.findUnique({ where: { id } });
  if (!etab) throw new AppError('Établissement non trouvé', 404);
  return etab;
}

export async function createEtablissement(data: {
  nom: string;
  adresse: string;
  commune: string;
  departement: string;
  devisesAcceptees: Devise[];
}) {
  const chaine = await getDefaultChaine();
  return prisma.etablissement.create({
    data: { ...data, chaineId: chaine.id },
  });
}

export async function updateEtablissement(id: string, data: Partial<{
  nom: string;
  adresse: string;
  commune: string;
  departement: string;
  devisesAcceptees: Devise[];
  actif: boolean;
}>) {
  await getEtablissement(id);
  return prisma.etablissement.update({ where: { id }, data });
}
