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

// Champs de la fiche publique, communs à la création et à la mise à jour.
export interface FicheEtablissement {
  logoUrl?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  telephone?: string | null;
  email?: string | null;
  siteWeb?: string | null;
  description?: string | null;
  equipements?: string[];
  heureCheckIn?: string;
  heureCheckOut?: string;
  politiqueAnnulation?: string | null;
  devisePrincipale?: Devise;
  fuseauHoraire?: string;
}

// La devise principale doit faire partie des devises acceptées, sinon le site public
// afficherait des prix dans une devise que l'établissement n'encaisse pas. Vérifié
// ici, dans le service, plutôt qu'en Zod : la contrainte croise deux champs et doit
// tenir compte de l'état déjà en base lors d'une mise à jour partielle.
function assertDevisePrincipaleValide(devisePrincipale: Devise | undefined, devisesAcceptees: Devise[] | undefined) {
  if (!devisePrincipale) return;
  if (!devisesAcceptees || !devisesAcceptees.includes(devisePrincipale)) {
    throw new AppError('La devise principale doit faire partie des devises acceptées', 400);
  }
}

export async function createEtablissement(data: {
  nom: string;
  adresse: string;
  commune: string;
  departement: string;
  devisesAcceptees: Devise[];
} & FicheEtablissement) {
  assertDevisePrincipaleValide(data.devisePrincipale, data.devisesAcceptees);
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
} & FicheEtablissement>) {
  const existant = await getEtablissement(id);

  // Sur une mise à jour partielle, la validité se juge sur la combinaison finale :
  // la devise principale peut être fournie seule (contre les devises déjà en base)
  // ou en même temps qu'une nouvelle liste de devises acceptées.
  const devisesFinales = data.devisesAcceptees ?? existant.devisesAcceptees;
  const deviseFinale = data.devisePrincipale ?? existant.devisePrincipale;
  assertDevisePrincipaleValide(deviseFinale, devisesFinales);

  return prisma.etablissement.update({ where: { id }, data });
}
